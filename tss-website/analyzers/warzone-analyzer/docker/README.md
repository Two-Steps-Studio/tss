# Docker Setup

## Budowanie i start

```bash
cd tss-website/analyzers/warzone-analyzer/docker
docker-compose up -d --build
```

## Środowisko

- **Port**: 8000
- **GPU**: Wymagane dla analizy wideo
- **Wielkość wideo**: Max 1GB

## Wymagania

- Docker Desktop z GPU support
- NVIDIA drivers

## Zmienne środowiskowe

Edytuj `.env` (nie `.env.example`) z:
- `SUPABASE_URL`
- `SUPABASE_SERVICE_ROLE_KEY`
- `RESEND_API_KEY`

## Uruchomienie testowe

```bash
docker-compose down
docker-compose up -d
curl http://localhost:80
```
