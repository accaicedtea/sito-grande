# Sito Grande

Frontend Vue 3 + Vite per il sito pubblico e il pannello gestionale del ristorante.

## Prerequisiti

- Node.js compatibile con Vite 8
- npm
- Backend CodeIgniter avviato e raggiungibile su `http://localhost:8080`

## Avvio locale

```bash
npm install
npm run dev
```

L'app frontend viene servita da Vite. Durante lo sviluppo, `/api` viene inoltrato al backend configurato in [vite.config.js](vite.config.js).

## Comandi

```bash
npm run dev       # server di sviluppo
npm run build     # build di produzione in dist/
npm run preview   # anteprima della build
```

Il progetto non dichiara attualmente script automatici per lint, test o type checking.

## Aree principali

- Sito pubblico: `/`, `/menu`, `/menu/:slug`, `/eventi`, `/prenotazioni`, `/contatti`
- Gestione autenticata: `/gestione`
- Ordini: `/servi/ordini`
- Menu pubblici: ogni menu usa lo stesso componente e il proprio slug, per esempio `/menu/menu-estivo`

## Configurazione

Il client API usa `/api/` come base URL. In sviluppo il proxy Vite punta al backend CodeIgniter. In produzione il web server deve rendere disponibile lo stesso percorso `/api` oppure deve essere aggiunta una configurazione equivalente.

Il backend richiede un token Bearer per le rotte protette. Il frontend salva il token in `admin_token` e `auth_token`.

## Documentazione

La guida tecnica completa si trova in [docs/TECHNICAL_GUIDE.md](docs/TECHNICAL_GUIDE.md).

La documentazione del backend si trova nel repository separato `backend-api`, nel file `docs/API_AND_OPERATIONS.md`.

## Struttura essenziale

```text
src/
  components/       componenti riutilizzabili
  layout/           layout pubblico e gestionale
  router/           rotte e guard autenticazione
  shared/           client API, tema e composable prenotazioni
  site/             viste pubbliche, gestionali e ordini
  stores/           stato condiviso, incluso il menu pubblico
  styles/           temi pubblici e stile gestionale
```

## Nota operativa

Il repository contiene anche `dist/`, ma la directory deve essere rigenerata con `npm run build` prima del deploy. Non inserire token, password o altri segreti nel frontend.
