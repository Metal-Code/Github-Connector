from fastapi import APIRouter, Query
from github_client import fetch_repo_commits

router = APIRouter()


@router.get("/list")
def list_commits(
    owner: str = Query(..., description="Repository owner username or org"),
    repo: str = Query(..., description="Repository name"),
    branch: str = Query("main", description="Branch name to fetch commits from")
):
    """
    Fetch recent commits from a GitHub repository branch.

    Example: GET /commits/list?owner=torvalds&repo=linux&branch=master
    """
    commits = fetch_repo_commits(owner, repo, branch)
    return {
        "owner": owner,
        "repo": repo,
        "branch": branch,
        "count": len(commits),
        "commits": [
            {
                "sha": c["sha"][:7],  # Short SHA like GitHub shows
                "full_sha": c["sha"],
                "message": c["commit"]["message"].split("\n")[0],  # First line only
                "author": c["commit"]["author"]["name"],
                "author_username": c["author"]["login"] if c["author"] else "unknown",
                "date": c["commit"]["author"]["date"],
                "url": c["html_url"]
            }
            for c in commits
        ]
    }