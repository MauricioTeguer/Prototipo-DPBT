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
2. Respondé las tres preguntas. Para el caso del PDF, elegí **Sí / No / No**. También podés elegir **No sé**.
3. Revisá el resumen y las advertencias, y compará las cuatro alternativas.
4. Entrá en un detalle y elegí ese paso para ver su cierre específico. Volvé a las alternativas para cambiar la decisión.

Las respuestas **Sí / No / No** sugieren una comprobación básica; un código de error orienta al manual; un ruido, olor o comportamiento diferente orienta a un técnico; las dudas o un ciclo incompleto orientan a pedir ayuda. Son reglas predefinidas para la prueba, sin diagnóstico técnico.

Los datos se conservan al navegar y al recargar en la misma pestaña mediante `sessionStorage`. Cerrá la pestaña para comenzar una nueva sesión. Las fotos/videos son adjuntos simulados: no se accede a la cámara ni se suben archivos. No se envían datos, se contactan personas ni se consultan servicios externos.

Se conserva el diseño de baja fidelidad, los textos y la estructura de siete pasos del PDF. Los resúmenes cambian con las respuestas y la descripción. Se añadieron únicamente las interacciones necesarias: adjunto simulado, registro de acciones realizadas y contenido de observación al pulsar «Comenzar comprobación».

## Verificación

Las pruebas recorren las cuatro ramas, los cambios de decisión, el estado al volver/recargar, los campos editables, los adjuntos simulados, las recomendaciones y los anchos de 320, 390, 768 y 1440 px.

```sh
npm run test:e2e
```

Usan Playwright con Google Chrome instalado. Si no está disponible, instalá Chrome o adaptá `channel` en `playwright.config.ts` a tu navegador de Playwright.

La orientación es simulada, no identifica causas ni garantiza seguridad. El prototipo no ofrece instrucciones de reparación.
