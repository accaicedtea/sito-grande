# Guida tecnica frontend

## 1. Scopo e architettura

Il progetto è una SPA Vue 3 costruita con Vite. Il browser carica il frontend statico e comunica con un backend CodeIgniter 4 tramite il prefisso `/api`.

```text
Browser
  -> Vue Router / componenti
  -> Axios (/api)
  -> proxy Vite in sviluppo oppure web server in produzione
  -> CodeIgniter 4
  -> MySQL
```

Il frontend e il backend sono repository separati:

- frontend: `sito-grande`
- backend: `backend-api`

Il frontend non deve contenere credenziali o configurazioni segrete.

## 2. Prerequisiti e avvio

### Frontend

```bash
cd /home/acca/Scrivania/sito_gigante/sito-grande
npm install
npm run dev
```

Build e anteprima:

```bash
npm run build
npm run preview
```

### Proxy API

[vite.config.js](../vite.config.js) inoltra `/api` verso il backend locale. Il backend deve quindi essere avviato separatamente:

```bash
cd /home/acca/Documenti/backend-api
composer install
php spark serve
```

La configurazione reale di host, database e porta è nel `.env` del backend. Non copiare quel file nella documentazione.

## 3. Router e layout

Il router è in [src/router/index.js](../src/router/index.js).

### Rotte pubbliche

| URL | Funzione |
|---|---|
| `/` | Home pubblica |
| `/menu` | Menu principale, compatibilità |
| `/menu/:slug` | Menu pubblico selezionato |
| `/eventi` | Eventi pubblici |
| `/prenotazioni` | Flusso prenotazione |
| `/contatti` | Contatti |

Le rotte pubbliche usano `PublicLayout`.

### Rotte gestionali

| URL | Funzione |
|---|---|
| `/gestione/login` | Login |
| `/gestione` | Dashboard |
| `/gestione/prodotti` | Prodotti |
| `/gestione/categorie` | Categorie |
| `/gestione/ingredienti` | Ingredienti |
| `/gestione/menu` | Menu e slug pubblici |
| `/gestione/eventi` | Eventi |
| `/gestione/prenotazioni` | Prenotazioni |
| `/gestione/promozioni` | Promozioni |
| `/gestione/profilo` | Profilo |

Le viste gestionali usano `PrivateLayout` e richiedono autenticazione.

`/servi/ordini` gestisce il proprio accesso internamente alla vista.

## 4. Autenticazione frontend

Il guard globale del router:

1. legge `admin_token` oppure `auth_token`;
2. considera non validi i valori stringa `null` e `undefined`;
3. reindirizza a `/gestione/login` se una rotta richiede autenticazione;
4. conserva la destinazione originale in `query.redirect`.

Il client Axios è in [src/shared/api/client.js](../src/shared/api/client.js). Imposta:

```text
Authorization: Bearer <token>
Content-Type: application/json
```

Su `401` rimuove i token locali e l'utente salvato, senza eseguire un redirect globale.

## 5. Menu pubblico

Il flusso è composto da:

- [MenuA.vue](../src/site/menu/MenuA.vue): interfaccia unica per tutti i menu;
- [menuStore.js](../src/stores/menuStore.js): caricamento e trasformazione dei dati;
- backend `GET /api/menu/pubblici/{slug}`.

Esempi:

```text
/menu/menu-principale
/menu/menu-estivo
/menu/cena-degustazione
```

Lo slug viene letto da Vue Router. Il componente passa lo stesso slug a `loadAllMenuData`, quindi cambiando URL viene caricato un menu diverso. Lo store usa lo slug e la lingua come chiave della cache.

Lingue supportate:

```text
it, fr, de, zh
```

Il menu gestisce categorie, prodotti, prezzi, allergeni, tag alimentari, prodotti non disponibili e legenda allergeni.

### Risposta 404 menu

Se il backend risponde con `404`, lo store espone `errorStatus = 404` e l'interfaccia mostra "Menu non disponibile". Gli altri errori mostrano il messaggio restituito dall'API.

## 6. Gestione menu

La vista [MenuView.vue](../src/site/managment/MenuView.vue) permette di:

- creare un menu con nome, slug, descrizione e stato;
- modificare il menu;
- eliminarlo con conferma;
- aprire il menu pubblico in una nuova scheda;
- generare il QR code usando lo slug;
- associare categorie e prodotti.

Il pannello contenuti usa:

```text
GET /api/admin/menu/{id}/contenuti
```

La risposta contiene categorie dell'azienda, incluse quelle invisibili, e prodotti anche inattivi o non associati. La selezione viene poi salvata tramite gli endpoint di aggiornamento delle categorie e dei prodotti.

## 7. Prenotazioni

I componenti principali sono:

- `ReservationView.vue`
- `ReservationCalendar.vue`
- `ReservationForm.vue`
- `ReservationConfirm.vue`
- `useBooking.js`
- `useSystemReservation.js`

Il codice salva una bozza in `localStorage` con chiave `ristorante-prenotazione-draft` e usa storage locale per parte dello stato della prenotazione. Prima di considerare il flusso come persistenza backend end-to-end, verificare che la chiamata a `POST /api/prenotazioni-pubbliche` sia effettivamente eseguita nel percorso utente corrente.

## 8. Temi e stili

Gli stili pubblici sono in `src/styles/themes/`:

- `base.css`
- `theme-osteria.css`
- `theme-poster.css`
- `theme-riviera.css`
- `theme-rock.css`
- `theme-serra.css`

Gli stili gestionali sono in `src/styles/managment/style.css`. I componenti devono riutilizzare le variabili CSS già presenti, soprattutto nelle viste gestionali.

## 9. Struttura del codice

```text
src/
  App.vue
  main.js
  router/index.js
  layout/
  components/
  site/
  shared/api/client.js
  shared/booking/
  shared/theme/
  stores/menuStore.js
  styles/
```

Le viste caricate dal router usano import dinamici. Errori di chunk dopo un deploy indicano normalmente cache/browser, asset `dist` non aggiornati o configurazione web server incompleta.

## 10. API e convenzioni

Il client Axios normalizza diverse risposte in una forma `{ data: ... }`. Alcune viste gestionali usano invece un helper locale basato su `fetch`, quindi prima di modificare una vista verificare il contratto specifico della risposta.

Pattern comuni:

```js
const response = await api.get('/menu/pubblici/menu-estivo', {
  params: { lang: 'it' }
})
```

Per le chiamate protette il token viene aggiunto dall'interceptor Axios oppure dall'helper locale della vista.

## 11. Deploy frontend

1. Installare dipendenze.
2. Eseguire `npm run build`.
3. Pubblicare `dist/` come sito statico.
4. Configurare fallback della history SPA verso `index.html`.
5. Rendere `/api` raggiungibile sullo stesso dominio oppure configurare correttamente CORS e proxy reverso.
6. Verificare direttamente almeno `/`, `/menu/{slug}` e `/gestione/login`.

La configurazione di produzione del web server non è versionata in questo repository e deve essere definita dall'ambiente di deploy.

## 12. Troubleshooting

### Menu non disponibile

Controllare:

- slug presente nel database;
- menu attivo;
- URL `/menu/{slug}`;
- endpoint `/api/menu/pubblici/{slug}`;
- log backend.

### 401

Il token è assente, scaduto o non valido. Effettuare nuovamente il login e controllare `Authorization` nella richiesta.

### 403

Il token è valido ma il ruolo non è autorizzato alla rotta richiesta. Verificare distinzione tra prefissi `admin` e `manager`.

### API non raggiungibile in sviluppo

Verificare che CodeIgniter ascolti sulla porta prevista dal proxy Vite e che `/api` non venga servito dal solo frontend.

### Build/chunk falliti

Rigenerare `dist/`, svuotare cache del browser e verificare il fallback SPA del web server.

## 13. Gap noti

- Non sono presenti script frontend per lint, test automatici o type checking.
- Lo schema iniziale del database appartiene al backend e non è documentato dal frontend.
- Le prenotazioni pubbliche richiedono una verifica end-to-end della persistenza.
- `menuAPI` contiene metodi legacy che non corrispondono necessariamente alle rotte attuali.
