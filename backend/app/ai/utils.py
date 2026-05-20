"""
app/ai/utils.py
───────────────
Utility functions for CIRO agent processing.
"""

import json
import re


def extract_json_from_output(output: str) -> dict:
    """
    Extract JSON from agent output, handling markdown code blocks.
    
    Handles formats like:
    - {"key": "value"}  (clean JSON)
    - ```json
      {"key": "value"}
      ```
    - ```{"key": "value"}```
    
    Args:
        output: Raw agent output string
        
    Returns:
        Parsed JSON dict
        
    Raises:
        json.JSONDecodeError: If no valid JSON found
    """
    if not output or not isinstance(output, str):
        raise json.JSONDecodeError("Empty or invalid output", "", 0)
    
    # Try 1: Clean JSON directly
    try:
        return json.loads(output.strip())
    except json.JSONDecodeError:
        pass
    
    # Try 2: Extract from markdown code blocks
    # Pattern: ```json\n{...}\n``` or ```{...}```
    json_block_patterns = [
        r'```(?:json)?\s*\n?(.*?)\n?```',  # ```json ... ``` or ``` ... ```
        r'```(?:json)?\s*\n?(.*?)\n?```',  # Alternative pattern
        r'(?:^|\n)((?:\{|\[).*?(?:\}|\]))(?:\n|$)',  # Standalone JSON object/array
    ]
    
    for pattern in json_block_patterns:
        match = re.search(pattern, output, re.DOTALL)
        if match:
            json_str = match.group(1).strip() if len(match.groups()) > 0 else match.group(0).strip()
            try:
                return json.loads(json_str)
            except json.JSONDecodeError:
                continue
    
    # Try 3: Find first { and last } or [ and ]
    for start_char, end_char in [("{", "}"), ("[", "]")]:
        start_idx = output.find(start_char)
        if start_idx != -1:
            end_idx = output.rfind(end_char)
            if end_idx > start_idx:
                try:
                    json_str = output[start_idx:end_idx + 1]
                    return json.loads(json_str)
                except json.JSONDecodeError:
                    continue
    
    # If all extraction attempts fail, raise original error
    raise json.JSONDecodeError(
        f"Could not extract valid JSON from agent output. Output: {output[:100]}",
        output,
        0
    )


def safe_json_parse(output: str, default=None) -> dict:
    """
    Safe wrapper for JSON parsing with fallback.
    
    Args:
        output: Raw agent output string
        default: Default value if parsing fails (default: empty dict)
        
    Returns:
        Parsed JSON dict or default value
    """
    if default is None:
        default = {}
    
    try:
        return extract_json_from_output(output)
    except (json.JSONDecodeError, ValueError, TypeError) as e:
        print(f"⚠️ JSON parsing failed: {e}")
        return default
