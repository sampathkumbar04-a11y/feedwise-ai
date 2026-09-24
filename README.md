# 🌾 FeedWise AI

> **Intelligent Cattle Feed & Silage Quality Analyzer, Flieg Score Calculator, and Dairy Ration Optimization Platform**

[![React](https://img.shields.io/badge/React-18.3.1-61DAFB?logo=react&logoColor=black)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.7.2-3178C6?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Vite](https://img.shields.io/badge/Vite-6.1.0-646CFF?logo=vite&logoColor=white)](https://vitejs.dev/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-v4.0-38B2AC?logo=tailwindcss&logoColor=white)](https://tailwindcss.com/)
[![PWA Ready](https://img.shields.io/badge/PWA-Installable-5A0FC8?logo=pwa&logoColor=white)](https://web.dev/progressive-web-apps/)
[![License](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)

---

## 📖 Table of Contents

- [Overview](#-overview)
- [Key Features](#-key-features)
  - [1. Feed Scanner & Computer Vision Analysis](#1-feed-scanner--computer-vision-analysis)
  - [2. Silage & Flieg Score Calculator](#2-silage--flieg-score-calculator)
  - [3. Feed Safety & Adulteration Scanner](#3-feed-safety--adulteration-scanner)
  - [4. Precision Dairy Ration Optimizer (TMR)](#4-precision-dairy-ration-optimizer-tmr)
  - [5. Cattle Herd & Lactation Manager](#5-cattle-herd--lactation-manager)
  - [6. Weather & Heat Stress (THI) Advisor](#6-weather--heat-stress-thi-advisor)
  - [7. Cooperative & Bulk Milk Hub](#7-cooperative--bulk-milk-hub)
  - [8. Kisan AI Nutrition Assistant](#8-kisan-ai-nutrition-assistant)
- [Scientific Formulas & Mathematical Models](#-scientific-formulas--mathematical-models)
- [Tech Stack](#-tech-stack)
- [Getting Started & Running in VS Code](#-getting-started--running-in-vs-code)
  - [Prerequisites](#prerequisites)
  - [Step-by-Step Setup Guide](#step-by-step-setup-guide)
  - [VS Code Shortcuts & Recommended Extensions](#vs-code-shortcuts--recommended-extensions)
- [Available Scripts](#-available-scripts)
- [Project Architecture & File Tree](#-project-architecture--file-tree)
- [Offline Support & PWA](#-offline-support--pwa)
- [Troubleshooting & FAQs](#-troubleshooting--faqs)
- [Contributing & License](#-contributing--license)

---

## 🌟 Overview

**FeedWise AI** is a comprehensive, scientific, offline-first digital assistant designed for dairy farmers, livestock managers, fodder cooperatives, and animal nutritionists.

Proper animal nutrition accounts for over **65–70% of total milk production costs**. Substandard silage fermentation, undetected mold toxins (aflatoxins), or imbalanced Crude Protein (CP) and Total Digestible Nutrients (TDN) can cause:
- **15–30% drop in daily milk yield**
- **Subclinical ruminal acidosis (SARA)**
- **Elevated somatic cell counts and reproductive failure**
- **Feed spoilage losses in silo pits and bunkers**

FeedWise AI bridges the gap between laboratory-grade livestock science and field-level usability by combining **in-browser computer vision**, the **classical Flieg silage evaluation index**, **NRC / ICAR dairy rationing standards**, and **real-time Temperature-Humidity Index (THI)** alerts.

---

## 🚀 Key Features

### 1. Feed Scanner & Computer Vision Analysis
- **Direct Optical Assessment**: Capture feeds via device camera or upload high-res images of corn silage, sorghum silage, Napier grass, Rhodes grass, alfalfa hay, wheat straw (bhusa), and cattle concentrates.
- **Visual Metric Extraction**:
  - **Color Palette & Hue Analysis (HSV)**: Detects golden-olive (optimal fermentation), dark caramelized brown (heat damage/Maillard reaction), or pale yellow (bleached/rain-damaged).
  - **Chop Length & Particle Uniformity**: Evaluates effective fiber length (12–19 mm Penn State Particle Separator standard) to ensure proper rumination.
  - **Fungal / Mold Hyphae Detection**: Scans for white, blue-green, or pink mold patches indicating mycotoxin hazards.
  - **Moisture & Texture Indicators**: Identifies waterlogged sludge or excessively dry, uncompacted fibers.

### 2. Silage & Flieg Score Calculator
- Computes the recognized **Flieg Score** (0–100) based on **Dry Matter percentage (DM%)** and **fermentation pH**.
- Automatically predicts organic acid ratios:
  - **Lactic Acid %** (desirable: >65–70% of total acids)
  - **Acetic Acid %** (aerobic stability buffer: 20–30%)
  - **Butyric Acid %** (clostridial spoilage indicator: <0.5%)
  - **Ammonia-Nitrogen ($NH_3\text{-}N$) % of Total Nitrogen**
- Calculates estimated **aerobic stability hours** upon silo pit opening.

### 3. Feed Safety & Adulteration Scanner
- **Dual-Layer Evaluation**: Algorithmic biochemical checks + visual indicator corroboration.
- **Adulteration & Toxin Risk Auditing**:
  - **Non-Protein Nitrogen (Urea) Spiking**: Detects synthetic CP inflation.
  - **Silica / Sand Infiltration**: Detects contaminated soil intake causing abomasal impaction.
  - **Mycotoxin & Aflatoxin $B_1$ Vulnerability**: High-risk flag for pregnant and high-yielding milch cattle.
- Provides immediate farmer mitigation protocols (e.g., toxin binders, aeration, dilution rations).

### 4. Precision Dairy Ration Optimizer (TMR)
- Formulates customized **Total Mixed Rations (TMR)** based on animal type (Indigenous Cows: Gir, Sahiwal; Crossbred HF/Jersey; Murrah Buffaloes).
- Balances key nutritional parameters:
  - **Dry Matter Intake (DMI)** (kg/day)
  - **Crude Protein (CP % & kg)**
  - **Total Digestible Nutrients (TDN % & kg)**
  - **Neutral Detergent Fiber (NDF) & Acid Detergent Fiber (ADF)**
  - **Calcium (Ca) & Phosphorus (P) ratio** (targeted at 2:1)
- Calculates **feed cost per liter of milk produced** and projects potential daily yield gains.

### 5. Cattle Herd & Lactation Manager
- Organize cattle profiles by lactation cycle: **Early Lactation**, **Mid Lactation**, **Late Lactation**, **Dry Period**, and **Transition/Heifer**.
- Tracks body weight, body condition score (BCS), daily milk yields, and insemination dates.
- Direct 1-click assignment of optimized rations to individual animals or herd groups.

### 6. Weather & Heat Stress (THI) Advisor
- Calculates the livestock **Temperature-Humidity Index (THI)** in real time.
- Categorizes thermal comfort levels:
  - **Normal** ($THI < 72$)
  - **Mild Stress** ($THI\ 72 - 78$)
  - **Moderate Stress** ($THI\ 79 - 88$)
  - **Severe / Emergency Stress** ($THI > 88$)
- Silage pit weather forecasts: Advises when to cover trenches, protect against monsoon humidity, or aerate feeds.

### 7. Cooperative & Bulk Milk Hub
- Designed for village dairy cooperative societies (DCS) and milk unions.
- Tracks bulk procurement batches, farm-level silage audit histories, and quality-linked price adjustments.
- Broadcasts seasonal advisories to registered farmers.

### 8. Kisan AI Nutrition Assistant
- Multilingual conversational advisor answering feed formulation questions, symptoms of ketosis, bloat prevention, and fodder cultivation best practices.
- Multi-language voice synthesis and speech input.
- Localized in **English**, **Hindi (हिन्दी)**, and **Kannada (ಕನ್ನಡ)**.

---

## 📐 Scientific Formulas & Mathematical Models

### 1. Classical Flieg Silage Quality Formula
The Flieg Score evaluates anaerobic lactic acid fermentation efficiency:

$$\text{Flieg Score} = 220 + (2 \times \text{DM\%} - 15) - (40 \times \text{pH})$$

| Score Range | Flieg Grade | Fermentation Character | Feeding Recommendation |
|:---:|:---:|:---|:---|
| **81 – 100** | **Very Good** | Dominant lactic acid, pleasant fruity aroma | Unrestricted prime dairy feed |
| **61 – 80** | **Good** | Moderate lactic acid, stable preservation | Excellent daily forage base |
| **41 – 60** | **Fair** | Higher acetic acid, mild nutrient loss | Feed with buffering minerals |
| **21 – 40** | **Poor** | Secondary clostridial fermentation | Restrict intake; discard dark layers |
| **0 – 20** | **Very Poor** | Butyric acid dominant, putrid proteolysis | **Hazardous**: Discard immediately |

---

### 2. Cattle Temperature-Humidity Index (THI)
Predicts heat stress and potential milk fat/yield depression:

$$THI = 0.8 \times T_{\text{dry-bulb}} + \left(\frac{RH\%}{100} \times (T_{\text{dry-bulb}} - 14.4)\right) + 46.4$$

*Where $T_{\text{dry-bulb}}$ is ambient temperature in °C and $RH$ is Relative Humidity %.*

---

### 3. Dry Matter Intake (DMI) Estimation
Based on NRC Dairy Cattle standards:

$$\text{DMI (kg/day)} = \left(0.0185 \times \text{Body Weight}_{\text{kg}}\right) + \left(0.305 \times \text{4\% Fat-Corrected Milk}_{\text{kg}}\right)$$

Where $4\%\text{ FCM} = 0.4 \times \text{Milk} + 15 \times \text{Fat}$.

---

## 🛠 Tech Stack

| Layer | Technologies |
|:---|:---|
| **Frontend Framework** | [React 18.3](https://react.dev/) with Functional Components & Hooks |
| **Language & Typings** | [TypeScript 5.7](https://www.typescriptlang.org/) (Strict mode enabled) |
| **Bundler & Tooling** | [Vite 6.1](https://vitejs.dev/) with HMR and Fast Build Pipeline |
| **Styling & Design System** | [Tailwind CSS v4.0](https://tailwindcss.com/) with custom agriculture palettes |
| **Icons & UI Elements** | [Lucide React](https://lucide.dev/) (200+ specialized SVG icons) |
| **Smooth Scrolling** | [Lenis 1.3](https://lenis.darkroom.engineering/) with modal scroll locks |
| **Offline & PWA** | `vite-plugin-pwa` with Service Worker precaching & Web App Manifest |
| **Storage & State** | React Context API + LocalStorage state persistence |

---

## 💻 Getting Started & Running in VS Code

Follow this guide to get FeedWise AI running locally on your computer inside **Visual Studio Code**.

### Prerequisites
Make sure you have installed on your computer:
1. **Node.js** (v18.0.0 or higher recommended) — [Download Node.js](https://nodejs.org/)
2. **npm** (comes with Node.js) or **bun** / **pnpm**
3. **Visual Studio Code** — [Download VS Code](https://code.visualstudio.com/)
4. **Git** (optional, for version control) — [Download Git](https://git-scm.com/)

---

### Step-by-Step Setup Guide

#### Step 1: Open the Project in VS Code
1. Launch **Visual Studio Code**.
2. Click **File** > **Open Folder...** (or press `Ctrl+K Ctrl+O` on Windows/Linux, `Cmd+O` on macOS).
3. Select the `feedwise-ai` project directory.

#### Step 2: Open the Integrated Terminal
You can run all terminal commands without leaving VS Code:
- Use the keyboard shortcut: **`Ctrl + \``** (Backtick) on Windows/Linux or **`Cmd + \``** on macOS.
- Or click the top menu: **Terminal** > **New Terminal**.

#### Step 3: Install Dependencies
In the VS Code terminal, run:

```bash
npm install
```
*(If you are using Bun: `bun install` | If you are using pnpm: `pnpm install`)*

#### Step 4: Start the Local Development Server
Run the dev script:

```bash
npm run dev
```

You will see output similar to:
```text
  VITE v6.1.0  ready in 250 ms

  ➜  Local:   http://localhost:3000/
  ➜  Network: http://192.168.1.X:3000/
  ➜  press h + enter to show help
```

#### Step 5: Open in Your Browser
- Hold `Ctrl` (or `Cmd` on Mac) and click the link in the terminal: `http://localhost:3000/`.
- Or open your browser (Chrome, Edge, Firefox, Safari) and navigate to `http://localhost:3000`.

#### Step 6: Stop the Server
To stop the running dev server at any time, press **`Ctrl + C`** in the terminal and confirm with `y`.

---

### VS Code Shortcuts & Recommended Extensions

#### Recommended Extensions
For the best developer experience, install these from the VS Code Extensions tab (`Ctrl+Shift+X` / `Cmd+Shift+X`):
- **Tailwind CSS IntelliSense** (`bradlc.vscode-tailwindcss`) — Autocomplete and hover previews for Tailwind classes.
- **ESLint** (`dbaeumer.vscode-eslint`) — Automatic linting and code quality highlights.
- **Prettier - Code formatter** (`esbenp.prettier-vscode`) — Instant code formatting on save.

#### Handy VS Code Shortcuts
| Action | Windows / Linux | macOS |
|:---|:---|:---|
| **Toggle Terminal** | `Ctrl + \`` | `Cmd + \`` |
| **Quick File Search** | `Ctrl + P` | `Cmd + P` |
| **Command Palette** | `Ctrl + Shift + P` | `Cmd + Shift + P` |
| **Format Document** | `Shift + Alt + F` | `Shift + Option + F` |
| **Split Editor** | `Ctrl + \` | `Cmd + \` |
| **Toggle Sidebar** | `Ctrl + B` | `Cmd + B` |

---

## 📜 Available Scripts

Inside the project root, you can run the following npm commands:

```bash
# Start local development server on port 3000 with hot-reload
npm run dev

# Run TypeScript compiler check (no emit) to verify zero type errors
npm run lint

# Compile and bundle the application for production (outputs to /dist)
npm run build

# Serve and preview the production build locally
npm run preview
```

---

## 📂 Project Architecture & File Tree

```text
feedwise-ai/
├── public/                       # Static public assets (icons, manifest)
├── src/
│   ├── assets/                   # Brand assets and imagery
│   ├── components/
│   │   ├── analyzer/             # Camera modal, color spectrum & chop graphs
│   │   ├── chatbot/              # Multilingual Kisan AI chat modal & voice audio
│   │   ├── common/               # ErrorBoundary, offline banner, modals
│   │   ├── cooperative/          # Bulk milk batch & audit tables
│   │   ├── layout/               # Navbar, Sidebar, Footer, AgriBackground
│   │   ├── planner/              # TMR sliders, nutrient meters, cost counters
│   │   └── reports/              # Printable PDF report cards & export view
│   ├── context/
│   │   ├── AgriThemeContext.tsx  # Dynamic agricultural themes (Harvest, Emerald, Ochre)
│   │   ├── AppDataContext.tsx    # Global records (scans, cattle, feed library)
│   │   ├── AuthContext.tsx       # User role management (Farmer, Nutritionist, Coop)
│   │   ├── LanguageContext.tsx   # Multi-language provider (English, Hindi, Kannada)
│   │   └── ThemeContext.tsx      # Dark / Light mode toggle
│   ├── data/
│   │   ├── feedLibrary.ts        # Nutritional database (Dry matter, CP, TDN, NDF, ADF)
│   │   └── translations.ts       # Multilingual dictionaries
│   ├── hooks/
│   │   └── useOnlineStatus.ts    # Real-time network detection & simulation hook
│   ├── pages/
│   │   ├── CattleManager.tsx     # Herd tracking & lactation status
│   │   ├── CooperativePortal.tsx # Bulk cooperative silage grading
│   │   ├── Dashboard.tsx         # Real-time stats, THI widget & quick actions
│   │   ├── FeedAnalyzer.tsx      # Computer vision scanner & Flieg results
│   │   ├── FeedSafetyScanner.tsx # Adulteration & mycotoxin risk detector
│   │   ├── RationPlanner.tsx     # Total Mixed Ration (TMR) optimizer
│   │   ├── ReportsHistory.tsx    # Historical scan log & comparison tools
│   │   └── WeatherAdvisor.tsx    # Temperature-Humidity Index & silo pit weather
│   ├── services/
│   │   ├── computerVisionEngine.ts # Image processing, color histogram, chop texture
│   │   └── fliegCalculator.ts      # Flieg scoring and fermentation acids engine
│   ├── types/
│   │   └── index.ts              # Strict TypeScript interfaces & definitions
│   ├── utils/
│   │   └── formatters.ts         # Numeric, currency, and date formatters
│   ├── App.tsx                   # Main layout container & view router
│   ├── index.css                 # Tailwind CSS v4 root stylesheet
│   └── main.tsx                  # React DOM root entry point
├── index.html                    # HTML5 shell with PWA meta tags
├── metadata.json                 # AI Studio applet specifications
├── package.json                  # Dependencies & scripts
├── tsconfig.json                 # TypeScript compiler configuration
└── vite.config.ts                # Vite configuration with Tailwind & PWA plugins
```

---

## 📡 Offline Support & PWA

FeedWise AI is built from the ground up for rural connectivity:
1. **Offline Mode**: Uses a custom Service Worker to cache UI assets, styles, and calculation algorithms.
2. **Client-Side Processing**: Silage Flieg scoring, ration formulation, and computer vision image analysis run locally in the browser—no continuous internet connection required.
3. **Install as App (PWA)**:
   - On **Google Chrome / Microsoft Edge** (Desktop): Click the install icon in the address bar to add to your desktop.
   - On **Android (Chrome)**: Tap the three dots menu > **"Add to Home Screen"**.
   - On **iOS (Safari)**: Tap the Share button > **"Add to Home Screen"**.

---

## ❓ Troubleshooting & FAQs

### Q: Port 3000 is already in use. What should I do?
If port 3000 is occupied by another process, you can either:
- Terminate the conflicting process, or
- Change the port temporarily in `package.json` under `"scripts": { "dev": "vite --port 3001" }`.

### Q: Camera access does not work in the Feed Scanner.
Ensure that your browser has granted camera permission to `localhost` or the hosted URL:
- In Chrome: Click the padlock/settings icon on the left of the URL bar > **Site settings** > Set **Camera** to **Allow**.
- If no physical camera is present, you can upload feed photo files directly using the file picker.

### Q: How do I test the application without internet?
You can use the **Offline Simulator** toggle located in the application header/status bar, or open Developer Tools (`F12`), go to the **Network** tab, and select **Offline**.

---

## 📄 License & Acknowledgments

- **License**: Released under the [MIT License](LICENSE).
- **Nutritional Standards**: Formulated according to guidelines published by the **Indian Council of Agricultural Research (ICAR)** and the **National Research Council (NRC)** for dairy cattle nutrition.
- **Fermentation Index**: Grounded in the classical **Flieg (1938)** silage quality scoring system.

---

<p align="center">
  <b>FeedWise AI</b> — Empowering Farmers with Science-Backed Livestock Nutrition 🌱🥛
</p>
