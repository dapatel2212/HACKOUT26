# BANKBUDDY AI - QUICK START GUIDE

## Current Status

You have TWO frontend codebases:

1. **banking_ai/** - Original React Router + JSX frontend (incomplete)
2. **lovable_frontend_extract/** - New TanStack Start + TypeScript frontend (superior but incomplete)

## Recommended Path: USE LOVABLE FRONTEND AS PRIMARY

### Why?
- ✅ Modern TypeScript architecture
- ✅ Superior UI component library (shadcn/ui)
- ✅ Better state management
- ✅ TanStack Router (better than React Router)
- ✅ Pre-built AI elements
- ✅ Demo data already structured
- ✅ Better animations and polish

### What's Missing?
- Home page (currently placeholder)
- Login page
- Onboarding flow
- Money page
- Recommendations page
- Loans wizard
- Wellness page
- Literacy page
- Consent page
- WhatsApp page
- AI chat page (dedicated)
- Profile page

## FASTEST PATH TO HACKATHON-READY APP

### Step 1: Set Up Lovable Frontend
```bash
cd lovable_frontend_extract
npm install
npm run dev
```

### Step 2: Priority Routes to Implement (in order)

**Critical (Must Have for Demo):**
1. Home page - BankBuddy welcome (replace placeholder)
2. Dashboard - Already exists, just enhance
3. Recommendations - Show 3 products with "Why this?"
4. AI Chat - Dedicated chat interface
5. Loans - Simplified wizard showing stress blocking

**Important (Should Have):**
6. Profile - Show customer info + stress level
7. Wellness - Score + simple visualization
8. Consent - Show OFF defaults

**Nice to Have (Time Permitting):**
9. Login - Simple demo login
10. Money - Transaction insights
11. Literacy - Lesson cards
12. WhatsApp - Chat simulator

### Step 3: Key Demo Features to Highlight

1. **Customer Switching** (already works!)
   - Switch between Ramesh → Meena
   - Show how recommendations change
   - Show stress blocking for Meena

2. **Language Switching** (already works!)
   - Switch English ↔ Hindi
   - Show multilingual UI

3. **Explainable AI**
   - Click "Why this?" on recommendations
   - Show match score and factors

4. **Ethical AI**
   - Show Meena (stressed customer)
   - Try to apply for loan
   - See blocking message + support options

## FILE LOCATIONS

### In Lovable Frontend:
```
lovable_frontend_extract/
├── src/
│   ├── components/
│   │   ├── ai-elements/     # AI chat components
│   │   ├── banking/          # Banking-specific UI
│   │   ├── layout/           # App shell, navigation
│   │   └── ui/               # shadcn components
│   ├── routes/
│   │   ├── dashboard.tsx     # ✅ Working
│   │   └── index.tsx         # ❌ Placeholder - REPLACE THIS
│   ├── stores/
│   │   └── bankbuddy.ts      # ✅ Customer + state management
│   ├── data/
│   │   └── bankbuddy.ts      # ✅ 5 demo customers with segments
│   └── i18n/                  # Translations (partial)
```

## DEMO SCRIPT FOR JUDGES

```
1. Home Page
   "Welcome to BankBuddy - personalized banking in your language"

2. Switch Customer: Ramesh → Meena
   "Notice how the dashboard changes based on customer segment"

3. Dashboard (Meena - Stressed)
   "See the warning banner - our AI detected financial stress"

4. Recommendations
   "Instead of loans, we offer restructuring and support"
   Click "Why this?" → "Show explainable AI"

5. Try Loan Application
   "Watch: The system blocks new loans for stressed customers"
   "This is ethical AI - we protect, not exploit"

6. Switch to Priya (Healthy)
   "Now see normal loan recommendations"

7. Language Switch
   "Everything works in Hindi, Tamil, and 10 more languages"

8. Consent Page
   "All consent is OFF by default - customer privacy first"
```

## CRITICAL CUSTOMIZATIONS NEEDED

### 1. Home Page (High Priority)
**File:** `lovable_frontend_extract/src/routes/index.tsx`

Replace the placeholder image with:
```tsx
// BankBuddy Welcome Page
- Heading: "Your money. Your language. Your AI."
- Subheading: "Personalized banking that understands your financial life"
- Language selector
- Continue button → /dashboard
- Clean, premium Indian banking aesthetic
```

### 2. Recommendations Page (High Priority)
**File:** `lovable_frontend_extract/src/routes/recommendations.tsx` (CREATE)

```tsx
// Show maximum 3 recommendations
// Each with:
- Product card
- Match score (87%)
- "Why this?" expandable explanation
- Accept / Dismiss buttons
- If stressed: show support products only
```

### 3. Stress Blocking (Already Partially Implemented)
**Enhance:** `lovable_frontend_extract/src/routes/dashboard.tsx`

The stress banner already exists! Just need to:
- Make it more prominent for Meena
- Link to support options
- Add loan blocking logic

## ENVIRONMENT VARIABLES

Create `.env` in lovable_frontend_extract:
```bash
VITE_API_URL=http://localhost:8000/api
VITE_USE_MOCK=true
```

## BUILD & TEST

```bash
# Development
npm run dev

# Build (for production)
npm run build

# Lint
npm run lint

# Format
npm run format
```

## INTEGRATION WITH BACKEND

**When backend is ready:**

1. Create service files in `src/services/`:
   - `api.ts` (axios instance)
   - `customerService.ts`
   - `recommendationService.ts`
   - `stressService.ts`
   - etc.

2. Toggle mock mode:
   ```ts
   const USE_MOCK = import.meta.env.VITE_USE_MOCK === 'true';
   ```

3. Keep same data shapes between mock and real

## WHAT TO SHOW VS. BUILD

### Show (Use Existing):
- ✅ Customer switching
- ✅ Language switching
- ✅ Dashboard with stress detection
- ✅ Demo customer data
- ✅ Segment-aware UI
- ✅ Beautiful components

### Build (New Routes):
- 🔨 Home page (replace placeholder)
- 🔨 Recommendations page (top 3)
- 🔨 Basic loan wizard (show blocking)
- 🔨 Profile page (simple)
- 🔨 AI chat page (dedicated)

### Skip (Time Permitting):
- ⏭️ Full 7-step loan wizard
- ⏭️ Complete literacy system
- ⏭️ WhatsApp simulator
- ⏭️ Full backend integration
- ⏭️ All 12 languages complete
- ⏭️ Voice input
- ⏭️ PWA features

## SUCCESS METRICS

**Minimum Viable Demo:**
- [ ] Loads without errors
- [ ] Customer switching works
- [ ] Language switching (EN/HI)
- [ ] Dashboard shows stress detection
- [ ] Can navigate to 5+ pages
- [ ] Looks professional
- [ ] Demo script works (3 minutes)

**Ideal Demo:**
- [ ] All above +
- [ ] Loan blocking demonstration
- [ ] Explainable AI visible
- [ ] Consent defaults shown
- [ ] Responsive mobile view
- [ ] Smooth animations
- [ ] Professional polish

## COMMON ISSUES & FIXES

### Issue: `npm install` fails
**Fix:** Use `npm install --legacy-peer-deps`

### Issue: Route not found
**Fix:** TanStack auto-generates `routeTree.gen.ts` - don't edit it

### Issue: TypeScript errors
**Fix:** Use `// @ts-ignore` temporarily, fix later

### Issue: Import errors
**Fix:** Check path aliases in `tsconfig.json` (`@/` = `src/`)

## DEPLOYMENT

**Quick Deploy (Vercel):**
```bash
# In lovable_frontend_extract/
vercel deploy --prod
```

**Quick Deploy (Netlify):**
```bash
npm run build
# Drag dist/ folder to netlify.com
```

## FINAL CHECKLIST BEFORE DEMO

- [ ] All demo customers load correctly
- [ ] Customer switching updates all data
- [ ] Stress banner shows for Meena
- [ ] Recommendations differ by customer
- [ ] "Why this?" expands correctly
- [ ] Language switches (at least EN/HI)
- [ ] No console errors
- [ ] Mobile view looks good
- [ ] Demo script rehearsed
- [ ] Backup plan if internet fails

---

**Remember:** Focus on the DEMO, not perfection. 
A working 5-page demo beats a broken 13-page app.

Good luck with your hackathon! 🚀
