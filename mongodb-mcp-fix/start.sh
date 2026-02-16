#!/bin/bash
cd "$(dirname "$0")"
set -a
source .env
set +a
./node_modules/.bin/mongodb-mcp-server
