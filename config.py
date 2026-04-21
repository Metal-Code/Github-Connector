import os
from dotenv import load_dotenv

load_dotenv()  # Reads variables from .env file

GITHUB_TOKEN = os.getenv("GITHUB_TOKEN")
GITHUB_API_BASE = "https://api.github.com"

if not GITHUB_TOKEN:
    raise EnvironmentError(
        "GITHUB_TOKEN is not set. Please create a .env file with your GitHub Personal Access Token."
    )