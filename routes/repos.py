from fastapi import APIRouter, Query
from github_client import fetch_user_repos, fetch_org_repos

router = APIRouter()


@router.get("/user")
def get_user_repos(username: str = Query(..., description="GitHub username e.g. octocat")):
    """
    Fetch all public repositories for a GitHub user.

    Example: GET /repos/user?username=octocat
    """
    repos = fetch_user_repos(username)
    return {
        "username": username,
        "count": len(repos),
        "repositories": [
            {
                "name": r["name"],
                "full_name": r["full_name"],
                "description": r["description"],
                "url": r["html_url"],
                "language": r["language"],
                "stars": r["stargazers_count"],
                "forks": r["forks_count"],
                "visibility": r["visibility"],
                "updated_at": r["updated_at"]
            }
            for r in repos
        ]
    }


@router.get("/org")
def get_org_repos(org: str = Query(..., description="GitHub organization name e.g. microsoft")):
    """
    Fetch all repositories for a GitHub organization.

    Example: GET /repos/org?org=microsoft
    """
    repos = fetch_org_repos(org)
    return {
        "organization": org,
        "count": len(repos),
        "repositories": [
            {
                "name": r["name"],
                "full_name": r["full_name"],
                "description": r["description"],
                "url": r["html_url"],
                "language": r["language"],
                "stars": r["stargazers_count"],
                "forks": r["forks_count"],
                "visibility": r["visibility"],
                "updated_at": r["updated_at"]
            }
            for r in repos
        ]
    }