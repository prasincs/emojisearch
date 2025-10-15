# Emojisearch Deployment Guide

## Overview
AI-powered emoji search using OpenAI and Nuxt.js

## Prerequisites
- Docker or Podman
- OpenAI API key

## Quick Start

### 1. Configure Environment Variables

Edit `.env` file:
```bash
NUXT_OPENAI_API_KEY=your_openai_api_key_here
```

Optional (for rate limiting):
- KV_URL, KV_REST_API_URL, KV_REST_API_TOKEN, KV_REST_API_READ_ONLY_TOKEN

### 2. Build and Run with Docker/Podman

```bash
# Build the image
docker build -t localhost/emojisearch:latest .

# Or with Podman
podman build -t localhost/emojisearch:latest .

# Run with docker-compose
docker-compose up -d

# Or with podman-compose
podman-compose up -d
```

### 3. Access the Application

Open http://localhost:3000 in your browser

## Production Deployment

### Using systemd

Create `/etc/systemd/system/emojisearch.service`:

```ini
[Unit]
Description=Emojisearch - AI-powered emoji search
After=network.target

[Service]
Type=simple
User=ubuntu
WorkingDirectory=/home/ubuntu/emojisearch
ExecStart=/usr/bin/podman-compose up
ExecStop=/usr/bin/podman-compose down
Restart=on-failure
RestartSec=10

[Install]
WantedBy=multi-user.target
```

Enable and start:
```bash
sudo systemctl daemon-reload
sudo systemctl enable emojisearch
sudo systemctl start emojisearch
sudo systemctl status emojisearch
```

### Reverse Proxy (Nginx)

```nginx
server {
    listen 80;
    server_name emojisearch.yourdomain.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

## Configuration

### Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| NUXT_OPENAI_API_KEY | Yes | OpenAI API key for embeddings |
| KV_URL | No | Upstash KV connection URL |
| KV_REST_API_URL | No | Upstash KV REST API URL |
| KV_REST_API_TOKEN | No | Upstash KV REST API token |
| KV_REST_API_READ_ONLY_TOKEN | No | Upstash KV read-only token |
| PORT | No | Application port (default: 3000) |

### Without Rate Limiting

The app works without Upstash KV - rate limiting will be disabled.

## Troubleshooting

### Check logs
```bash
docker-compose logs -f emojisearch
# or
podman logs -f emojisearch
```

### Rebuild from scratch
```bash
docker-compose down
docker build --no-cache -t localhost/emojisearch:latest .
docker-compose up -d
```

### Health check
```bash
curl http://localhost:3000
```

## Development

```bash
# Install dependencies
pnpm install

# Run dev server
pnpm dev

# Build for production
pnpm build

# Preview production build
pnpm preview
```

## Tech Stack

- **Framework**: Nuxt 3 (Vue.js)
- **AI**: OpenAI API
- **Runtime**: Node.js 20
- **Package Manager**: pnpm
- **Rate Limiting**: Upstash KV (optional)
