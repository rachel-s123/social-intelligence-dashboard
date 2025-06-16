#!/bin/bash

# Install npm dependencies for the React dashboard
# Fail fast if any command errors
set -e

if [ -f package.json ]; then
  npm install --silent
fi
npm start