# Žijeme len raz – jednoduchý statický web

## Spustenie lokálneho servera
Pre správne načítanie `content.json` spustite lokálny server v koreňovom adresári projektu:

```bash
python -m http.server
```

Potom otvorte v prehliadači `http://localhost:8000/index.html`.

## Admin stránka
Admin panel nájdete na `http://localhost:8000/admin.html`.

## Úprava obsahu
1. Otvorte admin stránku a zadajte admin kľúč `zlr-1234`.
2. Upravte texty alebo galériu a kliknite na **Uložiť**.
3. Obnovte verejnú stránku – zmeny sa načítajú z LocalStorage.
4. Pre export/import použite tlačidlá **Export JSON** / **Import JSON**.

## Ukážka obsahu
**Hero**
- *Aby v tom ženy neboli samé.*
- Sprevádzame ženy, ktoré prechádzajú náročným obdobím. Pomáhame nájsť oporu, informácie a komunitu.

**Sekcie**
- O nás · Ako pomáhame · Príbehy · Galéria · Podporiť · Kontakt
