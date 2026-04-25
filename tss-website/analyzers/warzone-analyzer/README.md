# Warzone Analyzer

System analizy gameplay'u Call of Duty Warzone przy użyciu computer vision.

## Cel

System analizuje nagrania z Call of Duty Warzone i daje feedback graczowi:
- aim i tracking
- movement patterns
- positioning
- rotations
- enemy encounters
- kill/death moments
- błędy w decyzjach

## Stack

- **Frontend**: Next.js + TypeScript + Tailwind CSS v4
- **Backend/Storage**: Supabase (istniejące)
- **CV Service**: Python + PyTorch + OpenCV (Docker container)
- **Email**: Resend

## Start

```bash
cd tss-website/analyzers/warzone-analyzer
docker-compose up -d --build
```

## Dokumentacja

Sprawdź [STRUCTURE_PLAN.md](./STRUCTURE_PLAN.md) dla pełnej specyfikacji.
