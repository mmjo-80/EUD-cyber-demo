#!/bin/sh
set -eu
cd "$(dirname "$0")/.."
git pull --ff-only
docker compose config --quiet
docker compose up -d --build --wait
docker compose ps
