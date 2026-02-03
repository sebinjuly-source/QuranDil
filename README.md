# QuranDil ❤️📖

> **QuranDil** - A modern, production-ready PWA for Quran memorization (Hifz) with spaced repetition and visual flashcards.

[![Build Status](https://img.shields.io/badge/build-passing-brightgreen)]()
[![PWA Ready](https://img.shields.io/badge/PWA-ready-blue)]()
[![TypeScript](https://img.shields.io/badge/TypeScript-5.9-blue)]()
[![React](https://img.shields.io/badge/React-19.2-61dafb)]()

## 📸 Screenshots

### Light Mode
![QuranDil Light Mode](https://github.com/user-attachments/assets/f5b2dc38-a2ec-4421-a8a1-6e970ae73d66)

### With Side Pane
![QuranDil Side Pane](https://github.com/user-attachments/assets/4327dee3-fc6d-4b26-8575-69251091ee00)

### Dark Mode
![QuranDil Dark Mode](https://github.com/user-attachments/assets/0fa03726-9151-4a1b-aa2a-e30f33afd3cf)

## 🌟 Features

### Core Functionality

- **📄 Canvas-Based Mushaf Viewer**
  - Layered canvas architecture for 60fps performance
  - Word-level selection and hit-testing
  - RTL Arabic text rendering
  - Zoom and pan controls
  - 604 pages of Madani Mushaf

- **🃏 Flashcard System (5 Types)**
  - 🔴 **Mistake** - Mark recitation errors
  - 🟡 **Mutashabihat** - Similar verses comparison
  - 🔵 **Transition** - Ayah-to-ayah flow
  - 🟣 **Custom Transition** - Mid-ayah transitions
  - ⚪ **Page Number** - Auto-generated page recall

- **🧠 FSRS Spaced Repetition Engine**
  - Pure TypeScript implementation
  - Hifz-optimized parameters (90% retention)
  - 4-button rating system (Again/Hard/Good/Easy)
  - Adaptive scheduling per card type

- **🎯 Smart Selection System**
  - Click to select words/verses
  - Context menu with flashcard options
  - Quick access to common actions

- **📱 Progressive Web App**
  - Offline-first with IndexedDB caching
  - Installable on desktop and mobile
  - Service worker for asset caching
  - Quran.com API integration with 1-year cache

- **🎨 Beautiful UI/UX**
  - Premium glassmorphic design
  - Light and dark themes
  - Calm, distraction-free interface
  - Responsive layout for all devices

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ 
- npm or yarn

### Installation

```bash
# Clone the repository
git clone https://github.com/sebinjuly-source/QuranDil.git
cd QuranDil

# Install dependencies
npm install

# Start development server
npm run dev
```

Visit `http://localhost:5173` in your browser.

### Build for Production

```bash
# Build the app
npm run build

# Preview production build
npm run preview
```

The built files will be in the `dist/` directory, ready for deployment.

## 📁 Project Structure

```
QuranDil/
├── src/
│   ├── data/              # Static data (Surah info, Mushaf fingerprints, Tajweed colors)
│   │   ├── surahData.ts
│   │   ├── knownMushafs.ts
│   │   └── tajweedColors.ts
│   ├── engines/           # Business logic layer (NO UI)
│   │   ├── QuranApiClient.ts          # Cached Quran.com API client
│   │   ├── MushafRebuilder.ts         # Page reconstruction
│   │   ├── AyahWordMapper.ts          # Word-level mapping & hit-testing
│   │   ├── FSRSEngine.ts              # Spaced repetition algorithm
│   │   ├── CommandStack.ts            # Undo/redo system
│   │   ├── AnnotationStore.ts         # Drawing/highlight persistence
│   │   └── index.ts
│   ├── state/             # State management
│   │   ├── AppEngine.ts               # Singleton engine coordinator
│   │   └── useAppStore.ts             # Zustand store
│   ├── components/        # React UI components
│   │   ├── MushafViewer/
│   │   │   ├── MushafViewer.tsx
│   │   │   ├── NavigationBar.tsx
│   │   │   └── SelectionPopup.tsx
│   │   ├── SidePane/
│   │   │   └── SidePane.tsx
│   │   └── Audio/
│   │       └── AudioPlayer.tsx
│   ├── App.tsx            # Main app component
│   ├── main.tsx           # Entry point
│   └── index.css          # Global styles
├── public/                # Static assets
├── index.html
├── vite.config.ts         # Vite configuration
├── tsconfig.json          # TypeScript configuration
└── package.json
```

## 🎯 Architecture

### Engine Layer (Business Logic)

The engine layer is completely UI-agnostic and handles all business logic:

- **QuranApiClient**: Fetches and caches Quran data from Quran.com API
- **MushafRebuilder**: Reconstructs Mushaf pages preserving boundaries
- **AyahWordMapper**: Provides word-level spatial mapping for hit-testing
- **FSRSEngine**: Implements the FSRS spaced repetition algorithm
- **CommandStack**: Manages undo/redo operations
- **AnnotationStore**: Persists drawings and highlights to IndexedDB

### State Layer

- **AppEngine**: Singleton that coordinates all engines
- **useAppStore**: Zustand store for UI state management

### Component Layer

React components consume state and engines to render the UI. All components are built with TypeScript for type safety.

## 🛠️ Technologies

- **Frontend**: React 19.2, TypeScript 5.9
- **State Management**: Zustand 5.0
- **Build Tool**: Vite 7.3
- **PWA**: vite-plugin-pwa with Workbox
- **Storage**: IndexedDB (native browser API)
- **API**: Quran.com API v4

## 🎨 Design System

### Colors

- **Accent Red**: `#dc2626` - Primary accent color (brand color)
- **Accent Gold**: `#c19a6b` - Secondary accent (Mushaf border)
- **Flashcard Types**:
  - Mistake: `#ef4444` (Bright Red)
  - Mutashabihat: `#eab308` (Yellow)
  - Transition: `#3b82f6` (Blue)
  - Custom Transition: `#a855f7` (Purple)
  - Page Number: `#9ca3af` (Gray)

### Typography

- **Primary Font**: System fonts (-apple-system, Segoe UI, Roboto, etc.)
- **Arabic Font**: Traditional Arabic, Scheherazade New (serif)

### Themes

- **Light Theme**: Cream background (#faf9f7) with dark text
- **Dark Theme**: Dark background (#1a1a1a) with light text

## 📚 Usage

### Navigation

- **Page Navigation**: Use arrow buttons or input field to jump to any page (1-604)
- **Zoom Controls**: Use + and - buttons to zoom in/out (50%-300%)

### Creating Flashcards

1. Click on the Mushaf canvas to select text
2. Choose a flashcard type from the popup menu
3. The side pane will open with the flashcard editor
4. Review and save your flashcard

### Reviewing Flashcards

1. Click the flashcard button (📝) to open the side pane
2. Start a review session
3. Rate each card: Again (1), Hard (2), Good (3), or Easy (4)
4. The FSRS algorithm schedules the next review

## 🔧 Configuration

### Known Mushafs

The app comes pre-configured with common Mushaf types:

- Madani 15-line (King Fahd) - 604 pages
- Madani 15-line with Tajweed - 604 pages
- Indo-Pak 13-line - 540 pages
- Madani 16-line (Warsh) - 559 pages

Additional Mushafs can be added in `src/data/knownMushafs.ts`.

## 🤝 Contributing

Contributions are welcome! Please follow these guidelines:

1. Fork the repository
2. Create a feature branch: `git checkout -b feature-name`
3. Make your changes with clear commit messages
4. Ensure TypeScript compilation passes: `npm run build`
5. Submit a pull request

### Development Guidelines

- Write TypeScript with strict type checking
- Keep business logic in the engine layer (no UI dependencies)
- Use Zustand for state management
- Follow the existing code style
- Add JSDoc comments for public APIs

## 📄 License

ISC License

## 🙏 Acknowledgments

- **Quran.com** - For providing the excellent Quran API
- **FSRS** - For the spaced repetition algorithm
- **React Community** - For the amazing ecosystem

---

Made with ❤️ for the Ummah
