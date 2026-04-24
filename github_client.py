import httpx
from fastapi import HTTPException
from config import GITHUB_TOKEN, GITHUB_API_BASE

def get_headers() -> dict:
    return {
        "Authorization": f"Bearer {GITHUB_TOKEN}",
        "Accept": "application/vnd.github+json",
        "X-GitHub-Api-Version": "2022-11-28"
    }


def handle_github_response(response: httpx.Response) -> dict:
    if response.status_code == 401:
        raise HTTPException(status_code=401, detail="Invalid or expired GitHub token.")
    if response.status_code == 403:
        raise HTTPException(status_code=403, detail="GitHub API rate limit exceeded or access forbidden.")
    if response.status_code == 404:
        raise HTTPException(status_code=404, detail="Resource not found on GitHub.")
    if response.status_code == 422:
        raise HTTPException(status_code=422, detail=f"Validation error from GitHub: {response.json()}")
    if not response.is_success:
        raise HTTPException(status_code=response.status_code, detail=f"GitHub API error: {response.text}")
    return response.json()


# ─── Repositories ────────────────────────────────────────────────────────────

def fetch_user_repos(username: str) -> list:
    url = f"{GITHUB_API_BASE}/users/{username}/repos"
    with httpx.Client() as client:
        response = client.get(url, headers=get_headers(), params={"per_page": 30, "sort": "updated"})
    return handle_github_response(response)


def fetch_org_repos(org: str) -> list:
    url = f"{GITHUB_API_BASE}/orgs/{org}/repos"
    with httpx.Client() as client:
        response = client.get(url, headers=get_headers(), params={"per_page": 30, "sort": "updated"})
    return handle_github_response(response)


# ─── Issues ──────────────────────────────────────────────────────────────────

def fetch_repo_issues(owner: str, repo: str, state: str = "open") -> list:
    url = f"{GITHUB_API_BASE}/repos/{owner}/{repo}/issues"
    with httpx.Client() as client:
        response = client.get(url, headers=get_headers(), params={"state": state, "per_page": 30})
    return handle_github_response(response)


def create_repo_issue(owner: str, repo: str, title: str, body: str, labels: list) -> dict:
    url = f"{GITHUB_API_BASE}/repos/{owner}/{repo}/issues"
    payload = {"title": title, "body": body, "labels": labels}
    with httpx.Client() as client:
        response = client.post(url, headers=get_headers(), json=payload)
    return handle_github_response(response)


# ─── Commits ─────────────────────────────────────────────────────────────────

def fetch_repo_commits(owner: str, repo: str, branch: str = "main") -> list:
    url = f"{GITHUB_API_BASE}/repos/{owner}/{repo}/commits"
    with httpx.Client() as client:
        response = client.get(url, headers=get_headers(), params={"sha": branch, "per_page": 20})
    return handle_github_response(response)


# ─── File Contents ───────────────────────────────────────────────────────────

def fetch_file_content(owner: str, repo: str, file_path: str, branch: str = "main") -> dict:
    """
    Fetch a file's raw content from a GitHub repository.
    Returns a dict with: content (decoded text), language, file_path, size, url
    """
    import base64

    url = f"{GITHUB_API_BASE}/repos/{owner}/{repo}/contents/{file_path}"
    with httpx.Client() as client:
        response = client.get(url, headers=get_headers(), params={"ref": branch})

    data = handle_github_response(response)

    # GitHub returns file content as base64 encoded
    if data.get("type") != "file":
        raise HTTPException(
            status_code=400,
            detail=f"'{file_path}' is not a file. Please provide a path to a file, not a directory."
        )

    if data.get("size", 0) > 100000:  # 100KB limit
        raise HTTPException(
            status_code=400,
            detail="File is too large to review (max 100KB). Please choose a smaller file."
        )

    # Decode base64 content
    encoded_content = data["content"].replace("\n", "")
    decoded_content = base64.b64decode(encoded_content).decode("utf-8", errors="replace")

    # Guess language from file extension
    extension_map = {
        "py": "python", "js": "javascript", "ts": "typescript",
        "jsx": "javascript", "tsx": "typescript", "java": "java",
        "cpp": "cpp", "c": "c", "cs": "csharp", "go": "go",
        "rb": "ruby", "php": "php", "rs": "rust", "kt": "kotlin",
        "swift": "swift", "html": "html", "css": "css", "sql": "sql",
        "sh": "bash", "yaml": "yaml", "yml": "yaml", "json": "json",
        "md": "markdown"
    }
    extension = file_path.split(".")[-1].lower() if "." in file_path else "plaintext"
    language = extension_map.get(extension, "plaintext")

    return {
        "content": decoded_content,
        "language": language,
        "file_path": file_path,
        "size_bytes": data["size"],
        "url": data["html_url"],
        "sha": data["sha"]
    }


def list_repo_files(owner: str, repo: str, path: str = "", branch: str = "main") -> list:
    """
    List files and folders at a given path in a repo.
    Useful so users can browse what files are available to review.
    """
    url = f"{GITHUB_API_BASE}/repos/{owner}/{repo}/contents/{path}"
    with httpx.Client() as client:
        response = client.get(url, headers=get_headers(), params={"ref": branch})
    data = handle_github_response(response)

    return [
        {
            "name": item["name"],
            "path": item["path"],
            "type": item["type"],   # "file" or "dir"
            "size": item.get("size", 0),
            "url": item["html_url"]
        }
        for item in data
    ]