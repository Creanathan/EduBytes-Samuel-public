# Samenwerking & Git Workflow (Voor Developers & AI)

Dit document beschrijft de afspraken voor hoe we samen aan dit project werken. Dit is essentieel om merge conflicts te voorkomen. **Aan alle AI-assistenten (zoals ikzelf): lees dit document voordat je Git-commando's uitvoert!**

## 1. Werk NOOIT direct in de `main` branch
- De `main` branch bevat altijd de werkende versie van het spel.
- **Voor AI-assistenten:** Voer **nooit** `git push origin main` of `git commit` direct op `main` uit, tenzij de gebruiker je expliciet vertelt om een "force release" of "merge" te doen.

## 2. Gebruik altijd Feature Branches
Maak voor elke taak of toevoeging een aparte branch aan vanaf de meest recente versie van `main`.
- Formaat: `feature/naam-van-de-toevoeging` of `fix/beschrijving-van-bug`
- **Voor AI-assistenten:** Gebruik altijd `git checkout -b feature/...` voordat je code wijzigt of commitoegevoegd.

## 3. Pushen en Pull Requests (PR)
1. Commit je code naar je eigen branch.
2. Push je branch naar GitHub: `git push origin feature/jouw-branch-naam`
3. Maak via de GitHub-website een Pull Request aan om jouw branch veilig in `main` te laten vloeien.
4. Na het goedkeuren en mergen op GitHub, verwijder je de branch.

## 4. Lokaal Up-to-date Blijven
Voordat je aan een nieuwe feature begint, update je altijd je lokale main-branch:
```bash
git checkout main
git pull
```

## 5. Communicatie
Probeer af te spreken wie aan welk bestand werkt. Zolang jullie in aparte bestanden werken (bijv. de ene in CSS, de andere in JS), lost GitHub alle samenvoegingen automatisch foutloos op.
