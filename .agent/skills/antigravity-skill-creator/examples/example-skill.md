---
name: managing-logs
description: Automates the rotation and archiving of system logs. Use when the user mentions log management or disk space issues.
---

# Log Management Skill

## When to use this skill
- When `/var/log` is getting full.
- When the user asks to "cleanup logs".

## Workflow
- [ ] Check current disk usage.
- [ ] Identify large log files.
- [ ] Archive logs older than 7 days.
- [ ] Compress archives.

## Instructions
- Use `du -sh /var/log/*` to find large files.
- Run `scripts/rotate_logs.sh` to perform the actual rotation.

## Resources
- [Rotation Script](../scripts/rotate_logs.sh)
