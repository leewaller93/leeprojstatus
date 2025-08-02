#!/bin/bash
# restore-has-status-backend.sh
# Safely restore the has-status-backend submodule from scratch
# Usage: bash restore-has-status-backend.sh

set -e

# 1. Deinitialize and remove the submodule
if [ -d "has-status-backend" ]; then
  git submodule deinit -f has-status-backend
  git rm -f has-status-backend
  git commit -m "Remove broken backend submodule (restore script)"
  git push
  rm -rf has-status-backend
fi

# 2. Re-add the submodule
if [ ! -d "has-status-backend" ]; then
  git submodule add https://github.com/leewaller93/whiteboard-backend has-status-backend
  git commit -m "Re-add backend submodule, clean state (restore script)"
  git push
fi

echo "Submodule restore complete. Please trigger a manual deploy on Render and check the build logs." 