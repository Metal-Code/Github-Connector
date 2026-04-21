from fastapi import APIRouter, Query
from pydantic import BaseModel, Field
from typing import List, Optional
from github_client import fetch_repo_issues, create_repo_issue

router = APIRouter()


# ─── Request Body Schema ─────────────────────────────────────────────────────

class CreateIssueRequest(BaseModel):
    owner: str = Field(..., example="octocat", description="Repository owner (username or org)")
    repo: str = Field(..., example="Hello-World", description="Repository name")
    title: str = Field(..., example="Bug: Login fails on mobile", description="Issue title")
    body: Optional[str] = Field("", example="Steps to reproduce...", description="Issue description")
    labels: Optional[List[str]] = Field([], example=["bug", "help wanted"], description="Labels to attach")


# ─── Routes ──────────────────────────────────────────────────────────────────

@router.get("/list")
def list_issues(
    owner: str = Query(..., description="Repo owner username or org"),
    repo: str = Query(..., description="Repository name"),
    state: str = Query("open", description="Filter by state: open | closed | all")
):
    """
    List issues from a GitHub repository.

    Example: GET /issues/list?owner=octocat&repo=Hello-World&state=open
    """
    issues = fetch_repo_issues(owner, repo, state)

    # Filter out pull requests (GitHub returns PRs as issues too)
    real_issues = [i for i in issues if "pull_request" not in i]

    return {
        "owner": owner,
        "repo": repo,
        "state": state,
        "count": len(real_issues),
        "issues": [
            {
                "number": i["number"],
                "title": i["title"],
                "body": i["body"],
                "state": i["state"],
                "author": i["user"]["login"],
                "labels": [l["name"] for l in i["labels"]],
                "url": i["html_url"],
                "created_at": i["created_at"],
                "updated_at": i["updated_at"]
            }
            for i in real_issues
        ]
    }


@router.post("/create", status_code=201)
def create_issue(payload: CreateIssueRequest):
    """
    Create a new issue in a GitHub repository.

    Example POST body:
    {
        "owner": "octocat",
        "repo": "Hello-World",
        "title": "Something is broken",
        "body": "Here are the steps to reproduce...",
        "labels": ["bug"]
    }
    """
    issue = create_repo_issue(
        owner=payload.owner,
        repo=payload.repo,
        title=payload.title,
        body=payload.body,
        labels=payload.labels
    )
    return {
        "message": "Issue created successfully.",
        "issue": {
            "number": issue["number"],
            "title": issue["title"],
            "url": issue["html_url"],
            "state": issue["state"],
            "created_at": issue["created_at"]
        }
    }