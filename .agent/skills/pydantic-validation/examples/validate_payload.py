from pydantic import BaseModel, ValidationError, Field
from datetime import datetime

class LogEntry(BaseModel):
    timestamp: datetime = Field(default_factory=datetime.now)
    level: str = Field(pattern="^(INFO|WARNING|ERROR)$")
    message: str

def test_validation():
    # Valid payload
    try:
        entry = LogEntry(level="INFO", message="System started")
        print(f"Validated: {entry.model_dump_json(indent=2)}")
    except ValidationError as e:
        print(f"Error: {e}")

    # Invalid payload (wrong level)
    try:
        LogEntry(level="DEBUG", message="Not allowed")
    except ValidationError as e:
        print("\nCaught expected validation error for 'DEBUG' level:")
        print(e.json())

if __name__ == "__main__":
    test_validation()
