# Face Validation

<p align="center">
  <img src="https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB" alt="React" />
  <img src="https://img.shields.io/badge/Vite-646CFF?style=for-the-badge&logo=vite&logoColor=white" alt="Vite" />
  <img src="https://img.shields.io/badge/TypeScript-3178C6?style=for-the-badge&logo=typescript&logoColor=white" alt="TypeScript" />
  <img src="https://img.shields.io/badge/pnpm-F69220?style=for-the-badge&logo=pnpm&logoColor=white" alt="pnpm" />
  <img src="https://img.shields.io/badge/Bun-000000?style=for-the-badge&logo=bun&logoColor=white" alt="Bun" />
  <img src="https://img.shields.io/badge/TensorFlow.js-FF6F00?style=for-the-badge&logo=tensorflow&logoColor=white" alt="TensorFlow.js" />
</p>

Aplicación web que detecta rostros en tiempo real usando **face-api.js** y captura fotos automáticamente al detectar un parpadeo. Tras el primer parpadeo, toma 3 fotos adicionales en un lapso de 3 segundos (1 por segundo).

---

## ✨ Funcionalidades

- **Detección facial en tiempo real** via webcam usando TinyFaceDetector
- **68 puntos de referencia facial** (landmarks) dibujados sobre el rostro
- **Detección de parpadeo** mediante Eye Aspect Ratio (EAR)
- **Captura automática de 4 fotos:** 1 al parpadear + 3 cada 1s
- **Grid 2×2** con las fotos capturadas
- **Interfaz oscura** minimalista y responsive

---

## 🚀 Uso rápido

```bash
# Clonar
git clone <repo-url>
cd face-validation

# Instalar dependencias (pnpm requerido)
pnpm install

# Descargar modelos de face-api.js
pnpm run models

# Iniciar servidor de desarrollo
pnpm run dev
```

Abrir [http://localhost:5173](http://localhost:5173) y presionar **Iniciar**.

---

## 🛠️ Stack

| Tecnología | Propósito |
|---|---|
| **React 18** | UI declarativa basada en componentes |
| **Vite 5** | Build tool y dev server ultrarrápido |
| **TypeScript** | Tipado estático |
| **face-api.js** | Detección facial y landmarks con TensorFlow.js |
| **TensorFlow.js** | Motor de inferencia ML en el navegador |
| **pnpm** | Gestor de dependencias |
| **Bun** | Runtime (compatible) |
| **CSS vanilla** | Estilos oscuros responsive |

---

## 📁 Estructura del proyecto

```
src/
├── components/          # Componentes React
│   ├── App.tsx          ─ Orquestador principal
│   ├── VideoFeed.tsx    ─ Video + Canvas overlay
│   ├── StatusIndicator.tsx ─ Estado y contador
│   ├── PhotoGrid.tsx    ─ Grid 2x2 de fotos
│   └── Controls.tsx     ─ Botones Start/Reset
├── hooks/               # Custom hooks
│   ├── useWebcam.ts     ─ Stream de cámara
│   ├── useFaceDetection.ts ─ Modelos + loop de detección
│   └── useBlinkCapture.ts ─ EAR + secuencia de captura
├── utils/
│   └── ear.ts           ─ Fórmula matemática EAR
├── types/
│   └── index.ts         ─ Tipos compartidos
├── main.tsx
└── index.css
```

---

## 📄 Licencia

MIT
