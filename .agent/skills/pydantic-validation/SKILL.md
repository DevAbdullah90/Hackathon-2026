---
name: validating-data-pydantic
description: Ensures data integrity and type safety using Pydantic V2. Use when defining API request/response schemas, validating external data, or enforcing strict type checks.
---

# Pydantic & Data Validation

## When to use this skill
- When defining FastAPI request bodies or response models.
- When parsing JSON data from external APIs.
- When the user mentions "schema validation", "type safety", or "data modeling".
- When you need to enforce complex constraints (e.g., regex, range, nested objects).

## Workflow
- [ ] **Define Base Model**: Use `pydantic.BaseModel` for all data structures.
- [ ] **Annotate Fields**: Use `Field` for metadata (examples, descriptions, constraints).
- [ ] **Apply Validators**: 
    - Use `Annotated` for reusable validation logic.
    - Use `@field_validator` for custom cross-field or logic-heavy checks.
- [ ] **Configure Behavior**: Use `model_config` to enforce strictness (e.g., `extra='forbid'`, `str_strip_whitespace=True`).
- [ ] **Handle Errors**: Implement custom error messages for a better user/developer experience.

## Instructions

### 1. Strict Schema Definition (Medium-Freedom)
Always aim for Pydantic V2 syntax.
```python
from pydantic import BaseModel, Field, EmailStr, ConfigDict
from typing import Annotated

class UserCreate(BaseModel):
    model_config = ConfigDict(extra='forbid', str_strip_whitespace=True)

    username: Annotated[str, Field(min_length=3, max_length=50, pattern=r"^[a-zA-Z0-9_]+$")]
    email: EmailStr
    age: Annotated[int, Field(ge=18, le=120)]
    bio: str | None = Field(default=None, max_length=500)
```

### 2. Custom Field Validation
Use `@field_validator` for logic that depends on the field value itself.
```python
from pydantic import field_validator

class Project(BaseModel):
    name: str

    @field_validator('name')
    @classmethod
    def name_must_be_capitalized(cls, v: str) -> str:
        if not v[0].isupper():
            raise ValueError('The project name must start with a capital letter')
        return v
```

### 3. Model-Level Validation
Use `@model_validator` for logic that compares multiple fields.
```python
from pydantic import model_validator

class ChangePassword(BaseModel):
    new_password: str
    confirm_password: str

    @model_validator(mode='after')
    def passwords_match(self) -> 'ChangePassword':
        if self.new_password != self.confirm_password:
            raise ValueError('Passwords do not match')
        return self
```

## Resources
- [Schema Best Practices](resources/schema_tips.md)
- [Example Validation Script](examples/validate_payload.py)
