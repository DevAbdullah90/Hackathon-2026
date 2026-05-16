"""
Compatibility shim for older imports.

New code should import specialist agents from `app.ai.specialists`.
"""

from .specialists import *  # noqa: F401,F403
