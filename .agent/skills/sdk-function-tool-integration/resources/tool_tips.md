# Tool Docstring & Schema Tips

## The Golden Rule
The SDK generates the tool's JSON schema entirely from your function's **type hints** and **docstring**.
The LLM reads the description and Args to decide *if* and *how* to call the tool.

## Docstring Format
```python
def my_tool(param_a: str, param_b: int = 10) -> str:
    """One-line description of what the tool does and when to use it.

    Use this when the user asks for X. Do NOT use this for Y.

    Args:
        param_a: Clear description of what this parameter controls.
        param_b: What this number changes. Default is 10.
    """
```

## Type Hints → JSON Schema
| Python Type | JSON Schema |
|-------------|-------------|
| `str` | `{"type": "string"}` |
| `int` | `{"type": "integer"}` |
| `list[str]` | `{"type": "array", "items": {"type": "string"}}` |
| `TypedDict` | `{"type": "object", "properties": {...}}` |
| `str \| None` | `{"anyOf": [{"type": "string"}, {"type": "null"}]}` |

## Context Parameter
The `ctx: RunContextWrapper[T]` parameter is **never** included in the schema — it's invisible to the LLM and injected automatically by the SDK at runtime.

## Module Structure
```
app/agents/tools/
├── __init__.py       # re-export all tools
├── memory_tools.py
├── search_tools.py
└── utility_tools.py
```
