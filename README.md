# ClosetAI 👗✨

**ClosetAI** is a native iOS mobile app built with **React Native + Expo** that helps you organize your wardrobe and get AI-powered outfit suggestions — completely offline, no API keys needed.

## Features

- 📷 **Scan & Upload Clothes** — Take photos with your camera or import from your photo library
- 🤖 **On-Device AI Classification** — Clothing type detection using TensorFlow Lite (with smart manual fallback)
- 👗 **Digital Closet** — Visual grid gallery of all your clothing items with filters and search
- ✨ **Outfit Generator** — Rule-based outfit suggestions using color theory, style matching, season, and occasion
- ❤️ **Saved Outfits** — Save and favorite your best outfit combinations
- 📊 **Closet Stats** — Dashboard with insights about your wardrobe
- 🌓 **Dark Mode Support** — Beautiful in both light and dark mode
- 📱 **100% Offline** — No internet connection required

## Tech Stack

| Technology | Purpose |
|---|---|
| React Native + Expo | Native iOS app framework |
| React Navigation | Tab + stack navigation |
| AsyncStorage | Local clothing data storage |
| expo-file-system | Local image storage |
| expo-camera | Native camera access |
| expo-image-picker | Photo library access |
| @tensorflow/tfjs | On-device AI (optional) |
| expo-haptics | Native haptic feedback |

## No API Keys Required

Everything runs on your device:
- ✅ Clothing classification: On-device (TF Lite) or manual selection
- ✅ Outfit recommendations: Rule-based algorithm using color theory
- ✅ Data storage: Local AsyncStorage + expo-file-system
- ✅ Works completely offline

## Project Structure

```
closetai/
├── App.js                          # App entry point
├── app.json                        # Expo configuration
├── eas.json                        # EAS Build configuration
├── babel.config.js
├── package.json
├── assets/                         # App icons and splash screen
├── src/
│   ├── navigation/AppNavigator.js  # Tab + Stack navigation
│   ├── screens/
│   │   ├── HomeScreen.js           # Dashboard
│   │   ├── ScanScreen.js           # Camera + classification
│   │   ├── ClosetScreen.js         # Clothing gallery
│   │   ├── ItemDetailScreen.js     # Item details + edit
│   │   ├── OutfitScreen.js         # Outfit generator
│   │   ├── OutfitResultScreen.js   # Generated outfits
│   │   └── SavedOutfitsScreen.js   # Saved favorites
│   ├── components/                 # Reusable UI components
│   ├── services/
│   │   ├── classifier.js           # TF Lite clothing classifier
│   │   ├── colorDetector.js        # Color detection
│   │   ├── outfitEngine.js         # Rule-based outfit engine
│   │   └── storage.js              # Local storage service
│   ├── constants/                  # Colors, categories, config
│   ├── utils/                      # Color theory, helpers
│   └── hooks/                      # useCloset, useOutfits
└── models/                         # TF model files (see models/README.md)
```

## Installation

### Prerequisites

- [Node.js](https://nodejs.org/) 18 or newer
- [Expo CLI](https://docs.expo.dev/get-started/installation/)
- iOS Simulator (Xcode) or physical iPhone with [Expo Go](https://expo.dev/go)

### Setup

```bash
# Clone the repository
git clone https://github.com/fmart-23/closetai.git
cd closetai

# Install dependencies
npm install

# Start the development server
npx expo start
```

## Running the App

### iOS Simulator

```bash
# Install Expo CLI globally if you haven't
npm install -g @expo/cli

# Start with iOS simulator
npx expo start --ios
```

Requires Xcode to be installed on macOS.

### Physical iPhone (Expo Go)

1. Install **Expo Go** from the [App Store](https://apps.apple.com/app/expo-go/id982107779)
2. Run `npx expo start`
3. Scan the QR code with your iPhone camera

> **Note:** Expo Go supports most features. Camera and photo library require a physical device or properly configured simulator.

### Development Build (Recommended for Full Features)

For full native module support (camera, TF Lite):

```bash
# Install EAS CLI
npm install -g eas-cli

# Build development client
eas build --profile development --platform ios
```

## Building for the App Store

### 1. Configure EAS

```bash
eas login
eas build:configure
```

### 2. Update `eas.json` with your Apple credentials

```json
{
  "submit": {
    "production": {
      "ios": {
        "appleId": "your-apple-id@example.com",
        "ascAppId": "your-app-store-connect-app-id",
        "appleTeamId": "your-apple-team-id"
      }
    }
  }
}
```

### 3. Build for production

```bash
eas build --profile production --platform ios
```

### 4. Submit to App Store

```bash
eas submit --platform ios
```

## Outfit Recommendation Algorithm

The outfit engine uses a **rule-based algorithm** with:

- **Color Theory**: Complementary, analogous, and neutral color pairing
- **Style Compatibility**: Matrix-based style matching (casual + casual, formal + business, etc.)
- **Season Filtering**: Only suggests season-appropriate items
- **Occasion Matching**: Filters items by occasion (casual, work, date night, etc.)
- **Completeness Check**: Ensures outfits have top + bottom (or dress), optional shoes and accessories
- **Scoring**: Each outfit gets a 0–100 compatibility score

## Adding TensorFlow Model (Optional)

See [models/README.md](models/README.md) for instructions on integrating a real clothing classification model.

## License

MIT
