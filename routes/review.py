from fastapi import APIRouter
from pydantic import BaseModel, Field
from typing import Optional
from ai_client import review_code

router = APIRouter()


# ─── Request Schema ───────────────────────────────────────────────────────────

class CodeReviewRequest(BaseModel):
    code: str = Field(
        ...,
        description="The code you want reviewed",
        example="def add(a, b):\n    return a + b"
    )
    language: Optional[str] = Field(
        "python",
        description="Programming language of the code",
        example="python"
    )
    context: Optional[str] = Field(
        None,
        description="Optional: describe what this code is supposed to do",
        example="This function is used to process payments"
    )


# ─── Route ───────────────────────────────────────────────────────────────────

@router.post("/")
def review(payload: CodeReviewRequest):
    """
    Submit code for an AI-powered senior dev code review.

    Returns structured JSON with:
    - overall_rating (1–10)
    - summary
    - bugs (with severity and fix suggestions)
    - suggestions (readability, performance, security, best practices)
    - positives (what was done well)

    Example POST body:
    {
        "code": "def divide(a, b):\\n    return a / b",
        "language": "python",
        "context": "Utility function for division"
    }
    """
    code_to_review = payload.code

    # Append context to code if provided so the AI understands intent
    if payload.context:
        code_to_review = f"# Context: {payload.context}\n\n{payload.code}"

    result = review_code(code=code_to_review, language=payload.language)

    return {
        "language": payload.language,
        "context": payload.context,
        "review": result
    }