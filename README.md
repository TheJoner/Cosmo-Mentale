# Idea (type)

L'idea è di espriemere la mia mente in modo diverso.

## Ispirazioni

L'ispirazione è data dalla mancanza che ho riguardo al poter esprimere varie cose in modo diretto.

## Significato

Il significato riguarda ciò che ho nella mente, i vari pensieri diversi e come li gestico.

## Esperienza che mi aspetto

L'idea è di far navigare l'utente all'interno della mia mente cercando di far capire i miei pensieri e le mie idee riguardo un numero n° di parti, tutte gestite e malleabili per preferenze dell'utente.

### Descrizione

Un viaggio interattivo e sensoriale all'interno della mia mente. Pensieri, ricordi e sogni si manifestano come nodi in un cosmo oscuro ma vivo, dove ogni elemento può essere osservato, ascoltato, oppure alterato. È una mappa mentale e un archivio emotivo. Un luogo dove l’utente può esplorare, ma anche disturbare l’equilibrio, provocando glitch sensoriali. Un'esperienza di reset, introspezione e rinascita.

### Obiettivi (artistici)

-   Creare un ambiente che rappresenti la **mente** come uno **spazio esplorabile**
-   Far emergere la vulnerabilità: i pensieri possono essere modificati, distrutti, alterati
-   Rappresentare il **reset** come blackout selettivo o totale
-   Mostrare la bellezza della **curiosità** e del desiderio di imparare

### Obiettivi (tecnici)

- [ ] Sito Web
	- [ ] Struttura del cervello
        - [x] Ambiente spaziale (simile al cosmo)
        - [x] Inserimento e visualizzazione modello 3d cervello
	- [ ] Nodi 
        - [ ] collegamenti in uno spazio "fermo"
        - [ ] possibilità di muoversi liberamente

## 🧠 Struttura Tecnico-Artistica del Sito

### 🔷 **FASE 1: Home con cervello 3D**

-   Visualizzazione: **Three.js**
-   Il cervello ruota orizzontalmente in loop lento (controllato o libero)
-   Sfondo scuro, con leggero movimento di particelle o alone spaziale
-   Overlay basso centrale:
    
    > "Se resti fermo troppo a lungo, potresti perdere un pensiero."  
    > (può cambiare ogni tot secondi, come suggerimenti poetici o inviti a muoversi)
    

### 📸 **Tecnologie**

-   `three.js` (da includere via CDN o scaricata in locale)
-   Modello 3D del cervello (in `.glb`, `.gltf` o `.obj`)
-   Overlay con HTML/CSS
-   Un minimo di JS per il timer che mostra i messaggi

---

### 🔷 **FASE 2: Zoom → Transizione verso il grafo**

-   Se fai zoom oltre un certo punto (o premi un tasto), il cervello svanisce (fade-out), e:
    -   Appaiono **nodi** (punti, forme) attorno alla posizione, come stelle o neuroni
    -   Parte una visualizzazione **del grafo di pensieri/ricordi**

### 🧩 Funzioni

-   Fading: animazione graduale, sfondo che cambia
-   I nodi compaiono in modo progressivo (magari con effetti di comparsa o "pulsazione")
-   Ogni nodo è associato a un file JSON con contenuti (testo, immagine, suono, video)

### 📸 Tecnologie

-   Gestione zoom con Three.js (`camera.zoom`, `camera.position`, oppure raycasting)
-   Overlay gestiti con HTML dinamici creati in JS
-   File JSON per i contenuti dei nodi
-   Audio: Howler.js o `Audio()` per sonorità immersive

----------

### 🔷 **FASE 3: Navigazione nel grafo (dopo il cervello)**

-   Controlli:
    -   `W/S` (o freccia su/giù) = avanti/indietro
    -   `A/D` (o sinistra/destra) = movimento laterale
    -   Visuale bloccata a un certo asse per mantenere "il cammino"
-   Visione con **prospettiva**: il movimento cambia la distanza dei nodi e crea profondità
-   Effetti come: sfocature di nodi lontani, bagliori su nodi vicini

### 📸 Tecnologie

-   Three.js per i nodi come oggetti 3D o punti di luce
-   Sistema di telecamera "on rails" (non totalmente libera, ma controllata)
-   Possibilità di caricare texture, testi e suoni al volo quando ti avvicini

----------

### 🔷 **FASE 4: Interazione con il nodo**

-   Clic su un nodo → si apre una finestra/overlay
    -   Foto, video, suono, testo
    -   Pulsanti per **"osserva"**, **"modifica"**, **"glitch"**
    -   Se viene modificato, si altera il contenuto: colori distorti, suoni cambiati, effetti visivi

### 🧬 Idee per glitch:

-   Filtri CSS distorcenti o effetti canvas
-   Suono che cambia tonalità o si reverse-a
-   Immagine che si divide in righe/mosaico
-   Nodo che pulsa irregolarmente dopo l’interazione

----------

### 🔷 **FASE 5: Nodo centrale — Libreria Studio**

-   Il cuore della mappa mentale
-   Visualmente più grande o illuminato
-   Bloccato in posizione centrale (raggiungibile muovendosi)
-   Quando ci entri:
    -   Spazio vuoto e calmo, con scaffali/stelle/testi
    -   Lista delle cose che vuoi imparare o che rappresentano la tua stabilità

----------

## ✅ Prossimi Passi Consigliati

### 📁 1. Crea una cartella di progetto:

```
/progetto-mente
│
├── index.html
├── style.css
├── script.js
├── cervello.glb
├── /js/libs (per le librerie locali se vuoi)
├── /assets (suoni, immagini, video)
├── /json (per nodi e contenuti)

```

### 🧪 2. Inizia a fare test:

-   Caricare il cervello in Three.js e farlo ruotare
-   Rilevare lo zoom e fare il passaggio verso il grafo
-   Creare un primo JSON con un nodo e testare l’overlay

### 📌 3. Studia/approfondisci:

-   **Gestione camera con Three.js**
-   **Raycasting per clic su oggetti 3D**
-   **Animazioni di transizione (fade-in/out, scale)**
-   **Overlay CSS dinamici da JS**
-   **Effetti glitch (filtri CSS o canvas manipulation)**