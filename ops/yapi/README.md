YApi via Docker Compose

This folder provides a ready-to-run YApi (API management + mock) setup using Docker Compose.

What you get
- YApi web at http://localhost:40001
- MongoDB persisted under ops/yapi/data/db

Prerequisites
- Windows / macOS / Linux with Docker Desktop (or Docker Engine) installed
- On Windows, enable WSL2 backend for Docker Desktop

Quick start
1) Edit admin credentials (optional, recommended)
   - Create ops/yapi/.env and set:
     YAPI_ADMIN_ACCOUNT=admin@your.domain
     YAPI_ADMIN_PASSWORD=ChangeMe123!

2) Start services
   - From repo root: docker compose -f ops/yapi/docker-compose.yml up -d

3) Open YApi
   - Visit http://localhost:40001
   - Login with the admin account and password above

Common commands
- Start: docker compose -f ops/yapi/docker-compose.yml up -d
- Stop: docker compose -f ops/yapi/docker-compose.yml down
- Logs: docker compose -f ops/yapi/docker-compose.yml logs -f yapi-web
- Reset (remove data): docker compose -f ops/yapi/docker-compose.yml down -v

Notes
- Registration is disabled by default (YAPI_CLOSE_REGISTER=true). Create users from the admin console.
- To expose MongoDB to host (e.g., for backups), add a host port mapping to yapi-mongo in docker-compose.yml.
- If you cannot use Docker on this machine, consider installing YApi on a server or VM and point frontend to that URL.

