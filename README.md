# GovAssist — Independent Citizen Benefits Discovery & Guidance Assistant (Pilot: Tamil Nadu + Central Schemes)

> **IMPORTANT DISCLAIMER**: GovAssist is an **independent helper** and is **NOT an official government platform**. All 5 schemes in this repository are **fictional/sample placeholders (`[SAMPLE PLACEHOLDER]`)** designed to demonstrate the deterministic 5-category eligibility engine, application route guidance, and Maker-Checker governance workflow. Verify every real scheme's rules, Government Orders (G.O.), and portal links from official sources before publishing.

---

## 1. How to Install, Run, Test & Download

### Local Installation & Development
```bash
# 1. Install dependencies
npm install

# 2. Copy environment variables template
cp .env.example .env
# Optional: Add your GEMINI_API_KEY in .env (server-side only).
# If GEMINI_API_KEY is omitted or left as placeholder, the backend automatically
# uses the deterministic fallback adapter so every screen works offline or without keys.

# 3. Start the full-stack Express + Vite server on port 3000
npm run dev
```

### Production Build & Verification
```bash
# Type-check TypeScript
npm run lint

# Build frontend production bundle & PWA Service Worker
npm run build

# Start production server
npm start
```

### How to Test All Core Flows
1. **Screen 1 — Language Selection**:
   - Click the speaker icon beside **தமிழ் (Tamil)**, **English**, **हिन्दी (Hindi)**, or any of the 22 Eighth Schedule languages to hear an audio prompt.
   - Select **தமிழ்**, **English**, or **हिन्दी** for full UI translation.
   - Select **اردو (Urdu)** to test **Right-to-Left (`dir="rtl"`)** layout and the visible `"Shown in English"` fallback banner.
2. **Screen 2 — Welcome & Guest Mode**:
   - Verify the non-government disclaimer and translated privacy notice (*"In Guest Mode we don't save your details after you leave..."*).
   - Click **"Listen"** to hear the welcome read aloud.
   - Click **"Continue as Guest"** (note that account creation is never shown before results).
3. **Screen 3 — Voice or Text Input**:
   - Switch between **Voice** and **Text** tabs at any time.
   - In **Voice**, tap the microphone button (or **"Test Low-Confidence Audio"** to test the low-confidence warning that asks the citizen to re-record or edit).
   - Confirm or edit the transcript before clicking **Confirm & Continue**.
   - Try typing a 12-digit number (e.g., `1234 5678 9012`) to verify the automatic **Aadhaar/PII blocker**.
4. **Screen 4 — Smart Profile, Sensitive Question Guards & Household > Persons**:
   - Step through missing questions one at a time.
   - On Question 7 (**Sensitive Community Category**), verify the one-line **"Why we ask"** explanation and test **"Skip this question"** or **"I'd rather not say"**.
   - Add or edit **Family Members (Household > Persons)** and verify that a parent's category is never copied to a child.
   - Review all details and held documents on the **Review Your Details** screen.
5. **Screen 5 & 6 — Deterministic Eligibility Results & Application Guidance**:
   - Inspect all **5 Result Categories** using the category tabs:
     1. **Appears eligible** (`TN-SAMPLE-01`: Widow & Single Mother Monthly Support)
     2. **Potentially eligible, more details needed** (`TN-SAMPLE-02`: Student Educational Grant when community category is skipped)
     3. **Missing documents or requirements** (`TN-SAMPLE-03`: Children Higher Education Deposit — check/uncheck the Tahsildar Income Certificate & Birth Certificates right on the card to watch it dynamically move between *Missing documents* and *Appears eligible*!)
     4. **Requires official verification** (`CENTRAL-SAMPLE-04`: Rural Housing Grant requiring Gram Sabha & BDO site inspection)
     5. **Not eligible based on known rules** (`TN-SAMPLE-05`: Urban Youth Micro-Enterprise Seed Subsidy for urban residents aged 18–30)
   - Click **"How to get this document"** and switch between **Online**, **Assisted (e-Sevai / CSC)**, and **Offline** application route tabs.
6. **Screen 7 — Post-Results Optional Account & Consent Audit Trail**:
   - Click **"Create Optional Account to Save Schemes"** at the bottom of the Results screen.
   - Choose which items to save on the plain-language consent screen, enter a 10-digit phone number, and enter mock OTP **`123456`**.
   - Verify that the temporary guest session is immediately wiped, view the timestamped Consent Record, download your data as JSON, or delete your account permanently.
7. **Screen 10 — Staff Admin Dashboard (Maker-Checker & Structured Rule Builder)**:
   - Click **Staff Admin** in the top navigation bar.
   - Log in with MFA placeholder code **`654321`**.
   - Test **Maker-Checker enforcement**: while active as `editor@govassist.org` (Maker), edit a scheme and submit it to review; try approving it as the same user to see the Maker-Checker rejection error, then switch the top role selector to `reviewer@govassist.org` (Checker) to approve and publish!

---

## 2. Architecture & Separated Replaceable Adapter Modules

| Module / Layer | File Path | Current Prototype Status | Production Integration Required (`TODO`) |
| :--- | :--- | :--- | :--- |
| **State & District Data** | `src/data/statesConfig.ts` | Active Pilot: Tamil Nadu + Central (`KA` & `MH` expansion stubs included) | Add verified district/block lists and assisted centre names for additional states. |
| **Sample Scheme Catalogue** | `src/data/sampleSchemes.ts` | **MOCK / SAMPLE PLACEHOLDERS ONLY** (5 fictional schemes demonstrating all 5 categories) | Replace with legally verified schemes, Government Order (G.O.) URLs, and departmental sign-off. |
| **Deterministic Rules Engine** | `src/engine/eligibilityEngine.ts` | **REAL** 3-valued (`yes` / `no` / `unknown`) deterministic evaluator | Ready for production; never delegates eligibility decisions to an LLM. |
| **LLM Smart Profile & Explanation Adapter** | `server/adapters/llmAdapter.ts` | Server-side `@google/genai` (`gemini-3.8-flash`) + automatic deterministic fallback | Configure production `GEMINI_API_KEY` in secret manager and complete prompt safety audit. |
| **Speech-to-Text (STT) Adapter** | `server/adapters/speechAndTranslationAdapter.ts` & `src/adapters/speechToTextAdapter.ts` | **MOCK** Bhashini STT adapter with confidence simulation (`0.94` vs `0.42` low-confidence test) | Connect to Digital India **BHASHINI ULCA ASR Pipeline** or Gemini `gemini-3.5-transcribe`. |
| **Text-to-Speech (TTS) Adapter** | `src/adapters/textToSpeechAdapter.ts` | Browser `window.speechSynthesis` (`ta-IN`, `hi-IN`, `en-IN`, `ur-IN`) + Web Audio chime | Connect to `/api/speech/synthesize` backed by **BHASHINI TTS** or `gemini-3.8-flash-lite-tts`. |
| **Database & Session Abstraction** | `server/adapters/databaseAdapter.ts` & `server/db/postgresSchema.sql` | **MOCK** in-memory domain stores + auto-expiring Guest Session Map | Connect `IDatabaseAdapter` to managed **PostgreSQL** (`server/db/postgresSchema.sql`) + **Redis** encrypted guest session store. |
| **Phone OTP & Staff MFA** | `server.ts` & `src/components/AdminDashboardScreen.tsx` | **MOCK** OTP (`123456`) and Staff MFA (`654321`) | Integrate compliant SMS gateway (DLT-registered template, no Aadhaar) and WebAuthn/TOTP MFA for staff. |
