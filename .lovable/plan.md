
# 🌍 AlienFlow - Telegram Mini App

## Visión General
Una experiencia de minería de Energía Punto Cero con estética **Greenpunk/Solarpunk**. El usuario es un "Alien" que extrae energía del núcleo de la Tierra a través de un Toroide gravitatorio.

---

## 🎨 Diseño Visual
- **Paleta**: Fondo #000 (negro profundo), Verde Neón #39FF14, Oro Tesla #D4AF37
- **Estilo**: Cinematográfico, futurista, con brillos, halos y partículas flotantes
- **Tipografía**: Sans-serif futurista con efectos de brillo neón

---

## 📱 Pantallas

### 1. PLANETA (Pantalla Principal)
- **Tierra 3D** central rotando con Three.js (texturas realistas, nubes, atmósfera brillante)
- **6 slots hexagonales** orbitando alrededor:
  - Slot 1: "Core Mina" — Estilo Solarpunk con animación de actividad
  - Slots 2-6: Bloqueados con candado dorado animado
- **Tutorial inicial**: Overlay Greenpunk con pasos guiados y tooltips animados

### 2. MINA
- **Toroide central** con animaciones 2D premium en Framer Motion:
  - Flujo gravitatorio continuo con partículas verde neón
  - Pulso magnético al ritmo del tap
  - Ondas expansivas al extraer energía
- **Interacción**: Tap = +1 Energía, -1 Stamina, vibración visual y efecto de sonido
- **Indicadores**: Contador de Energía y barra de Stamina visibles

### 3. RED (Conexiones Sociales)
- **Botón "Conectar Wallet TON"** prominente (funcionalidad preparada para futuro)
- **Sección Misiones** (+50 Energía cada una):
  - Facebook, Instagram, LinkedIn, Telegram, X (Twitter) — Orden alfabético
  - Flujo: Clic → Abre enlace → Al volver, "Verificando..." (33s) → "Reclamar Recompensa"
- **Sección Ecosistema** (orden alfabético):
  - AlienFlow DAO, Discord (Coming Soon), Email, GitBook, GitHub, LinkedIn Personal, Reddit, Threads, TikTok (Coming Soon)
- **Sección Legado**: 2 colecciones de OpenSea NFTs

---

## ⚙️ Mecánicas de Juego

### Stamina
- Máximo: 100 puntos
- Recarga: +1 cada 60 segundos automáticamente
- Persistencia en Supabase (sincronizado entre dispositivos)

### Energía Punto Cero
- Contador acumulativo sin límite
- Se gana: +1 por tap en Toroide, +50 por misión completada
- Sincronizado en la nube via Supabase

### Verificación de Misiones
- Sistema de "Verificación con Retraso Simulado"
- Contador de 33 segundos post-visita antes de poder reclamar
- Estado guardado en Supabase para evitar repetición

---

## 🎵 Audio Inmersivo
- **Música ambiental** Solarpunk/electrónica orgánica (loop continuo, toggleable)
- **Efectos de sonido**:
  - Tap en Toroide: pulso energético
  - Misión completada: tono de logro
  - Navegación: transiciones suaves
  - Tutorial: notificaciones sutiles

---

## 🔧 Integraciones Técnicas

### Telegram Mini App
- SDK oficial de Telegram WebApp
- `window.Telegram.WebApp.expand()` para pantalla completa
- Todos los enlaces abren en ventana nueva

### Backend (Supabase)
- **Tablas**: usuarios, stamina, energía, misiones_completadas
- **Autenticación**: Via Telegram user_id
- **Sincronización**: Tiempo real para progreso entre dispositivos
- **Edge Functions**: Para audio (ElevenLabs) y validaciones

### Tecnologías Frontend
- React + TypeScript + Vite
- Three.js + @react-three/fiber (Tierra 3D)
- Framer Motion (Toroide y animaciones UI)
- Tailwind CSS (estilos Greenpunk)

---

## 📋 Sistema de Tutorial

1. **Paso 1**: "Bienvenido Alien. Este es el Planeta Tierra Nivel 0."
2. **Paso 2**: "Pulsa en la Core Mina para entrar al núcleo de energía."
3. **Paso 3**: "En la Mina, pulsa el Toroide para extraer Energía Punto Cero."

Cada paso con overlay oscuro, spotlight en el elemento relevante, y animación de siguiente paso.
