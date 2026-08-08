# Für Selina ❤️

Interaktive 3D-Geburtstagsseite: Sternenhimmel-Hintergrund, ein Herz aus
Text auf der echten 3D-Oberfläche mit wandernden Neon-Kometenlinien und
einem abschließenden Liebesbrief mit Neon-Scrollbalken.

## Struktur

```
selina-birthday-website/
├── index.html
├── css/
│   └── style.css
├── js/
│   ├── stars.js
│   ├── heart.js
│   └── app.js
└── README.md
```

## Performance- und Lesbarkeits-Fixes in diesem Update

**1. "3 Bilder pro Sekunde"**
`shadowBlur` wurde vorher bei jedem einzelnen Wort und jedem einzelnen
Komet-Segment separat gesetzt — das ist eine der teuersten Operationen in
Canvas 2D, da der Browser dabei jedes Mal eine neue Blur-Ebene berechnet.
Jetzt wird der Glow nur noch EINMAL pro Batch gesetzt (einmal für alle
Kometenschweife, gar nicht für Text). Zusätzlich werden Wortbreiten beim
Start einmal vorberechnet (`measureText` ist teuer) statt jeden Frame neu
gemessen zu werden.

**2. Überlappender Text**
Wortpositionen liegen jetzt gleichmäßig über die GESAMTE Kugel verteilt
(Fibonacci-Spirale statt Ringe), und jeden Frame läuft eine Occlusion-
Pass: Wörter werden nach Nähe zur Kamera sortiert, und jedes Wort, dessen
geschätzte Bounding-Box ein bereits akzeptiertes (näheres) Wort
überlappen würde, wird einfach nicht gezeichnet. Rückseiten-Wörter mit
zu geringer Deckkraft werden komplett übersprungen.

**3. Näher = größer & lesbarer**
Schriftgröße und Deckkraft skalieren jetzt deutlich stärker mit der
projizierten Tiefe. Wörter nah an der Kamera sind groß und voll
sichtbar, weit entfernte klein und dezent — das erzeugt echten
Tiefeneindruck und macht den Vordergrund lesbar.

**4. Cooler Kometeneffekt**
Zwei Kometen pro Rib laufen jetzt in entgegengesetzte Richtungen, nutzen
additives Blending (`globalCompositeOperation = 'lighter'`), sodass sich
überlappendes Glühen wie echtes Neonlicht aufaddiert, mit heißem weißem
Kern und längerem, ausblassendem Schweif.

## Verwendung

`index.html` im Browser öffnen (lokal per Doppelklick oder gehostet).

## Anpassen

- Wortanzahl/Dichte: `WORD_COUNT` in `js/heart.js`.
- Overlap-Toleranz: die Faktoren `0.72` / `1.1` in der Occlusion-Prüfung.
- Tiefenschärfe (wie stark nah/fern variiert): `Math.max(0.4, Math.min(proj.scale, 2.4))`.
- Neon-Farben: `NEON_PALETTE` in `js/heart.js`.
