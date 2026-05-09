# Pydantic Schema Best Practices

### 1. Prefer `Annotated`
Use `Annotated` from `typing` to keep your models clean and make constraints reusable.
```python
PositiveInt = Annotated[int, Field(gt=0)]
```

### 2. Use `EmailStr` and `HttpUrl`
Pydantic has built-in specialized types. Don't reinvent the wheel with regex for emails or URLs.
*Note: Requires `email-validator` package.*

### 3. Response Filtering
Always use a dedicated `Response` model to prevent leaking sensitive fields (like hashed passwords) from your database models.

### 4. Extra='Forbid'
In production APIs, use `ConfigDict(extra='forbid')` to prevent clients from sending unexpected data that might be ignored or cause confusion.

### 5. String Stripping
Use `str_strip_whitespace=True` in your `ConfigDict` to automatically clean up user input.
