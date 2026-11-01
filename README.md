# EquipTrack

EquipTrack is a mobile application designed for school campus management and equipment tracking. It helps staff register students, assign equipment, simulate RFID/NFC badge scans, monitor attendance, review access history, and configure the app theme and system preferences.

The project is built with Expo and React Native, and uses Expo Router for screen navigation. Its workflow is centered around a French school context, with examples such as student registration, class selection, attendance states (present, late, absent), scan logs, and equipment assignment.

## What the app does

- Register new students with their personal and equipment information
- Assign a class/section and RFID/NFC badge identifier
- Search and filter students by name, class, tag, or equipment
- View current student directory and update attendance status
- Review scan history with filters and exportable CSV data
- Manage notifications, theme settings, and app configuration
- Demonstrate interactive mobile UI patterns for a school access system

## Project structure

```text
EquipTrack/
├─ app.json
├─ package.json
├─ src/
│  ├─ app/
│  │  ├─ _layout.jsx
│  │  ├─ index.jsx
│  │  ├─ inscription.jsx
│  │  ├─ historique.jsx
│  │  └─ parametres.jsx
│  ├─ components/
│  │  ├─ BottomTabBar.jsx
│  │  ├─ HeaderBar.jsx
│  │  └─ Toast.jsx
│  ├─ context/
│  │  └─ EquipTrackContext.jsx
│  ├─ constants/
│  │  └─ theme.js
│  └─ global.css
├─ assets/
├─ scripts/
├─ LICENSE
├─ README.md
└─ AGENTS.md
```

## Tech stack

- Expo SDK / React Native
- Expo Router for app navigation
- React Native components for mobile UI
- Haptics and clipboard support for interactive device behavior
- In-memory mock data for demo usage (no backend database is configured in the current version)

## Prerequisites

Before installing and running the app, make sure you have:

- Node.js 18+ or 20+ LTS recommended
- npm (usually bundled with Node.js)
- Git
- An emulator/simulator or a real device for testing, if needed

For Android development, Android Studio is recommended. For iOS, Xcode is required on macOS.

## Installation

1. Clone the repository

```bash
git clone https://github.com/2ymenzitouni/EquipTrack.git
cd EquipTrack
```

2. Install dependencies

```bash
npm install
```

3. Start the Expo development server

```bash
npx expo start
```

Alternatively, you can run the app directly in a target environment:

```bash
npm run android
npm run ios
npm run web
```

## Running the app

After starting the development server:

- Press `a` to launch the Android emulator
- Press `i` to open the iOS simulator
- Press `w` to run in the browser
- Or scan the QR code with the Expo Go app on a physical device

## Linting

To check code quality and linting:

```bash
npm run lint
```

## Notes

This repository currently contains a functioning demo-style mobile application with mock student and scan data. It is designed as a front-end prototype for a school access and equipment tracking system, rather than a full production-ready backend-integrated solution.

If you want to extend the project, the main development entry points are:

- `src/app/` for screens
- `src/context/EquipTrackContext.jsx` for app state and mock data
- `src/components/` for shared UI components

## License

This project is licensed under the MIT License. See the `LICENSE` file for details.
