# Ave Studio · prova locale

Scegli una clip, il punto di partenza e una cartella di destinazione. Ave salva un reel verticale 540 × 960 a 24 fps e la sua copertina JPEG. Puoi aggiungere una scritta fissa e tenere fino a 60 secondi di video. Il ritaglio è centrato.

## Avvio della prova

Su un computer con Python 3 e Tk, installa FFmpeg con libx264, AAC e drawtext e il runtime precompilato:

```sh
python3 -m pip install deepseek-harness-runtime-bin==0.2.2rc2
python3 studio/ave_studio.pyw
```

La finestra usa il profilo dsh incluso nel fork. Per questa prova basta il filmato locale. Ogni esportazione ha una propria cartella. La chiusura della finestra durante l'esportazione interrompe il lavoro.

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
