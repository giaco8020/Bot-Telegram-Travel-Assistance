## 🚂 Bot Telegram per Applicazioni di Travel Assistance 🚌

**Progetto di Tesi di Laurea** in Ingegneria Informatica Triennale.

### 📌 Obiettivo

Lo scopo di questo progetto è sviluppare un bot Telegram per facilitare la ricerca di biglietti di viaggio dai principali provider come Trenitalia, Itabus e Flixbus. Questo bot mira a fornire agli utenti una piattaforma semplice e intuitiva per trovare e confrontare le migliori opzioni di viaggio.

### 🗂 Struttura del Progetto

- `src\data\moduli`: Moduli chiave per l'acquisizione dei dati dai provider.
- `src\data\error`: Modulo per la gestione degli errori durante l'esecuzione di funzioni.
- `src\data\utils`: Contiene moduli per la formattazione delle risposte (funzioni di parsing) delle varie richieste dei provider. In questa cartella è anche presente un modulo chiamato `manager.js` che funge da controller. Attraverso questo modulo è possibile chiamare le funzioni chiave per la ricerca di biglietti di viaggio.

### 🌐 WebApp

La WebApp è stata sviluppata in React. Per il collegamento con Telegram, è stato seguito quanto descritto nella [guida ufficiale di Telegram](https://core.telegram.org/bots/webapps). È importante sottolineare che la WebApp può anche essere utilizzata in maniera indipendente dal bot Telegram.
