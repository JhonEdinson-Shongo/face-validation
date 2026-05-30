# Face Validation

<p align="center">
  <img src="https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB" alt="React" />
  <img src="https://img.shields.io/badge/Vite-646CFF?style=for-the-badge&logo=vite&logoColor=white" alt="Vite" />
  <img src="https://img.shields.io/badge/TypeScript-3178C6?style=for-the-badge&logo=typescript&logoColor=white" alt="TypeScript" />
  <img src="https://img.shields.io/badge/Zustand-000000?style=for-the-badge&logo=react&logoColor=white" alt="Zustand" />
  <img src="https://img.shields.io/badge/pnpm-F69220?style=for-the-badge&logo=pnpm&logoColor=white" alt="pnpm" />
  <img src="https://img.shields.io/badge/Bun-000000?style=for-the-badge&logo=bun&logoColor=white" alt="Bun" />
  <img src="https://img.shields.io/badge/TensorFlow.js-FF6F00?style=for-the-badge&logo=tensorflow&logoColor=white" alt="TensorFlow.js" />
</p>

Aplicación web que valida identidad mediante gestos faciales en tiempo real usando **face-api.js**. El usuario selecciona una combinación de gestos (parpadeo, cejas, giros, miradas), los realiza frente a la cámara, y se capturan 4 fotos como evidencia.

---

## ✨ Funcionalidades

- **6 gestos detectables:** cerrar ojos, alzar cejas, girar rostro (izq/der), mirar arriba/abajo
- **Combinaciones predefinidas:** 6 combos listos para usar (secuenciales y simultáneos)
- **Constructor personalizado:** crea tus propias combinaciones de gestos
- **Modo secuencial:** los gestos se realizan uno tras otro con tiempo límite
- **Modo simultáneo:** todos los gestos deben activarse a la vez
- **Countdown + 4 fotos:** 1 foto al completar el patrón + 3 tras cuenta regresiva
- **Grid 2×2** con las fotos capturadas
- **Tema oscuro / claro** con toggle manual y persistencia en localStorage
- **Challenge stepper** animado con nodos, checkmarks y glow

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

Abrir [http://localhost:5173](http://localhost:5173), selecciona una combinación y presiona **Iniciar**.

---

## 🛠️ Stack

| Tecnología | Propósito |
|---|---|
| **React 18** | UI declarativa basada en componentes |
| **Vite 5** | Build tool y dev server |
| **TypeScript** | Tipado estático |
| **Zustand** | Gestión de estado global |
| **face-api.js** | Detección facial y landmarks con TensorFlow.js |
| **TensorFlow.js** | Motor de inferencia ML en el navegador |
| **pnpm** | Gestor de dependencias |
| **Bun** | Runtime (compatible) |
| **CSS vanilla** | Sistema de diseño con tokens, dark/light mode |

---

## 📁 Estructura del proyecto

```
src/
├── components/
│   └── App.tsx                ─ Capa delgada: rutea vistas + theme toggle
├── features/
│   ├── catalog/
│   │   ├── Catalog.tsx        ─ Vista principal del catálogo
│   │   ├── GestureGrid.tsx    ─ Grid de gestos disponibles
│   │   ├── ComboList.tsx      ─ Combinaciones predefinidas
│   │   └── ComboBuilder.tsx   ─ Constructor personalizado
│   ├── validation/
│   │   ├── ValidationView.tsx ─ Vista de validación + lógica de detección
│   │   ├── ChallengeStepper.tsx─ Stepper animado con nodos por paso
│   │   ├── CaptureStatus.tsx  ─ Countdown + progreso de captura
│   │   └── PhotoGrid.tsx      ─ Grid 2x2 de fotos
│   └── webcam/
│       ├── VideoFeed.tsx      ─ Video + Canvas overlay
│       └── useWebcam.ts       ─ Hook de stream de cámara
├── hooks/
│   └── useFaceDetection.ts    ─ Modelos + RAF loop de detección
├── stores/
│   └── validationStore.ts     ─ Zustand store: view, combo, captura, countdown
├── styles/
│   └── tokens.css             ─ Design tokens con dark/light mode
├── utils/
│   ├── gestures.ts            ─ Algoritmos de detección de 6 gestos
│   └── ear.ts                 ─ Fórmula matemática EAR
├── types/
│   └── index.ts               ─ Tipos, constantes y combinaciones
├── main.tsx
└── index.css
```

---

## 🧠 Gestos detectados

| Gesto | Algoritmo |
|---|---|
| Cerrar ojos | EAR promedio < 0.25 |
| Alzar cejas | Distancia ceja-ojo / altura rostro > 0.24 |
| Girar derecha | Desplazamiento nariz > 0.22 hacia la derecha |
| Girar izquierda | Desplazamiento nariz > 0.22 hacia la izquierda |
| Mirar arriba | Vector nariz (punta-puente) / altura rostro < 0.16 |
| Mirar abajo | Vector nariz (punta-puente) / altura rostro > 0.34 |

---

## 🎨 Sistema de diseño

- **Borders-only depth strategy** (sin sombras en dark mode)
- **4 niveles de superficie** (`--bg`, `--surface-1/2/3`, `--inset`)
- **4 niveles de texto** (primary, secondary, tertiary, muted)
- **Bordes rgba sutiles** que desaparecen cuando no se buscan
- **Dark mode por defecto**, light mode via `prefers-color-scheme` + toggle manual
- **Persistencia** del tema en localStorage
- **Spacing system** basado en `--space-*` tokens (4px base)
- **Radios consistentes** (sm: 6px, md: 10px, lg: 14px)

---

## 📄 Licencia

MIT
