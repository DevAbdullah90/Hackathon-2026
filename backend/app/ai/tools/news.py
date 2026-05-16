"""
backend/app/ai/tools/news.py
────────────────────────────
SerpApi news-search tool for the CIRO detection_agent and verification_agent.

Searches Google via SerpApi and returns the top organic results so agents can
cross-reference citizen flood signals against published news sources.
"""

import httpx
from agents import function_tool

from app.core.config import settings

_SERPAPI_URL = "https://serpapi.com/search.json"


@function_tool
async def search_local_news(query: str) -> list:
    """Search for local news articles about floods, blockages, or disasters using SerpApi.

    Call this when you need to verify whether a citizen-reported signal is
    corroborated by published news, or when assessing severity with external
    reporting context.  Returns up to 5 structured result objects.

    Args:
        query: Natural-language search query, e.g.
               "Islamabad G-10 flood 2026" or "Rawalpindi road blockage".
    """
    try:
        params = {
            "q": query,
            "api_key": settings.SERP_API_KEY,
            "num": 5,
            "hl": "en",
            "gl": "pk",
        }
        async with httpx.AsyncClient(timeout=10.0) as client:
            response = await client.get(_SERPAPI_URL, params=params)
            response.raise_for_status()
            data = response.json()

        raw_results = data.get("organic_results", [])
        return [
            {
                "title": r.get("title", ""),
                "snippet": r.get("snippet", ""),
                "link": r.get("link", ""),
            }
            for r in raw_results
        ]

    except Exception:
        # Never raise — return empty list so the agent pipeline is not broken
        return []
