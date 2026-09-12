# 🖥️ MEMBER 1 — FRONTEND DEVELOPER TASK SHEET
### React.js | Tailwind CSS | i18n | Framer Motion
### Working with: **Antigrievity** (Pair/AI-Assisted Development)

---

> **YOUR ROLE:** You own everything the user sees and touches.
> Backend & ML are running in parallel — this doc tells you exactly **what to build**, **when to pause**, and **what NOT to touch**.

---

## ⚡ QUICK REFERENCE — STOP POINTS

| 🔴 STOP & WAIT FOR | ⏰ When | Who Delivers |
|---|---|---|
| MongoDB connection string + demo data CSV | 7:00 AM (Sync Point 1) | Member 2 (Backend) |
| All Django API endpoints live on localhost:8000 | 1:00 PM (Sync Point 2) | Member 2 (Backend) |
| Model files + SHAP explanation format JSON | 1:00 PM (Sync Point 2) | Member 3 + 4 (ML) |
| Chatbot response JSON format/schema | 11:00 AM | Member 4 (NLP/AI) |
| Ethical guardrails SHAP explanation structure | 1:00 PM | Member 4 (Ethics AI) |
| Deployed backend URL (Render) | ~9:00 PM Sept 12 | Member 2 (Backend) |

> 💡 **While waiting** — build with **stub/mock data** first. Swap real API calls in at Sync Point 2.

---

## 📦 TECH STACK (YOUR TOOLS)

```
Framework:        React.js (Vite)
Styling:          Tailwind CSS (custom config)
Routing:          react-router-dom
State:            Zustand
HTTP:             Axios
Charts:           Recharts
Animations:       Framer Motion
Icons:            @heroicons/react
i18n:             i18next + react-i18next
Camera:           react-webcam (Video KYC)
Deployment:       Vercel
```

---

---

# 🟢 PHASE 2A — Foundation
## ⏰ 2:00 AM → 7:00 AM (5 hours) | ALL PARALLEL

> **Your job this phase:** Scaffold the project and build all pages with static/stub data.
> Backend and ML are scaffolding in parallel — no API calls needed yet.

---

### 🔧 2:00 AM – 3:00 AM | Project Scaffolding

**WORK WITH ANTIGRIEVITY ON:**

```bash
npm create vite@latest banking_ai -- --template react
cd banking_ai
```

**Install ALL dependencies in one go:**

```bash
npm install tailwindcss postcss autoprefixer react-router-dom zustand axios recharts i18next react-i18next react-chatbot-kit framer-motion @heroicons/react react-webcam
npx tailwindcss init -p
```

**Tailwind Config — customize with:**
- Primary Blue: `#1a237e`
- Saffron Orange: `#ff6f00`
- Mobile-first breakpoints
- Font stack: `Noto Sans Devanagari` + `Inter`

**Create this folder structure:**

```
src/
├── components/
│   ├── Dashboard/
│   ├── Chatbot/
│   ├── Loan/
│   ├── Stress/
│   ├── Onboarding/
│   └── Common/
├── pages/
├── store/           ← Zustand stores go here
├── i18n/            ← translation files
├── services/        ← axios instances
└── App.jsx, main.jsx
```

**✅ Done when:** `npm run dev` runs without errors, folder structure created.

---

### 🗂️ 3:00 AM – 5:00 AM | Core Pages (Static / Stub Data)

**Build these 3 pages with hardcoded mock data (no API yet):**

---

#### Page 1: Login / Onboarding

| Element | Details |
|---|---|
| Language selector | Globe icon → dropdown with 12 language flags — render FIRST |
| Phone + OTP | Mock inputs, no real auth yet |
| Consent screen | Granular toggles — ALL **unchecked** by default (important!) |
| Segment picker | 7 cards: 🎓 Student, 💼 Salaried, 👨‍👩‍👧 Family, 🌾 Farmer, 🏪 Shop, 🛵 Gig, 🏠 HomeBuyer |

---

#### Page 2: Personalized Dashboard

| Widget | Details |
|---|---|
| Layout | Sidebar (desktop) + BottomNav (mobile) |
| Header | Language switcher + Notification bell |
| Quick Balance Card | Hardcoded ₹ value for now |
| Spending Insights | Pie chart placeholder (use Recharts) |
| Upcoming EMIs | Hardcoded list |
| Recommendation Cards | 3 placeholder slots |
| Quick Actions | Segment-specific buttons (use Farmer as default stub) |

---

#### Page 3: Profile Page

| Element | Details |
|---|---|
| Customer info | Hardcoded name, DOB, Aadhaar (masked) |
| Segment badge | e.g. "🌾 Farmer" |
| Stress level indicator | Traffic light: Green / Yellow / Orange / Red |

---

### 🌐 5:00 AM – 7:00 AM | i18n Setup + Hindi Translations

**WORK WITH ANTIGRIEVITY TO:**

1. Initialize `i18next` in `main.jsx`
2. Create translation files:

```
src/i18n/
├── en.json    ← all labels in English
└── hi.json    ← all labels in Hindi (PRIMARY)
```

3. Wrap **every** text string with `useTranslation()` hook
4. Build `LanguageSwitcher` component (dropdown + flags)
5. **Test:** Switch EN ↔ HI — all text must update immediately

**✅ Done when:** Language toggle works on all 3 pages.

---

## 🔴 STOP AT 7:00 AM → SYNC POINT 1

```
Wait for Member 2 to share:
  ✅ MongoDB connection string
  ✅ Synthetic customer CSV (5 demo accounts)
  ✅ API base URL: http://localhost:8000/api/

Quick standup: Any blockers?
After sync → move to Phase 2B
```

---

---

# 🟡 PHASE 2B — AI Integration
## ⏰ 7:00 AM → 1:00 PM (6 hours) | ALL PARALLEL

> **Your job this phase:** Build the interactive UI components — chatbot, recommendation cards, and the loan wizard.
> APIs are being built by Member 2 in parallel — keep using mock/stub data until 1:00 PM sync.

---

### 💬 7:00 AM – 9:00 AM | Chatbot UI Component

**Build `Chatbot/ChatWindow.jsx` — a floating chat bubble:**

| Part | Details |
|---|---|
| Floating bubble | Bottom-right corner, animated entrance (Framer Motion) |
| Unread badge | Count on bubble when collapsed |
| Chat header | "BankBuddy 🤖" + language dropdown |
| User messages | Right-aligned, blue background |
| Bot messages | Left-aligned, white background |
| Bot can render | Plain text, product cards, EMI slider, action buttons, deep links |
| Typing indicator | 3-dot animation while waiting for response |
| Quick reply chips | Horizontal scroll: "Check Balance", "Apply Loan", "EMI Status" |
| Input area | Text input (auto-resize) + Mic button + Send button |

**Voice Input Implementation:**

```javascript
const recognition = new window.webkitSpeechRecognition();
recognition.lang = 'hi-IN';  // Hindi
recognition.onresult = (e) => {
  const transcript = e.results[0][0].transcript;
  // send as text message
};
// If not supported → hide mic button
```

**✅ Done when:** Chat window opens/closes, messages render, typing indicator works with mock responses.

---

### 📊 9:00 AM – 11:00 AM | Recommendation Cards + Dynamic Dashboard

**Build `Dashboard/RecommendationCard.jsx`:**

| Element | Details |
|---|---|
| Product icon + name | e.g. 💳 Credit Card |
| Personalized reason | "Based on your savings pattern" (1 line) |
| Key detail | "Earn 7.1%" or "EMI from ₹4,321" |
| "Why this?" button | Expands SHAP explanation (feature bars + simple language) |
| CTA buttons | [Know More] [Apply Now] |
| Dismiss | "Not Interested" → logs rejection |
| Animation | Slide-in from right (Framer Motion) |

**Dynamic Widget Ordering by Segment (Zustand store):**

```javascript
const widgetOrder = {
  prudent_savers:    ['savings', 'investments', 'recommendations'],
  aspiring_spenders: ['recommendations', 'spending', 'savings'],
  family_builders:   ['insurance', 'emi', 'recommendations'],
  seasonal_earners:  ['loan_status', 'weather', 'recommendations'],
  stressed:          ['stress_alert', 'restructure', 'spending'],
};
```

**⚠️ WAIT — Backend Dependency:**

> Connect dashboard to real APIs ONLY after 1:00 PM Sync Point 2.
> For now, use this mock customer stub:

```javascript
const mockCustomer = {
  name: "Ramesh Kumar",
  segment: "seasonal_earners",
  balance: 42500,
  language: "hi",
  stressLevel: "GREEN"
};
```

---

### 📝 11:00 AM – 1:00 PM | Loan Application Flow (Conversational Wizard)

**Build `Loan/LoanWizard.jsx` — a 7-step conversational form (NOT one long form):**

| Step | Component | Details |
|---|---|---|
| Step 1 | Product Selection | Card grid: Personal / Home / Car / Education / Kisan |
| Step 2 | Amount Selector | Visual slider ₹10K → ₹5L + real-time EMI preview below |
| Step 3 | Tenure + EMI | Radio cards: 12/24/36/48/60 months, each shows monthly EMI |
| Step 4 | Personal Details | Pre-filled name, DOB, PAN, Aadhaar (masked + editable) |
| Step 5 | Income Proof | File upload OR "Verify via Net Banking" (mock) |
| Step 6 | KYC | Option A: Aadhaar OTP | Option B: Video KYC (webcam) | Option C: Upload |
| Step 7 | Confirmation | Summary → EMI mandate setup → 🎉 "Loan Approved!" |

**Requirements:**
- Progress bar at top (7 steps)
- Back button on every step
- Auto-save progress to Zustand store (can resume)
- All text via `useTranslation()` — Hindi + English ready

**✅ Done when:** Full 7-step wizard is navigable with mock data.

---

## 🔴 STOP AT 1:00 PM → SYNC POINT 2

```
Wait for Member 2 to confirm:
  ✅ All Django APIs are running on localhost:8000
  ✅ API response schemas shared
  ✅ 5 demo accounts created in DB

Wait for Member 4 to share:
  ✅ Chatbot response JSON format
  ✅ SHAP explanation structure (for "Why this?" UI)

After sync → move to Phase 2C (full integration)
```

---

---

# 🟠 PHASE 2C — Integration + Testing
## ⏰ 1:00 PM → 5:00 PM (4 hours) | ALL PARALLEL

> **Your job this phase:** Replace all mock data with real API calls. Wire everything end-to-end.

---

### 🔌 1:00 PM – 2:30 PM | Frontend ↔ Backend Integration

**Create `services/api.js`:**

```javascript
import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:8000/api/',
});

// Attach JWT token to every request
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('access_token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Auto-redirect on 401
api.interceptors.response.use(null, (error) => {
  if (error.response?.status === 401) {
    window.location.href = '/login';
  }
  return Promise.reject(error);
});

export default api;
```

**Connect ALL pages to real APIs:**

| Page | API Call |
|---|---|
| Dashboard — profile | `GET /api/customers/{id}/` |
| Dashboard — charts | `GET /api/transactions/insights/` |
| Dashboard — cards | `GET /api/recommendations/{id}/` |
| Dashboard — stress | `GET /api/stress/score/{id}/` |
| Chatbot | `POST /api/chat/message/` |
| Loan — EMI calc | `POST /api/loan/emi-calculate/` |
| Loan — submit | `POST /api/loan/apply/` |
| Profile — consent | `GET /api/consent/{id}/` |
| Profile — update consent | `POST /api/consent/{id}/grant/` |

**Always add:** loading states, error boundaries, retry logic.

---

### 🚨 2:30 PM – 3:30 PM | Stress Alert Banner Component

**Build `Stress/StressAlertBanner.jsx`:**

```
YELLOW  → Soft dismissible banner
  "💡 Savings dipped this month. Auto-save ₹500?"
  [Set Up] [Dismiss]

ORANGE  → Prominent card with action buttons
  "⚠️ 2 EMI bounces detected. Let's fix this:"
  [🔄 Shift EMI Date] [💳 Restructure] [📞 Talk RM]

RED     → Full modal overlay (cannot dismiss without action)
  "Your financial health needs attention. We care."
  [📞 Counselor] [📋 Restructure] [⏸ Pause AutoPay]
```

**Build `Stress/StressScoreGauge.jsx`:**
- Animated circular gauge (0–100)
- Color: GREEN → YELLOW → ORANGE → RED
- Animated fill on load (Framer Motion)
- Label in vernacular (via i18n)
- Connect to: `GET /api/stress/score/{id}/`

---

### ✅ 3:30 PM – 5:00 PM | Polish + Phase-2 Demo Prep

**Test ALL 5 demo accounts:**

| Account | Language | Expected Behavior |
|---|---|---|
| Ramesh (Farmer) | Hindi | Crop + Kisan Credit recommendations |
| Priya (Salaried) | Tamil | SIP + Health Insurance recommendations |
| Suresh (Shop Owner) | Hindi | OD / Business loan recommendations |
| Arjun (Gig Worker) | English | Micro-insurance recommendations |
| Meena (Stressed) | Marathi | ⚠️ Restructure offer — **NO new loans** |

**Checklist:**
- [ ] Mobile responsive on all pages
- [ ] Chatbot works in Hindi + English
- [ ] Language switcher updates all text instantly
- [ ] Stress alert shows for Meena
- [ ] SHAP "Why this?" section expands correctly
- [ ] No console errors in browser

---

## 🔴 STOP AT 5:00 PM → PHASE-2 SUBMISSION

```
Push all code to GitHub.
Working prototype must be running (localhost or deployed).
Share 5 demo account credentials with team.
```

---

---

# 🔵 PHASE 3A — Creative Features + Enhancement
## ⏰ 5:00 PM → 10:30 PM Sept 12 (5.5 hours)

> **Your job this phase:** Build the "wow" features and creative UI additions.
> Backend team is deploying + adding new APIs in parallel.

---

### ✨ 5:00 PM – 7:00 PM | New Feature UIs

**Build `Dashboard/LifeEventCard.jsx`:**

```
💍 "We think a celebration is coming!"
   [Wedding Loan] [Joint Account] [Family Insurance]

👶 "New family member detected!"
   [Sukanya Samriddhi] [Child Insurance] [Edu Fund]

📦 "Business expanding?"
   [Increase OD] [CA Account] [POS Device]

"Not accurate? ✕" → feedback collection modal
```

**Build `Wellness/WellnessDashboard.jsx`:**

| UI Element | Details |
|---|---|
| Large animated score circle | 0–100, animated count-up on load |
| Radar chart (Recharts) | 5 axes: Emergency Fund, Insurance, Debt, Savings, Goal Progress |
| Current vs ideal overlay | Two polygons on the radar |
| Score drop explanation | "Your score dropped 8 points. Here's why..." |
| Action items list | ✅ Set up emergency fund (+15 pts) etc. |
| Historical trend line | 6-month sparkline |
| Gamification badges | 🏆 Debt Free, ⭐ Super Saver, 📈 Fully Insured |

**Connect to:**
- `GET /api/life-events/{id}/`
- `GET /api/wellness/score/{id}/`
- `GET /api/wellness/breakdown/{id}/`

---

### 📚 7:00 PM – 8:30 PM | Financial Literacy UI + WhatsApp Sim

**Build `Literacy/LiteracyPage.jsx`:**

| Element | Details |
|---|---|
| Lesson cards | Image + title + duration ("60 sec") |
| Lesson viewer | Animated step-by-step content |
| Interactive quiz | 2–3 MCQs per lesson |
| Points display | Earned points shown after quiz |
| Context trigger | Just took loan → "How to manage EMIs" auto-surfaces |
| Progress levels | Beginner → Intermediate → Advanced |

**5 lesson topics:**
1. "What is SIP?" (Hindi + English)
2. "Why Health Insurance?"
3. "How EMI Works"
4. "What is CIBIL Score?"
5. "50-30-20 Budget Rule"

**Build `Chatbot/WhatsAppSimulator.jsx`:**
- WhatsApp-green header with "BankBuddy" contact
- Same chat messages, WhatsApp-style bubble UI
- WA-style numbered quick replies
- Shows "same AI, multiple channels" story in demo

---

### 🔐 8:30 PM – 10:30 PM | Consent Management + Explainability UI

**Build `Consent/ConsentDashboard.jsx`:**

| Toggle | Default State |
|---|---|
| 🟢 Transaction data for recommendations | OFF |
| 🟢 Financial health monitoring | OFF |
| 🟢 AI chat assistance | OFF |
| 🟢 Life event predictions | OFF |
| 🔴 Marketing communications | OFF |

Additional elements:
- "What data we use and why" — expandable sections
- Data download button (DPDP Act portability)
- Data deletion request (Right to be forgotten)
- Consent history log (timestamped)
- Version tracking display

**Upgrade `Dashboard/RecommendationCard.jsx` — add SHAP section:**

```
"Why this?" button → expands to show:

  Horizontal bars:
  ✅ "You save ₹15K/month"    ████████ +0.15
  ✅ "No existing FD"          ██████   +0.12
  ✅ "Age 30–40, ideal"        ████     +0.08
  ❌ "Moderate risk appetite"  ██       -0.05

  "Match score: 87%"
  "Not helpful?" [👎 Feedback]
```

Add at bottom of card: `"This recommendation is fair across all groups ✓"`

---

---

# 🟣 PHASE 3B — Final Polish + Submit
## ⏰ 10:30 PM Sept 12 → 10:00 AM Sept 13 (11.5 hours)

---

### 🎨 10:30 PM – 1:00 AM | Visual Polish + Animations

**Color Palette (finalize in Tailwind config):**

| Token | Hex | Purpose |
|---|---|---|
| `primary` | `#1a237e` | Deep Blue — Trust |
| `secondary` | `#ff6f00` | Saffron — Bharat |
| `success` | `#2e7d32` | Green |
| `warning` | `#ff8f00` | Amber |
| `danger` | `#c62828` | Red |
| `bg` | `#f5f5f5` | Background |

**Framer Motion animations to add:**

| Element | Animation |
|---|---|
| Dashboard widgets | Staggered fade-in (0.1s delay each) |
| Recommendation cards | Slide-in from right |
| Stress ORANGE/RED | Pulse animation |
| Chat messages | Smooth slide-up + fade |
| Wellness score | Animated count-up + circle fill |
| Page transitions | Slide left/right |
| Buttons | Scale on hover, ripple on click |

**Mobile responsiveness pass — test on:**
- 320px, 375px, 414px (phones)
- 768px (tablet)
- 1024px (desktop)

**Rules:**
- Bottom nav on mobile, sidebar on desktop
- Touch targets min 48px
- No horizontal scroll anywhere
- Body text min 16px, labels min 14px

**Accessibility:**
- ARIA labels on all interactive elements
- Keyboard nav: Tab, Enter, Escape work
- High contrast mode toggle
- Focus indicators visible

---

### 📱 1:00 AM – 3:00 AM | PWA + Offline + Deploy to Vercel

**PWA Setup:**

```
public/
└── manifest.json
    ├── name: "BankBuddy"
    ├── icons: [72, 96, 128, 144, 192, 512px]
    └── theme_color: "#1a237e"
```

**Service Worker (Workbox):**
- Cache static assets (JS, CSS, images)
- Cache API responses (`stale-while-revalidate`)
- Offline fallback page

**Low-bandwidth mode:**
- Toggle in settings: "Low data mode"
- Effect: no images, text-only recommendations, compressed calls
- Auto-suggest if load time > 3 seconds

**Deploy to Vercel:**

```bash
npm run build
vercel deploy
# Set env variable:
# VITE_API_URL = <Render backend URL from Member 2>
```

Test all flows on the deployed Vercel URL.
Cross-browser test: Chrome, Firefox, Safari.

---

### 🖼️ 3:00 AM – 7:00 AM | Wireframes + Screenshots

**Create 8 wireframes (Figma or Excalidraw):**

| # | Wireframe |
|---|---|
| W1 | Onboarding: language → consent → segment |
| W2 | Dashboard — Farmer (Hindi) with crop recs |
| W3 | Dashboard — Stressed (Marathi) with alert |
| W4 | Chatbot conversation (Hindi loan flow) |
| W5 | Loan application (conversational steps) |
| W6 | Financial wellness score |
| W7 | Consent management |
| W8 | WhatsApp channel simulation |

**Take screenshots of ACTUAL working prototype:**
- All 5 demo accounts' dashboards
- Chatbot in Hindi and English
- Stress alert for Meena
- SHAP explanation expanded
- Mobile view screenshots

Export all wireframes as PNG for submission.

---

### 🧪 7:00 AM – 10:00 AM | Final Testing + Bug Fixes

**Complete smoke test on deployed Vercel URL:**

- [ ] All 5 demo accounts login and load dashboard
- [ ] Dashboard shows correct data per account
- [ ] Chatbot responds correctly in Hindi + English
- [ ] Recommendations are relevant + have SHAP explanation
- [ ] Meena (stressed) CANNOT apply for new loan
- [ ] Wellness score calculates and displays
- [ ] Consent grant/revoke works
- [ ] All i18n strings present (no missing keys)
- [ ] No console errors in browser DevTools
- [ ] Mobile view looks correct

Fix all bugs. Final build + deploy.

---

## 🏁 FINAL SUBMISSION — 10:00 AM Sept 13

```
Your deliverables:
  ✅ Deployed frontend URL (Vercel)
  ✅ Wireframes PNG (8 screens)
  ✅ Screenshots of working prototype
  ✅ 3-minute demo video (see Phase 4 below)
  ✅ All code pushed to GitHub
```

---

---

# 🎬 PHASE 4 — Demo Prep
## ⏰ 10:00 AM → 1:00 PM Sept 13

**YOUR TASK: Record the 3-minute demo video**

| Timestamp | Content |
|---|---|
| 0:00 – 0:20 | Problem intro (quick, punchy) |
| 0:20 – 0:50 | Onboarding — language selection in Hindi |
| 0:50 – 1:20 | Ramesh dashboard (Farmer, Hindi, crop recs) |
| 1:20 – 1:50 | Chatbot: "Mujhe loan chahiye" → full loan flow |
| 1:50 – 2:15 | Meena (Stressed): Alert → NO loan → Restructure offered |
| 2:15 – 2:30 | Wellness score + SHAP explanation expanded |
| 2:30 – 3:00 | Closing: "Ethical, vernacular, scalable" |

**Tips:**
- Use Loom or OBS for screen recording
- Keep cursor movement deliberate and slow
- Narrate in English (demo video) even if UI is in Hindi
- Highlight the stress block on Meena — it's the most powerful ethical moment

---

---

## 📋 MASTER TASK CHECKLIST

### Phase 2A (2 AM – 7 AM)
- [ ] Project scaffolded with Vite + all deps installed
- [ ] Tailwind configured with custom colors + fonts
- [ ] Folder structure created
- [ ] Login/Onboarding page (static)
- [ ] Dashboard page (static stub data)
- [ ] Profile page (static stub data)
- [ ] i18n initialized with EN + HI translation files
- [ ] Language switcher working on all pages

### Phase 2B (7 AM – 1 PM)
- [ ] Floating Chatbot UI component with voice input
- [ ] Recommendation cards with "Why this?" SHAP section
- [ ] Dynamic widget ordering by segment (Zustand)
- [ ] 7-step Loan Wizard (navigable with mock data)

### Phase 2C (1 PM – 5 PM)
- [ ] `services/api.js` with JWT interceptor
- [ ] All pages connected to real APIs
- [ ] Stress Alert Banner (3 levels)
- [ ] Stress Score Gauge
- [ ] All 5 demo accounts tested end-to-end

### Phase 3A (5 PM – 10:30 PM)
- [ ] Life Event Card component
- [ ] Financial Wellness Dashboard (radar chart + score)
- [ ] Financial Literacy page (5 lessons + quiz)
- [ ] WhatsApp Simulator UI
- [ ] Consent Management page with DPDP features
- [ ] Upgraded SHAP explanation in recommendation cards

### Phase 3B (10:30 PM – 10 AM Sept 13)
- [ ] All Framer Motion animations added
- [ ] Color palette finalized
- [ ] Mobile responsive on 5 breakpoints
- [ ] Accessibility (ARIA + keyboard nav)
- [ ] PWA setup (manifest + service worker)
- [ ] Low-bandwidth mode toggle
- [ ] Deployed to Vercel
- [ ] Cross-browser tested
- [ ] 8 wireframes created + exported
- [ ] Screenshots taken of all major screens
- [ ] Full smoke test on deployed URL
- [ ] Zero console errors

### Phase 4 (10 AM – 1 PM Sept 13)
- [ ] 3-minute demo video recorded + uploaded

---

## 🤝 COLLABORATION TOUCHPOINTS

| You Need From | What | When |
|---|---|---|
| Member 2 | API base URL, response schemas, demo accounts | 7 AM + 1 PM |
| Member 4 | Chatbot response JSON format | 11 AM |
| Member 4 | SHAP explanation object structure | 1 PM |
| Member 3 | Wellness + Life Event API schemas | 1 PM |
| Member 2 | Deployed Render backend URL | ~9 PM Sept 12 |

| You Provide To | What | When |
|---|---|---|
| Member 4 | How SHAP bars should visually look (your design) | 11 AM |
| Whole team | Deployed Vercel URL for testing | By 3 AM Sept 13 |
| Whole team | 8 wireframe PNGs + screenshots | By 7 AM Sept 13 |

---

*Built for the hackathon. Go ship it. 🚀*
