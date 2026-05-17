import os
import sys
import subprocess
from pathlib import Path

def run_tests():
    print("[START] Starting CIRO E2E Full Pipeline Tests...")
    
    # Set up paths
    backend_dir = Path(__file__).parent
    output_dir = backend_dir / "app" / "tests" / "test-output"
    output_dir.mkdir(parents=True, exist_ok=True)
    
    output_file = output_dir / "full_pipeline_live_output.txt"
    
    # Set environment for UTF-8 encoding
    env = os.environ.copy()
    env["PYTHONIOENCODING"] = "utf-8"
    
    # The pytest command
    cmd = [
        sys.executable, "-m", "pytest", 
        "app/tests/test_full_pipeline_live.py", 
        "-v", "-s"
    ]
    
    print(f"[INFO] Writing output to: {output_file}")
    print("[WAIT] Please wait, this may take 3-5 minutes as it runs all agents...")
    
    # Run the process and capture output
    with open(output_file, "w", encoding="utf-8") as f:
        process = subprocess.run(
            cmd,
            cwd=str(backend_dir),
            env=env,
            stdout=f,
            stderr=subprocess.STDOUT,
            text=True
        )
    
    print("\n[OK] Tests Completed!")
    print(f"Exit Code: {process.returncode}")
    print(f"You can view the full output in: {output_file.relative_to(backend_dir)}")
    
    if process.returncode != 0:
        print("\n[WARN] Note: If you see an asyncio.TimeoutError, it just means the sequential LLM calls took longer than the default timeout. Run the scenarios individually to avoid rate-limiting.")

if __name__ == "__main__":
    run_tests()
