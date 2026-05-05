from fastapi import APIRouter
from pydantic import BaseModel, Field
from typing import Optional
from ai_client import review_code
from github_client import fetch_file_content, list_repo_files

router = APIRouter()


class CodeReviewRequest(BaseModel):
    code: str = Field(..., description="The code to review")
    language: Optional[str] = Field("python", description="Programming language")
    context: Optional[str] = Field(None, description="Optional context about what this code does")


class RepoReviewRequest(BaseModel):
    owner: str = Field(..., example="octocat")
    repo: str = Field(..., example="Hello-World")
    file_path: str = Field(..., example="src/main.py")
    branch: Optional[str] = Field("main")
    context: Optional[str] = Field(None)


@router.post("/")
def review(payload: CodeReviewRequest):
    """
    Paste code directly and get a structured AI code review.

    Returns:
    - total_score (0-100)
    - code_issues list with line numbers, severity, fix_code
    - suggestions with before/after code
    - positives
    - metrics (bug counts by severity)
    """
    code_to_review = payload.code
    if payload.context:
        code_to_review = f"# Context: {payload.context}\n\n{payload.code}"

    result = review_code(code=code_to_review, language=payload.language)

    return {
        "language": result.get("language", payload.language),
        "context": payload.context,
        "review": result
    }


@router.post("/repo")
def review_from_repo(payload: RepoReviewRequest):
    """
    Provide a GitHub repo + file path — file is fetched automatically and reviewed by AI.

    Returns:
    - file metadata (owner, repo, path, language, size, github_url)
    - review with total_score, code_issues, suggestions, positives, metrics
    """
    # Step 1: Fetch file from GitHub
    file_data = fetch_file_content(
        owner=payload.owner,
        repo=payload.repo,
        file_path=payload.file_path,
        branch=payload.branch
    )

    # Step 2: Build code string with optional context
    code_to_review = file_data["content"]
    if payload.context:
        code_to_review = f"# Context: {payload.context}\n\n{code_to_review}"

    # Step 3: Run AI review
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