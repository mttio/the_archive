# Guida Rapida ai Comandi di Deploy - The Archive

Questa è una guida rapida di riferimento per connetterti ai tuoi server e aggiornare sia il frontend che il backend.

---

## 1. Come connettersi alla VPS (Backend) via SSH

Usa questo comando dal terminale del tuo Mac:
```bash
ssh -6 root@2a00:6d40:72:101::606
```
*(Inserisci la password che hai impostato in fase di acquisto del server).*

---

## 2. Come aggiornare il FRONTEND (Grafica e UI)

Ogni volta che fai modifiche locali sul tuo Mac e vuoi caricarle sul sito reale:

1. Apri il terminale del tuo Mac nella cartella del frontend:
   ```bash
   cd "/Users/matteoberga/Coding/The Archive by Matteo Berga/frontend"
   ```
2. Esegui il comando di compilazione e deploy automatico:
   ```bash
   npm run deploy
   ```
   *Questo compilerà il codice React statico e lo caricherà automaticamente (senza chiederti password) sul tuo hosting Aruba.*

---

## 3. Come aggiornare il BACKEND (Codice Python e API)

Ogni volta che modifichi il backend (es. file in `/backend`), fai prima il `git push` del codice dal tuo Mac a GitHub, poi:

1. Collegati via SSH alla VPS:
   ```bash
   ssh -6 root@2a00:6d40:72:101::606
   ```
2. Spostati nella cartella del progetto, scarica le modifiche e riavvia il server:
   ```bash
   cd /var/www/the-archive
   git pull
   sudo systemctl restart portfolio-backend
   ```

---

## 4. Comandi Utili sulla VPS

### Gestione dei Servizi (Nginx e Python)
* **Controllare lo stato del server Python (FastAPI)**:
  ```bash
  systemctl status portfolio-backend
  ```
* **Controllare i log in tempo reale del server Python (utile per fare debug)**:
  ```bash
  journalctl -u portfolio-backend -n 50 -f
  ```
* **Controllare lo stato di Nginx**:
  ```bash
  systemctl status nginx
  ```
* **Riavviare Nginx**:
  ```bash
  sudo systemctl restart nginx
  ```

### Gestione del Database (Sicurezza)
* **Resettare il database** (Attenzione: cancella tutti gli articoli reali! Da usare solo in caso di emergenza o ripristino da zero):
  ```bash
  cd /var/www/the-archive
  venv/bin/python3 backend/database.py --force-reset
  # Digita "YES" quando richiesto per confermare
  ```
