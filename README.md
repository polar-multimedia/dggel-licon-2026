# Tarjeta DG Gel gigante · LICON AMMTAC 2026

Activación del stand: el visitante escanea un QR, escribe su nombre y elige su grupo sanguíneo
en el celular; la tarjeta DG Gel ABO/Rh de 85" (pantalla + máscara física) se ordena en vivo
con su patrón real y escribe su nombre a mano en la franja de la tarjeta.

Stack Polar: GitHub Pages + Firebase Realtime Database (ver skill `polar-event-deploy`).

## Vistas

| Vista | Ruta | Dónde corre |
|---|---|---|
| Pantalla | `/pantalla/` | Player de la TV de 85" (Chrome en pantalla completa, tecla **F**) |
| Registro | `/registro/` | Celular del visitante (QR impreso en el stand) |
| Moderador | `/moderador/` | Laptop del staff: cola, pausa, reposo, envío manual, repetir, borrar |

`index.html` redirige a `/pantalla/`.

## Cómo funciona la animación (≈ 20 s por persona)

1. Aparece una gota de muestra en los ocho pocillos.
2. La tarjeta vibra (centrifugado) y los glóbulos bajan: en los pocillos **positivos** quedan
   atrapados en la superficie del gel (banda roja); en los **negativos** atraviesan el gel y
   forman un botón en el fondo.
3. Se escribe a mano el nombre y el grupo (fuente Shadows Into Light, trazo por trazo con opentype.js).
4. Reposo configurable (10 s por default) y sigue el siguiente de la cola; sin cola, modo espera
   con la leyenda "Escanea el código y escribe tu historia".

Los ocho patrones están en `assets/tipos.js` y siguen la "Gráfica grupos sanguíneos" de LICON
(columnas A · B · AB · D · D* · Ctl · N/A1 · N/B).

## Teclas en la pantalla

- **F** pantalla completa · **M** oculta el cuerpo blanco de la tarjeta (instalación real, deja
  solo lo que se ve por las ventanas de la máscara) · **H** datos de cola · **1–8** dispara una
  tarjeta de prueba por grupo · **Espacio** pausa/reanuda.
- Parámetros de URL: `?nombre=Ana&grupo=A%2B` reproduce de inmediato · `?mascara=0` · `?hud=1`.

## Capas de la pantalla (a partir de la foto de la tarjeta)

- `assets/foto/mascara.png` — **máscara virtual**: la foto real de la tarjeta con los interiores de los 8 tubos y la
  ventana del nombre transparentes. Sirve para previsualizar. Se apaga desde el moderador ("Máscara virtual") o con **M**.
- `assets/foto/liquidos.png` — lo que asoma por las ventanas: gel de cada tubo (limpio, sin sedimento) estirado 1.5× en
  ancho y 1.06× en alto para que la máscara física no tenga que atinar, y la zona blanca del nombre con sangrado.
- `assets/foto/boton.png`, `linea_fina.png`, `linea_gruesa.png`, `arrastre.png` — sedimentos recortados de la foto real
  (botón negativo en el fondo, línea positiva fina/gruesa sobre el gel, arrastre en el cuello).
- Coordenadas de trabajo: píxeles de la foto (1448 × 1086); el SVG de la pantalla usa ese viewBox y se centra en 16:9.

## Máscara física

`assets/mascara_85.svg` es la guía de corte 1:1 en milímetros, generada desde la misma foto que dibuja
la pantalla (área activa de referencia 1872 × 1053 mm para una 85" 16:9): capa de arte = la foto impresa
(rectángulo azul), capa de corte = 8 interiores de tubo + ventana del nombre (rojo).
**Confirmar el área activa del modelo de TV antes de cortar**; si difiere, escalar el archivo
proporcionalmente. La máscara debe extenderse más allá del área activa para cubrir marco y estructura.
La banda de etiquetas, códigos y pie van impresos en la máscara, no en pantalla.

## Firebase

1. Crear proyecto `polar-dggel-licon-2026` en https://console.firebase.google.com
2. Realtime Database → crear → reglas:
   ```json
   {
     "rules": {
       "registros": { ".read": true, ".write": true, ".indexOn": ["ts"] },
       "control":   { ".read": true, ".write": true },
       "estado":    { ".read": true, ".write": true }
     }
   }
   ```
   (evento de 4 días con datos no sensibles; si se quiere cerrar el moderador, poner `.write: "auth != null"` en `control` y añadir login anónimo + PIN.)
3. Project settings → Web app → copiar `firebaseConfig` y pegarlo en `assets/firebase-config.js`.

Mientras `apiKey` esté vacío la app corre en **modo demo**: las tres vistas se hablan entre pestañas
del mismo navegador, sin internet. Sirve para revisar la animación y probar flujos.

## Deploy

```bash
gh repo create claude-made/dggel-licon-2026 --public --source=. --push
# Settings → Pages → main / root
# https://claude-made.github.io/dggel-licon-2026/
```

## Datos que quedan

`/registros` guarda nombre, grupo y hora de cada participante: un dato del congreso que LICON
puede aprovechar (distribución de grupos, afluencia por hora). El moderador puede borrar todo.
