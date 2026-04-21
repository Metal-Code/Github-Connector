import httpx
from fastapi import HTTPException
from config import GITHUB_TOKEN, GITHUB_API_BASE

# Reusable headers sent with every GitHub API request
def get_headers() -> dict:
    return {
        "Authorization": f"Bearer {GITHUB_TOKEN}",
        "Accept": "application/vnd.github+json",
        "X-GitHub-Api-Version": "2022-11-28"
    }


def handle_github_response(response: httpx.Response) -> dict:
    """
    Centralized response handler.
    Raises HTTPException with GitHub's error message on failure.
    """
    if response.status_code == 401:
        raise HTTPException(status_code=401, detail="Invalid or expired GitHub token.")
    if response.status_code == 403:
        raise HTTPException(status_code=403, detail="GitHub API rate limit exceeded or access forbidden.")
    if response.status_code == 404:
        raise HTTPException(status_code=404, detail="Resource not found on GitHub.")
    if response.status_code == 422:
        raise HTTPException(status_code=422, detail=f"Validation error from GitHub: {response.json()}")
    if not response.is_success:
        raise HTTPException(
            status_code=response.status_code,
            detail=f"GitHub API error: {response.text}"
        )
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