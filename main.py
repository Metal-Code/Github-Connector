from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from routes import repos, issues, commits, review

app = FastAPI(
    title="GitHub Cloud Connector",
    description="A REST API connector for GitHub with AI-powered code review.",
    version="2.0.0"
)

app.add_middleware(
    CORSMiddleware,
    # allow_origins=["*"],
    allow_origins=[
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "https://github-connector-alpha.vercel.app"
    ],
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register route groups
app.include_router(repos.router,   prefix="/repos",   tags=["Repositories"])
app.include_router(issues.router,  prefix="/issues",  tags=["Issues"])
app.include_router(commits.router, prefix="/commits", tags=["Commits"])
app.include_router(review.router,  prefix="/review",  tags=["AI Code Review"])


@app.get("/", tags=["Health"])
def root():
    return {
        "status": "ok",
        "message": "GitHub Cloud Connector is running.",
        "docs": "/docs"
    }