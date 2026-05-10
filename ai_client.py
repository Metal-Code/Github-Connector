import httpx
import json
import re
from fastapi import HTTPException
from config import OPENROUTER_API_KEY

OPENROUTER_BASE = "https://openrouter.ai/api/v1"
MODEL = "openrouter/auto"


def get_headers() -> dict:
    return {
        "Authorization": f"Bearer {OPENROUTER_API_KEY}",
        "Content-Type": "application/json",
        "HTTP-Referer": "http://localhost:8000",
        "X-Title": "CodeReview AI"
    }


SYSTEM_PROMPT = """You are an expert code reviewer. Analyze the provided code and return ONLY a valid JSON object.

Return this EXACT structure with no markdown, no code fences, no explanation outside the JSON:

{
  "total_score": <integer 0-100>,
  "summary": "<2-3 sentence overall assessment of the code quality>",
  "language": "<detected programming language>",
  "code_issues": [
    {
      "id": <integer starting from 1>,
      "line": <line number as integer, or 0 if unknown>,
      "error_code_line": "<the full problematic code block, can be multiple lines if needed>",
      "severity": "<one of: critical | high | medium | low>",
      "category": "<one of: bug | security | performance | style | maintainability>",
      "description": "<clear explanation of what is wrong and why it matters>",
      "fix_code": "<the corrected code snippet that fixes this issue>"
    }
  ],
  "suggestions": [
    {
      "id": <integer starting from 1>,
      "category": "<one of: performance | readability | security | best_practice | maintainability>",
      "description": "<what to improve and why>",
      "before": "<code snippet showing current approach>",
      "after": "<code snippet showing improved approach>"
    }
  ],
  "positives": [
    "<something genuinely done well in the code>"
  ],
  "metrics": {
    "total_bugs": <count of code_issues array>,
    "critical_count": <count of critical severity issues>,
    "high_count": <count of high severity issues>,
    "medium_count": <count of medium severity issues>,
    "low_count": <count of low severity issues>,
    "suggestions_count": <count of suggestions array>
  }
}

STRICT RULES:
- Return ONLY the raw JSON object. No markdown. No ```json fences. No text before or after.
- total_score is 0 to 100. 100 means perfect production-ready code.
- error_code_line must be the actual code from the file, not a description.
- fix_code must be actual working corrected code, not a description.
- metrics.total_bugs must equal the exact length of code_issues array.
- If no issues found, use empty array [] for code_issues.
- If no suggestions, use empty array [] for suggestions.
"""


def clean_json_response(raw: str) -> str:
    """Strip markdown fences and extra whitespace from AI response."""
    raw = raw.strip()
    if raw.startswith("```"):
        lines = raw.split("\n")
        lines = lines[1:]  # Remove ```json or ```
        if lines and lines[-1].strip() == "```":
            lines = lines[:-1]
        raw = "\n".join(lines).strip()
    return raw


def validate_and_fix(data: dict, language: str) -> dict:
    """Ensure all required fields exist with correct types."""

    # Fix total_score
    score = data.get("total_score", 50)
    if isinstance(score, float):
        score = int(score)
    # Convert 0-10 scale to 0-100 if model used wrong scale
    if isinstance(score, int) and score <= 10:
        score = score * 10
    data["total_score"] = max(0, min(100, int(score)))

    # Ensure required fields
    data.setdefault("summary", "Code review completed.")
    data.setdefault("language", language)
    data.setdefault("code_issues", [])
    data.setdefault("suggestions", [])
    data.setdefault("positives", [])

    # Validate each issue
    for i, issue in enumerate(data["code_issues"]):
        issue["id"] = i + 1
        issue.setdefault("line", 0)
        issue.setdefault("error_code_line", "N/A")
        issue.setdefault("severity", "medium")
        issue.setdefault("category", "bug")
        issue.setdefault("description", "No description provided.")
        issue.setdefault("fix_code", "No fix provided.")
        # Normalize severity value
        sev = issue["severity"].lower().strip()
        issue["severity"] = sev if sev in ["critical", "high", "medium", "low"] else "medium"
        # Normalize category
        cat = issue["category"].lower().strip()
        issue["category"] = cat if cat in ["bug", "security", "performance", "style", "maintainability"] else "bug"

    # Validate each suggestion
    for i, sug in enumerate(data["suggestions"]):
        sug["id"] = i + 1
        sug.setdefault("category", "best_practice")
        sug.setdefault("description", "No description provided.")
        sug.setdefault("before", "")
        sug.setdefault("after", "")

    # Always recalculate metrics from actual data
    issues = data["code_issues"]
    data["metrics"] = {
        "total_bugs": len(issues),
        "critical_count": sum(1 for i in issues if i.get("severity") == "critical"),
        "high_count": sum(1 for i in issues if i.get("severity") == "high"),
        "medium_count": sum(1 for i in issues if i.get("severity") == "medium"),
        "low_count": sum(1 for i in issues if i.get("severity") == "low"),
        "suggestions_count": len(data["suggestions"])
    }

    return data


def review_code(code: str, language: str) -> dict:
    user_message = f"Review this {language} code:\n\n{code}"

    payload = {
        "model": MODEL,
        "messages": [
            {"role": "system", "content": SYSTEM_PROMPT},
            {"role": "user", "content": user_message}
        ],
        "temperature": 0.2,
        "max_tokens": 4000
    }

    # Call OpenRouter
    try:
        with httpx.Client(timeout=60.0) as client:
            response = client.post(
                f"{OPENROUTER_BASE}/chat/completions",
                headers=get_headers(),
                json=payload
            )
        print("STATUS:", response.status_code)
        print("RESPONSE:", response.text[:500])
        
    except httpx.TimeoutException:
        raise HTTPException(status_code=504, detail="AI service timed out. Please try again.")
    except httpx.RequestError as e:
        raise HTTPException(status_code=502, detail=f"Failed to reach AI service: {str(e)}")

    if response.status_code == 401:
        raise HTTPException(status_code=401, detail="Invalid OpenRouter API key.")
    if response.status_code == 402:
        raise HTTPException(status_code=402, detail="OpenRouter credits exhausted. Please top up.")
    if response.status_code == 429:
        raise HTTPException(status_code=429, detail="Rate limit hit. Please wait and retry.")
    if not response.is_success:
        raise HTTPException(status_code=response.status_code, detail=f"AI API error: {response.text}")

    # Extract text content
    data = response.json()
    raw_text = data["choices"][0]["message"]["content"]

    # Clean markdown fences if present
    cleaned = clean_json_response(raw_text)

    parsed = None

    # Attempt 1: direct parse
    try:
        parsed = json.loads(cleaned)
    except json.JSONDecodeError:
        pass

    # Attempt 2: extract JSON block with regex
    if parsed is None:
        json_match = re.search(r'\{.*\}', cleaned, re.DOTALL)
        if json_match:
            try:
                parsed = json.loads(json_match.group())
            except json.JSONDecodeError:
                pass

    # Attempt 3: retry with a simpler prompt asking just for the JSON
    if parsed is None:
        retry_payload = {
            "model": MODEL,
            "messages": [
                {"role": "system", "content": "You are a JSON formatter. Return ONLY valid JSON, no markdown, no explanation."},
                {"role": "user", "content": f"Fix and return this as valid JSON only:\n{cleaned[:2000]}"}
            ],
            "temperature": 0,
            "max_tokens": 3000
        }
        try:
            with httpx.Client(timeout=30.0) as client:
                retry_response = client.post(
                    f"{OPENROUTER_BASE}/chat/completions",
                    headers=get_headers(),
                    json=retry_payload
                )
            if retry_response.is_success:
                retry_text = retry_response.json()["choices"][0]["message"]["content"]
                retry_cleaned = clean_json_response(retry_text)
                parsed = json.loads(retry_cleaned)
        except Exception:
            pass

    # All attempts failed — return a safe fallback instead of crashing
    if parsed is None:
        parsed = {
            "total_score": 50,
            "summary": "Review completed but the response could not be parsed. The file may be too complex — try a smaller file.",
            "language": language,
            "code_issues": [],
            "suggestions": [],
            "positives": ["File was fetched successfully from GitHub."],
            "metrics": {
                "total_bugs": 0,
                "critical_count": 0,
                "high_count": 0,
                "medium_count": 0,
                "low_count": 0,
                "suggestions_count": 0
            }
        }

    # Validate and fill in any missing fields
    return validate_and_fix(parsed, language)