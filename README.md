<div align="center">
  <img src="https://images.unsplash.com/photo-1522202176988-66273c2fd55f?auto=format&fit=crop&w=1200&q=80" alt="School campus management" width="1000" />
</div>

# EquipTrack

<p align="center">
  <img src="https://img.shields.io/badge/Expo-React%20Native-61dafb?style=for-the-badge&logo=expo" alt="Expo React Native" />
  <img src="https://img.shields.io/badge/Platform-Android%20%7C%20iOS%20%7C%20Web-7c3aed?style=for-the-badge" alt="Cross-platform" />
  <img src="https://img.shields.io/badge/Status-Demo%20App-22c55e?style=for-the-badge" alt="Status" />
</p>

<p align="center">
  <strong>Smart campus management for tracking students, equipment, RFID/NFC access, and attendance.</strong>
</p>

<div align="center">
  <a href="#installation">🚀 Installation</a>
  <span> · </span>
  <a href="#features">✨ Features</a>
  <span> · </span>
  <a href="#project-structure">📁 Structure</a>
</div>

<hr />

<h2 style="color:#4338ca;">🎯 Overview</h2>

EquipTrack is a mobile application designed for school and campus management. It helps staff register students, assign equipment, simulate RFID/NFC badge scans, follow attendance, review historical access data, and configure the app experience.

The project is built with Expo and React Native, and it uses Expo Router for mobile navigation. The interface is focused on a school environment with sections like student registration, class filtering, access logs, equipment assignment, and system settings.

<h2 style="color:#0ea5e9;">✨ Features</h2>

- 🧑‍🎓 Register new students with personal information and equipment details
- 📱 Manage student directory and filter by class, name, tag, or equipment
- 🏷️ Assign RFID/NFC badge identifiers to each student
- ✅ Update attendance statuses such as present, late, or absent
- 📊 Review historical scan activity and search through logs
- 📤 Export access history in CSV format
- 🔔 Manage notifications and app alerts
- 🌗 Switch between light and dark themes
- 🧩 Built as a modern Expo mobile interface prototype

<h2 style="color:#f59e0b;">🖼️ App Preview</h2>

<div align="center">
  <img src="https://images.unsplash.com/photo-1513258496099-48168024aec0?auto=format&fit=crop&w=1200&q=80" alt="School app dashboard" width="900" />
</div>

<h2 style="color:#16a34a;">🛠️ Tech Stack</h2>

- Expo SDK
- React Native
- Expo Router
- JavaScript / JSX
- Haptics and clipboard support for interactive mobile behavior
- Mock in-memory data for demo usage

<h2 style="color:#7c3aed;">📁 Project Structure</h2>

```text
EquipTrack/
├─ app.json
├─ package.json
├─ README.md
├─ LICENSE
├─ AGENTS.md
├─ assets/
├─ scripts/
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
└─
```

<h2 style="color:#dc2626;">⚙️ Prerequisites</h2>

Before running the app, make sure you have:

- Node.js 18+ or 20+ LTS recommended
- npm
- Git
- Android Studio for Android testing, or Xcode for iOS on macOS
- A physical device or simulator/emulator for testing

<h2 style="color:#10b981;">🚀 Installation</h2>

1. Clone the repository:

```bash
git clone https://github.com/2ymenzitouni/EquipTrack.git
cd EquipTrack
```

2. Install dependencies:

```bash
npm install
```

3. Start the Expo development server:

```bash
npx expo start
```

4. Run the app on your preferred platform:

```bash
npm run android
npm run ios
npm run web
```

You can also open the app with the Expo Go mobile app by scanning the QR code from the terminal output.

<h2 style="color:#0ea5e9;">🗄️ Supabase registration setup</h2>

Before using the registration form, run [`supabase/registration.sql`](./supabase/registration.sql) in the Supabase SQL Editor. It creates the atomic student-and-loan registration function and the anonymous insert policies required by the app.

The app uses a Supabase publishable key in `src/constants/supabase.js`; publishable keys are intended for client apps and are not service-role secrets. The SQL policies allow unauthenticated clients to insert student and loan records, so use this setup only if public registration writes are acceptable for your project.

<h2 style="color:#f43f5e;">✅ Linting</h2>

To run the project linter:

```bash
npm run lint
```

<h2 style="color:#0284c7;">📝 Notes</h2>

This project is currently a front-end demo application with mock student and access data. It is designed as a prototype for a campus equipment and attendance management system, rather than a full backend-integrated production solution.

Main development areas:

- `src/app/` for screens
- `src/context/EquipTrackContext.jsx` for shared app state and mock data
- `src/components/` for reusable UI blocks

<h2 style="color:#0f172a;">📄 License</h2>

This project is licensed under the MIT License. See the `LICENSE` file for details.
