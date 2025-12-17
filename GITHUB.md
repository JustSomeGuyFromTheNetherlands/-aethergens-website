# GitHub Setup Guide

## Stap 1: Git Installeren

Als Git nog niet geïnstalleerd is:
- Download: https://git-scm.com/download/win
- Installeer en herstart terminal

## Stap 2: Git Initialiseren

```bash
# Initialiseer git repository
git init

# Voeg alle bestanden toe
git add .

# Maak eerste commit
git commit -m "Initial commit: AetherGens website"
```

## Stap 3: GitHub Repository Aanmaken

1. Ga naar https://github.com
2. Klik op "New repository"
3. Geef een naam (bijv. `aethergens-website`)
4. Kies **Private** of **Public**
5. **NIET** "Initialize with README" aanvinken
6. Klik "Create repository"

## Stap 4: Repository Koppelen en Pushen

```bash
# Voeg remote repository toe (vervang USERNAME en REPO_NAME)
git remote add origin https://github.com/USERNAME/REPO_NAME.git

# Push naar GitHub
git branch -M main
git push -u origin main
```

## Stap 5: Toekomstige Updates

```bash
# Wijzigingen toevoegen
git add .

# Commit maken
git commit -m "Beschrijving van wijzigingen"

# Pushen naar GitHub
git push
```

## Belangrijke Bestanden (al in .gitignore)

Deze worden **NIET** naar GitHub geüpload:
- `node_modules/` - Dependencies
- `dist/` - Build bestanden
- `server/data/` - Data bestanden
- `.env` - Environment variabelen (gevoelige info!)
- `*.log` - Log bestanden

## Tips

- **Altijd** `.env` lokaal houden (niet committen!)
- Gebruik `env.example` als template
- Commit regelmatig met duidelijke berichten
- Gebruik branches voor grote features: `git checkout -b feature-name`


