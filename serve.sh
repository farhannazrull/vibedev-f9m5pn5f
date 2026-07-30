#!/bin/bash
# Start a local server for the Podcast Queue Manager
# Required for module scripts (file:// doesn't work with type="module")
echo "Server running at http://localhost:8080"
python3 -m http.server 8080
