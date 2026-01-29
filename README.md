# VoiceGuard

AI-powered voice authentication app to help prevent voice-cloning scams.

## Local Development (Web + API)

### Prerequisites

- Node.js 18+ (recommended: Node 20)

### Run everything

```bash
npm run install:all
npm run dev:all
```

This starts:

- Web app: http://127.0.0.1:5173
- API: http://localhost:8080 (health: http://localhost:8080/health)

### Config (optional)

The web app uses `VITE_API_URL` (defaults to `http://localhost:8080`).

```bash
cp .env.example .env
```

## Mobile App (Expo)

### Prerequisites

- Xcode (for iOS Simulator) and/or Android Studio (for Android emulator)

### Run

Start the API first (in one terminal):

```bash
npm run dev:api
```

Then start Expo (in another terminal):

```bash
npm --prefix apps/mobile install
npm --prefix apps/mobile run start
```

Notes:

- iOS Simulator can use `http://localhost:8080`
- Android Emulator must use `http://10.0.2.2:8080`
- Physical device must use your Mac's LAN IP (set `EXPO_PUBLIC_API_BASE_URL`)

## Overview

VoiceGuard is an AI-powered voice authentication app that protects families from AI voice-cloning scams by verifying caller identity in real time and, when needed, prompting suspicious callers with security questions only family members would know.

## Problem

Scammers are using AI voice cloning technology to impersonate family members and phish money from vulnerable individuals. These synthetic voices can sound nearly identical to real family members, even replicating emotional cues like crying.

## Solution

VoiceGuard aims to combine real-time voice analysis, biometric voice enrollment, and security-question verification to detect AI-cloned voices and prevent fraud before money is lost.
