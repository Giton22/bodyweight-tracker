# ── Stage 1: Build the frontend ──────────────────────────────────────────────
FROM node:22-alpine AS builder

# Install bun
RUN npm install -g bun

WORKDIR /app

# Copy dependency manifests first for layer caching
COPY package.json bun.lock ./

# Install all dependencies (including devDependencies needed for build)
RUN bun install --frozen-lockfile

# Copy the rest of the source
COPY . .

# Build the Vite SPA.
# VITE_PB_URL is intentionally empty so the SDK uses relative URLs —
# the frontend and API are served from the same origin (port 8090).
RUN VITE_PB_URL="" bun run build-only

# ── Stage 2: Runtime (PocketBase) ────────────────────────────────────────────
FROM ghcr.io/muchobien/pocketbase:latest

LABEL org.opencontainers.image.title="Bodyweight Tracker"
LABEL org.opencontainers.image.description="Self-hosted bodyweight and calorie tracking app"
LABEL org.opencontainers.image.source="https://github.com/Giton22/bodyweight-tracker"
LABEL org.opencontainers.image.licenses="MIT"

# Copy built frontend into PocketBase's public directory.
# PocketBase serves these static files and falls back to index.html for SPA routing.
COPY --from=builder /app/dist /pb/pb_public

# Copy migration files — run automatically by PocketBase on startup
COPY pb_migrations/ /pb/pb_migrations/

# Copy and make the entrypoint script executable
COPY pb_entrypoint.sh /pb_entrypoint.sh
RUN chmod +x /pb_entrypoint.sh

EXPOSE 8090

ENTRYPOINT ["/pb_entrypoint.sh"]
