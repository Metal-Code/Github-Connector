from fastapi import APIRouter
from pydantic import BaseModel, Field
from typing import Optional
from ai_client import review_code
from github_client import fetch_file_content, list_repo_files

router = APIRouter()


# ─── Request Schemas ──────────────────────────────────────────────────────────

class CodeReviewRequest(BaseModel):
    code: str = Field(
        ...,
        description="The code you want reviewed",
        example="def divide(a, b):\n    return a / b"
    )
    language: Optional[str] = Field(
        "python",
        description="Programming language of the code",
        example="python"
    )
    context: Optional[str] = Field(
        None,
        description="Optional: describe what this code is supposed to do",
        example="This function handles payment processing"
    )


class RepoReviewRequest(BaseModel):
    owner: str = Field(..., description="GitHub username or org", example="octocat")
    repo: str = Field(..., description="Repository name", example="Hello-World")
    file_path: str = Field(..., description="Path to the file inside the repo", example="src/main.py")
    branch: Optional[str] = Field("main", description="Branch to fetch the file from", example="main")
    context: Optional[str] = Field(None, description="Optional: describe what this file does")


# ─── Routes ──────────────────────────────────────────────────────────────────

@router.post("/")
def review(payload: CodeReviewRequest):
    """
    Paste code directly and get an AI-powered senior dev review.
    """
    code_to_review = payload.code
    if payload.context:
        code_to_review = f"# Context: {payload.context}\n\n{payload.code}"

    result = review_code(code=code_to_review, language=payload.language)
    return {
        "language": payload.language,
        "context": payload.context,
        "review": result
    }


@router.post("/repo")
def review_from_repo(payload: RepoReviewRequest):
    """
    Provide a GitHub repo + file path — file is fetched automatically and reviewed by AI.

    Example POST body:
    {
        "owner": "your-username",
        "repo": "your-repo",
        "file_path": "main.py",
        "branch": "main",
        "context": "This is the FastAPI entry point"
    }
    """
    # Step 1: Fetch the file from GitHub
    file_data = fetch_file_content(
        owner=payload.owner,
        repo=payload.repo,
        file_path=payload.file_path,
        branch=payload.branch
    )

    # Step 2: Prepend context for the AI if provided
    code_to_review = file_data["content"]
    if payload.context:
        code_to_review = f"# Context: {payload.context}\n\n{code_to_review}"

    # Step 3: Send to AI for review
    result = review_code(code=code_to_review, language=file_data["language"])

    return {
        "file": {
            "owner": payload.owner,
            "repo": payload.repo,
            "file_path": file_data["file_path"],
            "branch": payload.branch,
            "language": file_data["language"],
            "size_bytes": file_data["size_bytes"],
            "github_url": file_data["url"]
        },
        "review": result
    }


@router.get("/repo/files")
def list_files(
    owner: str,
    repo: str,
    path: str = "",
    branch: str = "main"
):
    """
    Browse files in a GitHub repo to find paths you can review.

    Example: GET /review/repo/files?owner=octocat&repo=Hello-World
    Use the returned 'path' values as file_path in POST /review/repo
    """
    files = list_repo_files(owner=owner, repo=repo, path=path, branch=branch)
    return {
        "owner": owner,
        "repo": repo,
        "branch": branch,
        "path": path or "/",
        "items": files
    }