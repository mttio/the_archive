# Guida al Deploy del Frontend - The Archive

Questa guida descrive i passaggi per compilare e caricare le modifiche grafiche e di codice del tuo frontend React direttamente sul sito web in produzione (`https://matteoberga.com`).

---

## Passo 1: Effettuare le modifiche e testare in locale
1. Esegui il sito sul tuo Mac per verificare le modifiche grafiche:
   ```bash
   cd "/Users/matteoberga/Coding/The Archive by Matteo Berga/frontend"
   npm run dev
   ```
2. Apri `http://localhost:5174` nel browser e controlla che tutto funzioni correttamente.

---

## Passo 2: Compilare la Build di Produzione
Una volta soddisfatto delle modifiche, compila il sito per generare i file statici ottimizzati per il web:
```bash
cd "/Users/matteoberga/Coding/The Archive by Matteo Berga/frontend"
npm run build
```
Questo comando:
- Valida il codice TypeScript.
- Raccoglie, minifica e ottimizza tutti i file HTML, CSS e JavaScript.
- Crea (o aggiorna) la cartella **`frontend/dist/`** che contiene i file definitivi da pubblicare.

---

## Passo 3: Pubblicare i file online

Scegli uno dei seguenti metodi per pubblicare le modifiche online:

### Metodo A: Tramite FileZilla (Manuale e Grafico)
1. Apri **FileZilla** e connettiti al server Aruba:
   - **Protocollo**: SFTP
   - **Host**: `matteoberga.com` (o `www.matteoberga.com`)
   - **Porta**: `2222`
   - **Utente**: `znlwohm-matteo`
   - **Password**: La tua password di Aruba Hosting.
2. Sulla colonna sinistra (Locale), entra in `/frontend/dist/`.
3. Sulla colonna destra (Remoto), entra nella cartella principale del tuo spazio web (solitamente `/web/htdocs/www.matteoberga.com/home/`).
4. Seleziona tutti i file e le cartelle **dentro** la cartella locale `dist/` e trascinali sul lato remoto, confermando la sovrascrittura dei file esistenti.

---

### Metodo B: Tramite Terminale Mac (Un Solo Comando)
Se preferisci evitare FileZilla, puoi pubblicare i file compilati direttamente dal terminale del tuo Mac usando `scp`:

```bash
scp -P 2222 -r "/Users/matteoberga/Coding/The Archive by Matteo Berga/frontend/dist/"* znlwohm-matteo@matteoberga.com:/web/htdocs/www.matteoberga.com/home/
```
*Questo comando copierà in blocco tutti i file compilati nella cartella di Aruba.*

#### Come evitare di digitare la password ogni volta (Chiave SSH):
Se vuoi fare il deploy con il terminale senza digitare la password, copia la tua chiave pubblica del Mac sul server Aruba:
1. Genera una chiave SSH sul tuo Mac (se non la possiedi già):
   ```bash
   ssh-keygen -t rsa -b 4096
   ```
2. Copia la chiave sul server di Aruba (inserisci la password per l'ultima volta):
   ```bash
   ssh-copy-id -p 2222 znlwohm-matteo@matteoberga.com
   ```
Da questo momento in poi, il comando `scp` caricherà i file istantaneamente senza chiederti nulla.

---

### Metodo C: Deploy 100% Automatico (GitHub Actions)
Puoi fare in modo che ogni volta che fai `git push` su GitHub, il server compili il codice e lo pubblichi da solo su Aruba.

1. Crea questa cartella e questo file nel tuo progetto locale:
   `/.github/workflows/deploy-frontend.yml`
2. Incolla questo codice nel file:

```yaml
name: Deploy Frontend to Aruba

on:
  push:
    branches:
      - main
    paths:
      - 'frontend/**'

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - name: Checkout Code
        uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: 20

      - name: Install & Build
        run: |
          cd frontend
          npm install
          npm run build

      - name: Upload to Aruba SFTP
        uses: SamKirkland/FTP-Deploy-Action@v4.3.5
        with:
          server: matteoberga.com
          port: 2222
          username: znlwohm-matteo
          password: ${{ secrets.ARUBA_SFTP_PASSWORD }}
          local-dir: ./frontend/dist/
          server-dir: /web/htdocs/www.matteoberga.com/home/
          protocol: sftp
```
3. Vai sulle impostazioni del tuo repository su **GitHub -> Settings -> Secrets and variables -> Actions**, crea un nuovo Secret chiamato **`ARUBA_SFTP_PASSWORD`** e incolla la tua password di Aruba.

*Ogni volta che modificherai il frontend e farai il push su GitHub, il tuo sito si aggiornerà da solo in circa 1 minuto!*
