# Prototipo DPBT

Prototipo web mobile para ayudar a ordenar lo observado ante un desperfecto doméstico y elegir un próximo paso. Implementado con React, TypeScript y Vite a partir de las 13 pantallas de `FIGMA/Untitled.pdf`.

## Instalar y ejecutar

Requiere Node.js 20.19+ o 22.12+ y npm.

```sh
npm install
npm run dev
```

Abrí http://127.0.0.1:5173. Para abrirlo desde un teléfono en la misma red, ejecutá `npm run dev -- --host 0.0.0.0` y usá la dirección de red que indica Vite.

```sh
npm run build
npm run preview
```

## Probar el recorrido

1. Editá la descripción precargada del lavarropas y, si querés, agregá una foto/video simulado.
2. Respondé las tres preguntas. Para el caso del PDF, elegí **Sí / No / No**.
3. Revisá el resumen y las advertencias, y compará las cuatro alternativas.
4. Entrá en una comparación y elegí ese paso. Desde «Tu próximo paso», podés continuar con otra alternativa o pulsar «Definir mi próximo paso» para ver su confirmación.
5. Pulsá «Finalizar» para llegar a «Recorrido finalizado». Desde la confirmación y el cierre podés volver a las alternativas.

Las cuatro alternativas se presentan sin una recomendación automática. El resumen distingue lo que sabemos de lo que todavía no sabemos y se actualiza al corregir las respuestas. Se puede continuar de información del modelo a comprobación básica, de comprobación básica a orientación y de orientación a técnico, pasando por la comparación correspondiente.

Los datos se conservan al navegar y al recargar en la misma pestaña mediante `sessionStorage`. Cerrá la pestaña para comenzar una nueva sesión. Las fotos/videos son adjuntos simulados: no se accede a la cámara ni se suben archivos. No se envían datos, se contactan personas ni se consultan servicios externos.

Se conserva el diseño de baja fidelidad, los textos y la estructura de siete pasos del PDF. Los resúmenes cambian con las respuestas y la descripción. Se añadieron únicamente las interacciones necesarias: adjunto simulado, registro de acciones realizadas y contenido de observación al pulsar «Comenzar comprobación».

## Verificación

Las pruebas recorren las cuatro ramas, los cambios de decisión, el estado al volver/recargar, los campos editables, los adjuntos simulados, las confirmaciones, el cierre, las conexiones entre alternativas y los anchos de 320, 390, 768 y 1440 px.

```sh
npm run test:e2e
```

Usan Playwright con Google Chrome instalado. Si no está disponible, instalá Chrome o adaptá `channel` en `playwright.config.ts` a tu navegador de Playwright.

La orientación es simulada, no identifica causas ni garantiza seguridad. El prototipo no ofrece instrucciones de reparación.
