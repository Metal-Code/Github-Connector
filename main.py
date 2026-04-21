from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from routes import repos, issues, commits

app = FastAPI(
    title="GitHub Cloud Connector",
    description="A REST API connector for GitHub — fetch repos, manage issues, and more.",
    version="1.0.0"
)

# Allow all origins for development (restrict in production)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register route groups
app.include_router(repos.router, prefix="/repos", tags=["Repositories"])
app.include_router(issues.router, prefix="/issues", tags=["Issues"])
app.include_router(commits.router, prefix="/commits", tags=["Commits"])


@app.get("/", tags=["Health"])
def root():
    return {
        "status": "ok",
        "message": "GitHub Cloud Connector is running.",
        "docs": "/docs"
    }