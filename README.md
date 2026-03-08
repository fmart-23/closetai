# ClosetAI 👗✨

> **AI-powered digital wardrobe management** — scan clothing items with your camera, let GPT-4 Vision identify them, and get personalized outfit recommendations built from your own closet.

---

## Table of Contents

1. [Overview](#overview)
2. [Tech Stack](#tech-stack)
3. [Project Structure](#project-structure)
4. [Backend Setup](#backend-setup)
5. [Mobile App Setup](#mobile-app-setup)
   - [iOS Simulator](#ios-simulator)
   - [Physical iPhone](#physical-iphone)
   - [EAS Build (production)](#eas-build-production)
6. [Environment Variables](#environment-variables)
7. [API Reference](#api-reference)
8. [Features](#features)

---

## Overview

ClosetAI lets you:

- 📸 **Scan** clothing items using your camera or photo library
- 🤖 **Identify** garments automatically via GPT-4 Vision (category, color, pattern, style, season)
- 👗 **Organise** your full wardrobe in a searchable, filterable grid
- ✨ **Generate** outfit combinations tailored to the occasion, weather, and your personal style
- 💾 **Save** favourite outfits for quick reference

The backend works entirely without an OpenAI API key — a smart mock classifier and recommender are used as fallbacks, so you can develop and demo the app offline.

---

## Tech Stack

| Layer | Technology |
|---|---|
| Mobile | React Native + Expo SDK 51 (iOS-first) |
| Navigation | React Navigation v6 (stack + bottom tabs) |
| HTTP client | Axios |
| Backend | Python 3.11 + FastAPI |
| Database | SQLite via SQLAlchemy |
| AI (optional) | OpenAI GPT-4o Vision API |
| Image handling | Pillow (server-side), expo-image-picker (client) |

---

## Project Structure

```
closetai/
├── README.md
├── .gitignore
├── mobile/                        # Expo React Native app
│   ├── App.js                     # Entry point
│   ├── app.json                   # Expo config
│   ├── eas.json                   # EAS Build config
│   ├── babel.config.js
│   ├── package.json
│   ├── .env.example
│   ├── assets/                    # icon.png, splash.png, adaptive-icon.png
│   └── src/
│       ├── constants/
│       │   ├── colors.js          # Design tokens
│       │   └── config.js          # API URL, categories, etc.
│       ├── utils/
│       │   └── helpers.js         # formatDate, capitalize, etc.
│       ├── services/
│       │   └── api.js             # clothingAPI + outfitsAPI (axios)
│       ├── navigation/
│       │   └── AppNavigator.js    # Tab + stack navigators
│       ├── components/
│       │   ├── ClothingCard.js
│       │   ├── FilterChips.js
│       │   ├── OutfitCard.js
│       │   ├── LoadingSpinner.js
│       │   └── EmptyState.js
│       └── screens/
│           ├── HomeScreen.js
│           ├── ScanScreen.js
│           ├── ClosetScreen.js
│           ├── ItemDetailScreen.js
│           ├── OutfitScreen.js
│           └── OutfitResultScreen.js
└── backend/                       # FastAPI backend
    ├── main.py                    # App factory, CORS, static files
    ├── database.py                # SQLAlchemy engine + session
    ├── models.py                  # ORM models + Pydantic schemas
    ├── requirements.txt
    ├── .env.example
    ├── routers/
    │   ├── clothing.py            # /api/clothing CRUD
    │   └── outfits.py             # /api/outfits recommendation + CRUD
    └── services/
        ├── vision.py              # GPT-4 Vision classifier (+ mock)
        └── recommender.py        # GPT outfit recommender (+ mock)
```

---

## Backend Setup

### Prerequisites

- Python 3.10+
- `pip` or `pip3`

### Steps

```bash
cd backend

# 1. Create a virtual environment
python3 -m venv venv
source venv/bin/activate   # Windows: venv\Scripts\activate

# 2. Install dependencies
pip install -r requirements.txt

# 3. Copy and edit environment variables
cp .env.example .env
# Edit .env — add your OPENAI_API_KEY if you have one (optional)

# 4. Start the server
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

The API will be available at **http://localhost:8000**.  
Interactive docs: **http://localhost:8000/docs**

> **No API key needed** — the backend uses a mock classifier and recommender when `OPENAI_API_KEY` is absent, so you can test all features immediately.

---

## Mobile App Setup

### Prerequisites

- Node.js 18+
- [Expo CLI](https://docs.expo.dev/get-started/installation/): `npm install -g expo-cli`
- [EAS CLI](https://docs.expo.dev/eas/) (for device/production builds): `npm install -g eas-cli`
- Xcode 15+ (for iOS simulator / physical device)
- [Expo Go](https://apps.apple.com/app/expo-go/id982107779) app (for running on a physical device without building)

### Install dependencies

```bash
cd mobile
npm install
```

### Configure the API URL

```bash
cp .env.example .env
```

Edit `.env`:

```env
# If running on the iOS Simulator, use localhost:
EXPO_PUBLIC_API_URL=http://localhost:8000

# If running on a physical iPhone on the same Wi-Fi network,
# use your Mac's local IP address:
EXPO_PUBLIC_API_URL=http://192.168.1.x:8000
```

---

### iOS Simulator

Make sure Xcode and the iOS Simulator are installed, then:

```bash
cd mobile
npm run ios
# or: npx expo start --ios
```

Expo will build a development client and launch it in the iOS Simulator automatically.

---

### Physical iPhone

**Option A — Expo Go (easiest, no build required)**

1. Install **Expo Go** from the App Store on your iPhone.
2. Start the dev server: `npx expo start`
3. Scan the QR code shown in the terminal with your iPhone camera.
4. Set `EXPO_PUBLIC_API_URL` to your Mac's local IP (e.g. `http://192.168.1.50:8000`).

**Option B — Development build (recommended for camera features)**

```bash
cd mobile

# Log in to your Expo / EAS account
eas login

# Configure the project (first time only)
eas build:configure

# Build a development client for your connected iPhone
eas build --platform ios --profile development

# After install, start the dev server
npx expo start --dev-client
```

---

### EAS Build (production / TestFlight)

```bash
cd mobile

# Preview build (ad-hoc distribution, iOS Simulator)
eas build --platform ios --profile preview

# Production build (App Store / TestFlight)
eas build --platform ios --profile production

# Submit to App Store Connect
eas submit --platform ios
```

Before submitting, update `eas.json` with your Apple credentials:

```json
"submit": {
  "production": {
    "ios": {
      "appleId": "your@apple.com",
      "ascAppId": "1234567890",
      "appleTeamId": "XXXXXXXXXX"
    }
  }
}
```

---

## Environment Variables

### Backend (`backend/.env`)

| Variable | Default | Description |
|---|---|---|
| `OPENAI_API_KEY` | _(empty)_ | OpenAI API key. **Optional** — mock is used when absent. |
| `DATABASE_URL` | `sqlite:///./closetai.db` | SQLAlchemy database URL |
| `UPLOAD_DIR` | `./uploads` | Directory where uploaded images are stored |
| `CORS_ORIGINS` | localhost dev ports | Comma-separated list of allowed CORS origins |

### Mobile (`mobile/.env`)

| Variable | Default | Description |
|---|---|---|
| `EXPO_PUBLIC_API_URL` | `http://localhost:8000` | Base URL of the FastAPI backend |

---

## API Reference

| Method | Path | Description |
|---|---|---|
| `GET` | `/health` | Health check |
| `POST` | `/api/clothing` | Upload image + create item (multipart) |
| `GET` | `/api/clothing` | List items (supports `?category=`, `?color=`, `?search=`) |
| `GET` | `/api/clothing/:id` | Get single item |
| `PUT` | `/api/clothing/:id` | Update item metadata |
| `DELETE` | `/api/clothing/:id` | Delete item + image file |
| `POST` | `/api/outfits/recommend` | Generate AI outfit recommendation |
| `GET` | `/api/outfits` | List saved outfits |
| `POST` | `/api/outfits` | Save an outfit |
| `GET` | `/api/outfits/:id` | Get single outfit |
| `DELETE` | `/api/outfits/:id` | Delete outfit |

Full interactive documentation available at `/docs` when the backend is running.

---

## Features

- 🌑 **Dark mode first** — deep navy + purple + pink accent design system
- 📷 **Camera & library** — uses `expo-image-picker` for both sources
- 🤖 **AI classification** — GPT-4 Vision identifies category, color, pattern, style, season
- 🔍 **Search & filter** — real-time search + category chips on the closet screen
- ✨ **Outfit generator** — occasion × weather × style preference matrix
- 💾 **Persistent storage** — SQLite backend with full CRUD
- 📱 **Haptic feedback** — success haptics on save/scan actions
- 🔄 **Pull-to-refresh** — all list screens support pull-to-refresh
- 🛡️ **Offline-friendly mock** — full app flow works without any API key
