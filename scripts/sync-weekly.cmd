@echo off
rem Weekly Caboodle knowledge-base refresh. Leaves changes uncommitted for human review.
"C:\Program Files\Git\bin\bash.exe" -lc "cd /e/My Code/Caboodle-Documentations && bash scripts/sync.sh >> /tmp/caboodle-sync.log 2>&1"
