#!/usr/bin/env bash
set -euo pipefail

PROJECT_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
METRO_LOG="$PROJECT_ROOT/.expo/metro-dev.log"

mkdir -p "$PROJECT_ROOT/.expo"

is_metro_running() {
  curl -s "http://127.0.0.1:8081/status" | grep -q "packager-status:running"
}

if is_metro_running; then
  echo "Metro already running on :8081"
else
  echo "Starting Metro dev server..."
  nohup npx expo start --dev-client -c > "$METRO_LOG" 2>&1 &

  for _ in {1..45}; do
    if is_metro_running; then
      echo "Metro is ready"
      break
    fi
    sleep 1
  done

  if ! is_metro_running; then
    echo "Metro failed to start. Check logs: $METRO_LOG"
    tail -n 80 "$METRO_LOG" || true
    exit 1
  fi
fi

adb reverse tcp:8081 tcp:8081 || true

echo "Installing and launching Android debug app..."
npx expo run:android --no-bundler

echo "Done. Metro log: $METRO_LOG"
