#!/bin/bash
cd "$(dirname "$0")"
echo "Server running at http://localhost:8080"
echo "Open that URL in your browser."
python3 -m http.server 8080
