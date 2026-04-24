import os
from dotenv import load_dotenv

load_dotenv()

GITHUB_TOKEN = os.getenv("GITHUB_TOKEN")
OPENROUTER_API_KEY = os.getenv("OPENROUTER_API_KEY")
GITHUB_API_BASE = "https://api.github.com"

if not GITHUB_TOKEN:
    raise EnvironmentError(
        "GITHUB_TOKEN is not set. Please add it to your .env file."
    )

if not OPENROUTER_API_KEY:
    raise EnvironmentError(
        "OPENROUTER_API_KEY is not set. Please add it to your .env file."
    )