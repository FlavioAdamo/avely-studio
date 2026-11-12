# Avely Harness

Apri la chat di Avely sul computer. Scegli una cartella di progetto e chiedi ad Ave un testo per una campagna o un reel dalle clip locali. La chat, i progetti, le sessioni e il selettore del modello sono quelli di DeepSeek Harness. Il preset Avely usa la cartella della conversazione e salva ciascuna bozza con la copertina in una sottocartella dedicata.

## Avvio rapido (macOS e Linux)

Installa il runtime precompilato, poi dalla radice del fork:

```sh
python3 -m pip install deepseek-harness-runtime-bin==0.2.2rc2
./studio/avely
```

Si apre l'interfaccia Web locale. Collega il provider dalle impostazioni del modello per inviare messaggi. Per esportare video occorre FFmpeg sul PATH con libx264, AAC e drawtext. Un esempio di richiesta è «Quali clip ci sono nel progetto? Prepara un reel di 12 secondi dalla prima e aggiungi la scritta Arriva venerdì». Il video viene elaborato localmente. Il modello riceve i nomi che Ave legge e i percorsi dei risultati.

Il launcher usa `~/.avely-studio` per sessioni e preferenze. Nelle build dal sorgente del fork, la composizione condivisa da `dsh web` ed Electron include già il preset e il marchio Avely. Per il runtime precompilato il launcher applica lo stesso file di configurazione all'avvio.

## Collegamento a una chat di prova

L'integrazione canvas richiede un dispositivo già associato, il profilo proprietario e una chat dedicata. L'attach sostituisce un eventuale collegamento già presente sulla chat. In una shell imposta queste variabili:

| Variabile | Valore |
| --- | --- |
| DSH_HOME | Percorso assoluto della cartella studio di questo fork |
| AVE_AGENT_ORIGIN | Origine HTTPS del servizio agente, oppure HTTP su loopback |
| AVE_PROFILE_ID, AVE_CHAT_ID | UUID del profilo e della chat |
| AVE_DEVICE_TOKEN | Token Device fornito dal flusso di associazione |
| AVE_INPUT, AVE_OUTPUT | Cartelle locali autorizzate per sorgenti ed esportazioni |

Con AVE_LOCAL_SOURCE assente, avvia `dsh --profile avely-studio`. Nella chat chiedi ad Ave quali clip vede e di preparare un reel da una di esse. `canvas.read` mostra fino a 64 nomi MP4/MOV/M4V nella cartella. `video.render` accetta per esempio `{"source":"lancio.mp4","start":3,"duration":12,"caption":"Arriva venerdì"}`. Per i sottotitoli temporizzati usa il campo `subtitles`, per esempio `[{"start":0,"end":2,"text":"Arriva venerdì"}]`, con tempi relativi al reel. La chat riceve nomi e percorsi relativi delle bozze. Video e copertina restano sul dispositivo. Per chiudere il collegamento usa Ctrl+C.

Il prototipo usa un job per volta, decodifica e codifica con un thread video e una scadenza per i job remoti. Un errore di connessione chiude la sessione. Per riprendere, riavvia il profilo e verifica le bozze già salvate.
