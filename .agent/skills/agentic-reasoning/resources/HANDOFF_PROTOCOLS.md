# Agent Handoff Protocols

### 1. Trigger Conditions
*   **Skill Gap**: Current agent lacks the specific tools or domain knowledge (e.g., Generalist needs to run code -> hand off to SandboxAgent).
*   **Phase Completion**: Architect has finished the spec -> hand off to Developer.
*   **Quality Check**: Developer has finished the feature -> hand off to QA/Tester.

### 2. Information to Transfer
When handing off, you must provide:
- **Status**: What is the current state?
- **Artifacts**: Which files were created/modified?
- **Blockers**: Are there any known issues?
- **Next Step**: What should the receiving agent do first?

### 3. Syntax for SDK
```python
# In the instructions or via the transfer tool
transfer_to_tester(
    summary="Feature X implementation complete. Need unit tests for edge cases.",
    relevant_files=["app/services/x.py"]
)
```
