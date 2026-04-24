import httpx
from fastapi import HTTPException
from config import OPENROUTER_API_KEY

OPENROUTER_BASE = "https://openrouter.ai/api/v1"
MODEL = "openrouter/auto"  # You can change this to any model on OpenRouter


def get_headers() -> dict:
    return {
        "Authorization": f"Bearer {OPENROUTER_API_KEY}",
        "Content-Type": "application/json",
        "HTTP-Referer": "http://localhost:8000",  # Required by OpenRouter
        "X-Title": "GitHub Cloud Connector"       # Shows in OpenRouter dashboard
    }


SYSTEM_PROMPT = """You are a senior software engineer doing a code review.
Analyze the provided code and return ONLY a valid JSON object with this exact structure:

{
  "overall_rating": <integer from 1 to 10>,
  "summary": "<2-3 sentence overall assessment>",
  "bugs": [
    {
      "line": "<line number or range if known, else 'N/A'>",
      "severity": "<critical | high | medium | low>",
      "description": "<what the bug is>",
      "fix": "<how to fix it>"
    }
  ],
  "suggestions": [
    {
      "category": "<readability | performance | security | best_practice>",
      "description": "<what to improve>",
      "example": "<short code snippet showing the improvement, or null>"
    }
  ],
  "positives": [
    "<something done well>"
  ]
}

Rules:
- Return ONLY the JSON object, no markdown, no explanation outside it
- If no bugs found, return an empty array for bugs
- Be specific and actionable in all feedback
- Rate honestly: 10 means production-perfect code
"""


def review_code(code: str, language: str) -> dict:
    user_message = f"Please review this {language} code:\n\n```{language}\n{code}\n```"

    payload = {
        "model": MODEL,
        "messages": [
            {"role": "system", "content": SYSTEM_PROMPT},
            {"role": "user", "content": user_message}
        ],
        "temperature": 0.3,   # Lower = more consistent, less creative
        "max_tokens": 2000
    }

    try:
        with httpx.Client(timeout=30.0) as client:
            response = client.post(
                f"{OPENROUTER_BASE}/chat/completions",
                headers=get_headers(),
                json=payload
            )
    except httpx.TimeoutException:
        raise HTTPException(status_code=504, detail="AI service timed out. Please try again.")
    except httpx.RequestError as e:
        raise HTTPException(status_code=502, detail=f"Failed to reach AI service: {str(e)}")

    if response.status_code == 401:
        raise HTTPException(status_code=401, detail="Invalid OpenRouter API key.")
    if response.status_code == 402:
        raise HTTPException(status_code=402, detail="OpenRouter credits exhausted. Please top up.")
    if response.status_code == 429:
        raise HTTPException(status_code=429, detail="Rate limit hit. Please wait a moment and retry.")
    if not response.is_success:
        raise HTTPException(status_code=response.status_code, detail=f"AI API error: {response.text}")

    data = response.json()

    # Extract the text content from the response
    raw_text = data["choices"][0]["message"]["content"].strip()

    # Clean up if model accidentally wraps in markdown code fences
    if raw_text.startswith("```"):
        raw_text = raw_text.split("```")[1]
        if raw_text.startswith("json"):
            raw_text = raw_text[4:]

    try:
        import json
        parsed = json.loads(raw_text)
    except Exception:
        raise HTTPException(
            status_code=500,
            detail="AI returned an unexpected format. Please try again."
        )

    return parsed