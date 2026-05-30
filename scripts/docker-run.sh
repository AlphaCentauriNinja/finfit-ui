#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"
IMAGE_NAME="finfit-ui"
CONTAINER_NAME="finfit-ui"
PORT="${PORT:-3000}"

# ── Load .env.local if it exists ──
ENV_FILE="$PROJECT_ROOT/.env.local"
if [[ -f "$ENV_FILE" ]]; then
  echo "📄 Loading environment from .env.local"
  set -a
  # shellcheck disable=SC1090
  source "$ENV_FILE"
  set +a
fi

# ── Validate required build args ──
if [[ -z "${NEXT_PUBLIC_SUPABASE_URL:-}" ]]; then
  echo "❌ NEXT_PUBLIC_SUPABASE_URL is not set. Set it in .env.local or export it."
  exit 1
fi

if [[ -z "${NEXT_PUBLIC_SUPABASE_ANON_KEY:-}" ]]; then
  echo "❌ NEXT_PUBLIC_SUPABASE_ANON_KEY is not set. Set it in .env.local or export it."
  exit 1
fi

# ── Build ──
echo ""
echo "🐳 Building Docker image: $IMAGE_NAME"
echo "   NEXT_PUBLIC_SUPABASE_URL=${NEXT_PUBLIC_SUPABASE_URL}"
echo ""

docker build \
  --build-arg NEXT_PUBLIC_SUPABASE_URL="$NEXT_PUBLIC_SUPABASE_URL" \
  --build-arg NEXT_PUBLIC_SUPABASE_ANON_KEY="$NEXT_PUBLIC_SUPABASE_ANON_KEY" \
  -t "$IMAGE_NAME" \
  "$PROJECT_ROOT"

# ── Stop existing container if running ──
if docker ps -q --filter "name=$CONTAINER_NAME" | grep -q .; then
  echo ""
  echo "🛑 Stopping existing container: $CONTAINER_NAME"
  docker stop "$CONTAINER_NAME" >/dev/null
  docker rm "$CONTAINER_NAME" >/dev/null
fi

# ── Run ──
echo ""
echo "🚀 Starting container on http://localhost:$PORT"
echo ""

RUN_ARGS=(
  --name "$CONTAINER_NAME"
  -p "$PORT:3000"
  -e "NEXT_PUBLIC_SUPABASE_URL=$NEXT_PUBLIC_SUPABASE_URL"
  -e "NEXT_PUBLIC_SUPABASE_ANON_KEY=$NEXT_PUBLIC_SUPABASE_ANON_KEY"
)

# Pass optional runtime env vars if set
[[ -n "${METALS_DEV_API_KEY:-}" ]] && RUN_ARGS+=(-e "METALS_DEV_API_KEY=$METALS_DEV_API_KEY")

docker run -d "${RUN_ARGS[@]}" "$IMAGE_NAME"

echo ""
echo "✅ Container '$CONTAINER_NAME' is running on http://localhost:$PORT"
echo "   Logs: docker logs -f $CONTAINER_NAME"
echo "   Stop: docker stop $CONTAINER_NAME"
