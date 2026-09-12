# BANKBUDDY AI - IMPLEMENTATION GUIDE
## Step-by-Step Code Examples

This guide provides ready-to-use code for implementing the critical missing features.

---

## SETUP

### 1. Navigate to Lovable Frontend
```bash
cd d:\personlized_banking\AI-Powered-Hyper-Personalized-Banking-for-Bharat\lovable_frontend_extract
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Create Environment File
```bash
# Create .env file
echo "VITE_API_URL=http://localhost:8000/api" > .env
echo "VITE_USE_MOCK=true" >> .env
```

### 4. Start Development Server
```bash
npm run dev
```

---

## CRITICAL IMPLEMENTATIONS

### 1. HOME PAGE (Replace Placeholder)

**File:** `src/routes/index.tsx`

```tsx
import { createFileRoute, Link } from "@tanstack/react-router";
import { useTranslation } from "react-i18next";
import { Globe, Shield, Brain, TrendingUp, Users, Heart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { languages } from "@/data/bankbuddy";
import { useBankBuddy } from "@/stores/bankbuddy";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "BankBuddy - Your Money. Your Language. Your AI." },
      { name: "description", content: "Personalized banking that understands your financial life" },
    ],
  }),
  component: Home,
});

function Home() {
  const { t, i18n } = useTranslation();
  const { setLanguage } = useBankBuddy();

  const features = [
    {
      icon: Brain,
      title: "AI-Powered Intelligence",
      description: "Personalized recommendations that understand your unique financial life",
    },
    {
      icon: Globe,
      title: "12 Indian Languages",
      description: "Banking in Hindi, Tamil, Bengali, and 9 more languages",
    },
    {
      icon: Shield,
      title: "Privacy First",
      description: "Your data, your control. All permissions OFF by default",
    },
    {
      icon: Heart,
      title: "Ethical AI",
      description: "We protect you from financial harm, not exploit you",
    },
    {
      icon: Users,
      title: "Hyper-Personalized",
      description: "Different segments, different needs, different solutions",
    },
    {
      icon: TrendingUp,
      title: "Financial Wellness",
      description: "Not just loans - complete financial health tracking",
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-indigo-50 via-white to-white">
      {/* Hero Section */}
      <div className="container mx-auto px-4 py-16">
        <div className="text-center max-w-4xl mx-auto">
          {/* Logo/Brand */}
          <div className="mb-8">
            <h1 className="text-6xl font-extrabold text-indigo-900 mb-4">
              BankBuddy
            </h1>
            <div className="flex items-center justify-center gap-2 text-saffron font-semibold">
              <Brain className="size-6" />
              <span>AI-Powered Banking for Bharat</span>
            </div>
          </div>

          {/* Main Headline */}
          <h2 className="text-5xl font-extrabold text-gray-900 mb-6 leading-tight">
            Your money. <br />
            Your language. <br />
            <span className="text-indigo-700">Your AI.</span>
          </h2>

          <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
            Personalized banking that understands your financial life.
            Speak your language. Get products that fit. Stay protected.
          </p>

          {/* Language Selector */}
          <div className="mb-8">
            <p className="text-sm text-gray-600 mb-4">Choose your language:</p>
            <div className="flex flex-wrap gap-2 justify-center max-w-2xl mx-auto">
              {languages.slice(0, 6).map((lang) => (
                <Button
                  key={lang.code}
                  variant={i18n.language === lang.code ? "default" : "outline"}
                  size="sm"
                  onClick={() => {
                    setLanguage(lang.code);
                    i18n.changeLanguage(lang.code);
                  }}
                  className="font-semibold"
                >
                  {lang.native}
                </Button>
              ))}
            </div>
          </div>

          {/* CTA */}
          <div className="flex gap-4 justify-center">
            <Button asChild size="lg" className="text-lg px-8">
              <Link to="/dashboard">
                Get Started
              </Link>
            </Button>
            <Button asChild size="lg" variant="outline" className="text-lg px-8">
              <Link to="/dashboard">
                See Demo
              </Link>
            </Button>
          </div>

          {/* Trust Badge */}
          <p className="text-sm text-gray-500 mt-6">
            🔒 Your data stays in India. Privacy first. No dark patterns.
          </p>
        </div>
      </div>

      {/* Features Grid */}
      <div className="container mx-auto px-4 py-16">
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
          {features.map((feature) => (
            <Card key={feature.title} className="p-6">
              <feature.icon className="size-10 text-indigo-600 mb-4" />
              <h3 className="font-bold text-lg mb-2">{feature.title}</h3>
              <p className="text-gray-600 text-sm">{feature.description}</p>
            </Card>
          ))}
        </div>
      </div>

      {/* Social Proof */}
      <div className="container mx-auto px-4 py-16 text-center">
        <p className="text-gray-600 mb-4">Built for the next 400 million Indians</p>
        <div className="flex justify-center gap-8 text-sm text-gray-500">
          <span>🌾 Farmers</span>
          <span>💼 Salaried</span>
          <span>🏪 Shop Owners</span>
          <span>🚗 Gig Workers</span>
          <span>👨‍👩‍👧 Families</span>
        </div>
      </div>
    </div>
  );
}
```

---

### 2. RECOMMENDATIONS PAGE

**File:** `src/routes/recommendations.tsx` (CREATE NEW)

```tsx
import { createFileRoute, Link } from "@tanstack/react-router";
import { useTranslation } from "react-i18next";
import { ArrowLeft, AlertTriangle } from "lucide-react";
import { AppShell } from "@/components/layout/app-shell";
import { RecommendationCard } from "@/components/banking/recommendation-card";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useCustomer } from "@/stores/bankbuddy";

export const Route = createFileRoute("/recommendations")({
  head: () => ({
    meta: [
      { title: "Recommendations | BankBuddy" },
      { name: "description", content: "Personalized financial product recommendations" },
    ],
  }),
  component: Recommendations,
});

function Recommendations() {
  const { t } = useTranslation();
  const customer = useCustomer();
  const stressed = customer.stress > 50;

  return (
    <AppShell>
      <div className="animate-rise">
        {/* Header */}
        <div className="mb-6">
          <Button variant="ghost" size="sm" asChild className="mb-4">
            <Link to="/dashboard">
              <ArrowLeft className="mr-2" />
              Back to Dashboard
            </Link>
          </Button>
          <h1 className="text-3xl font-extrabold">
            {t("dashboard.recommended")}
          </h1>
          <p className="text-muted-foreground mt-2">
            Products selected specifically for you based on your financial profile
          </p>
        </div>

        {/* Stress Warning */}
        {stressed && (
          <Card className="mb-6 border-warning bg-warning-soft p-5">
            <div className="flex gap-4">
              <AlertTriangle className="size-6 text-warning shrink-0 mt-1" />
              <div>
                <h2 className="font-bold">We're here to help, not add pressure</h2>
                <p className="text-sm text-muted-foreground mt-1">
                  Based on your current financial situation, we're recommending support
                  options instead of new credit products. Your financial wellness comes first.
                </p>
              </div>
            </div>
          </Card>
        )}

        {/* How It Works */}
        <Card className="mb-8 p-5 bg-gradient-to-r from-indigo-50 to-blue-50 border-indigo-200">
          <h2 className="font-bold mb-2">How We Chose These For You</h2>
          <ul className="text-sm text-gray-700 space-y-1">
            <li>✓ Analyzed your last 6 months of transactions</li>
            <li>✓ Identified you as: <strong>{customer.segmentLabel}</strong></li>
            <li>✓ Checked your financial health: <strong>{customer.stressLevel}</strong></li>
            <li>✓ Matched products to your needs: <strong>Match scores up to {customer.recommendations[0]?.match}%</strong></li>
          </ul>
        </Card>

        {/* Recommendations */}
        <div className="space-y-6">
          {customer.recommendations.slice(0, 3).map((rec, index) => (
            <div key={rec.id} className="relative">
              <div className="absolute -left-4 top-0 flex size-8 items-center justify-center rounded-full bg-indigo-600 text-white font-bold text-sm">
                {index + 1}
              </div>
              <RecommendationCard item={rec} />
            </div>
          ))}
        </div>

        {/* Info Footer */}
        <Card className="mt-8 p-5 bg-gray-50">
          <h3 className="font-semibold mb-2">Why only 3 recommendations?</h3>
          <p className="text-sm text-gray-600">
            We limit recommendations to prevent overwhelming you. Each product is carefully
            selected for your situation. You can dismiss products you're not interested in,
            and we won't show them again for 30 days.
          </p>
        </Card>
      </div>
    </AppShell>
  );
}
```

---

### 3. SIMPLIFIED LOAN WIZARD WITH STRESS BLOCKING

**File:** `src/routes/loans.tsx` (CREATE NEW)

```tsx
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { Shield, AlertTriangle, CheckCircle2, TrendingUp } from "lucide-react";
import { AppShell } from "@/components/layout/app-shell";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Slider } from "@/components/ui/slider";
import { useCustomer } from "@/stores/bankbuddy";

export const Route = createFileRoute("/loans")({
  head: () => ({
    meta: [{ title: "Apply for Loan | BankBuddy" }],
  }),
  component: Loans,
});

function Loans() {
  const customer = useCustomer();
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [amount, setAmount] = useState(100000);
  const [tenure, setTenure] = useState(24);

  const stressed = customer.stress > 50;
  const interestRate = 10.5;
  const monthlyEMI = Math.round((amount * interestRate / 1200) * 
    Math.pow(1 + interestRate / 1200, tenure) / 
    (Math.pow(1 + interestRate / 1200, tenure) - 1));

  // STRESS BLOCKING LOGIC
  if (stressed) {
    return (
      <AppShell>
        <div className="max-w-2xl mx-auto animate-rise">
          <Card className="p-8 border-warning bg-warning-soft">
            <div className="text-center">
              <AlertTriangle className="size-16 text-warning mx-auto mb-4" />
              <h1 className="text-2xl font-bold mb-4">
                Let's focus on reducing pressure first
              </h1>
              <p className="text-gray-700 mb-6">
                We've detected financial stress in your account (score: {customer.stress}/100).
                Taking on new debt right now could make things harder.
              </p>
              <p className="text-gray-700 mb-8">
                Instead, we'd like to help you with:
              </p>

              <div className="space-y-4 text-left mb-8">
                <Card className="p-4 bg-white">
                  <div className="flex gap-3">
                    <Shield className="size-6 text-green-600 shrink-0" />
                    <div>
                      <h3 className="font-semibold">Restructure Existing EMIs</h3>
                      <p className="text-sm text-gray-600">Lower your monthly payments to create breathing room</p>
                    </div>
                  </div>
                </Card>

                <Card className="p-4 bg-white">
                  <div className="flex gap-3">
                    <TrendingUp className="size-6 text-blue-600 shrink-0" />
                    <div>
                      <h3 className="font-semibold">Financial Wellness Plan</h3>
                      <p className="text-sm text-gray-600">Free 20-minute session with a counselor</p>
                    </div>
                  </div>
                </Card>
              </div>

              <div className="flex gap-4 justify-center">
                <Button size="lg">
                  Explore Support Options
                </Button>
                <Button size="lg" variant="outline" asChild>
                  <Link to="/dashboard">Back to Dashboard</Link>
                </Button>
              </div>

              <p className="text-xs text-gray-500 mt-6">
                This is ethical AI. We're here to help you, not exploit your situation.
              </p>
            </div>
          </Card>
        </div>
      </AppShell>
    );
  }

  // NORMAL LOAN FLOW (for healthy customers)
  return (
    <AppShell>
      <div className="max-w-3xl mx-auto animate-rise">
        {/* Progress */}
        <div className="mb-8">
          <div className="flex justify-between text-sm mb-2">
            <span className="font-semibold">Step {step} of 3</span>
            <span className="text-gray-500">Loan Application</span>
          </div>
          <Progress value={(step / 3) * 100} />
        </div>

        {/* Step 1: Amount */}
        {step === 1 && (
          <Card className="p-8">
            <h2 className="text-2xl font-bold mb-2">How much do you need?</h2>
            <p className="text-gray-600 mb-8">
              Based on your profile, you're pre-approved for up to ₹5,00,000
            </p>

            <div className="mb-8">
              <div className="text-center mb-6">
                <div className="text-5xl font-bold text-indigo-600">
                  ₹{amount.toLocaleString("en-IN")}
                </div>
                <div className="text-gray-500 mt-2">Loan Amount</div>
              </div>

              <Slider
                value={[amount]}
                onValueChange={([v]) => setAmount(v)}
                min={50000}
                max={500000}
                step={10000}
                className="mb-4"
              />

              <div className="flex justify-between text-sm text-gray-500">
                <span>₹50,000</span>
                <span>₹5,00,000</span>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4 mb-8">
              <Card className="p-4 text-center">
                <div className="text-lg font-bold">₹{monthlyEMI.toLocaleString()}</div>
                <div className="text-xs text-gray-500">Monthly EMI</div>
              </Card>
              <Card className="p-4 text-center">
                <div className="text-lg font-bold">{interestRate}%</div>
                <div className="text-xs text-gray-500">Interest Rate</div>
              </Card>
              <Card className="p-4 text-center">
                <div className="text-lg font-bold">{tenure} months</div>
                <div className="text-xs text-gray-500">Tenure</div>
              </Card>
            </div>

            <Button size="lg" className="w-full" onClick={() => setStep(2)}>
              Continue
            </Button>
          </Card>
        )}

        {/* Step 2: Tenure */}
        {step === 2 && (
          <Card className="p-8">
            <h2 className="text-2xl font-bold mb-2">Choose repayment period</h2>
            <p className="text-gray-600 mb-8">
              Longer tenure = lower EMI, but more total interest
            </p>

            <div className="space-y-4 mb-8">
              {[12, 24, 36, 48].map((months) => {
                const emi = Math.round((amount * interestRate / 1200) * 
                  Math.pow(1 + interestRate / 1200, months) / 
                  (Math.pow(1 + interestRate / 1200, months) - 1));
                
                return (
                  <Card
                    key={months}
                    className={`p-4 cursor-pointer border-2 transition-all ${
                      tenure === months
                        ? "border-indigo-600 bg-indigo-50"
                        : "border-gray-200 hover:border-indigo-300"
                    }`}
                    onClick={() => setTenure(months)}
                  >
                    <div className="flex justify-between items-center">
                      <div>
                        <div className="font-bold">{months} months</div>
                        <div className="text-sm text-gray-500">{months / 12} years</div>
                      </div>
                      <div className="text-right">
                        <div className="font-bold text-lg">₹{emi.toLocaleString()}/mo</div>
                        <div className="text-sm text-gray-500">
                          Total: ₹{(emi * months).toLocaleString()}
                        </div>
                      </div>
                    </div>
                  </Card>
                );
              })}
            </div>

            <div className="flex gap-4">
              <Button variant="outline" onClick={() => setStep(1)}>
                Back
              </Button>
              <Button size="lg" className="flex-1" onClick={() => setStep(3)}>
                Continue
              </Button>
            </div>
          </Card>
        )}

        {/* Step 3: Summary */}
        {step === 3 && (
          <Card className="p-8">
            <div className="text-center mb-8">
              <CheckCircle2 className="size-16 text-green-600 mx-auto mb-4" />
              <h2 className="text-2xl font-bold mb-2">Loan Summary</h2>
              <p className="text-gray-600">Review your loan details</p>
            </div>

            <div className="space-y-4 mb-8">
              <div className="flex justify-between py-2 border-b">
                <span className="text-gray-600">Loan Amount</span>
                <span className="font-bold">₹{amount.toLocaleString("en-IN")}</span>
              </div>
              <div className="flex justify-between py-2 border-b">
                <span className="text-gray-600">Interest Rate</span>
                <span className="font-bold">{interestRate}% p.a.</span>
              </div>
              <div className="flex justify-between py-2 border-b">
                <span className="text-gray-600">Tenure</span>
                <span className="font-bold">{tenure} months</span>
              </div>
              <div className="flex justify-between py-2 border-b">
                <span className="text-gray-600">Monthly EMI</span>
                <span className="font-bold text-lg text-indigo-600">
                  ₹{monthlyEMI.toLocaleString("en-IN")}
                </span>
              </div>
              <div className="flex justify-between py-2">
                <span className="text-gray-600">Total Repayment</span>
                <span className="font-bold">
                  ₹{(monthlyEMI * tenure).toLocaleString("en-IN")}
                </span>
              </div>
            </div>

            <div className="bg-indigo-50 p-4 rounded-lg mb-8">
              <p className="text-sm text-gray-700">
                <strong>Next steps:</strong> After submitting, we'll verify your documents
                and disburse funds within 48 hours.
              </p>
            </div>

            <div className="flex gap-4">
              <Button variant="outline" onClick={() => setStep(2)}>
                Back
              </Button>
              <Button 
                size="lg" 
                className="flex-1"
                onClick={() => {
                  alert("Loan application submitted! (Demo)");
                  navigate({ to: "/dashboard" });
                }}
              >
                Submit Application
              </Button>
            </div>
          </Card>
        )}
      </div>
    </AppShell>
  );
}
```

---

### 4. PROFILE PAGE

**File:** `src/routes/profile.tsx` (CREATE NEW)

```tsx
import { createFileRoute } from "@tanstack/react-router";
import { User, MapPin, Calendar, CreditCard, Shield, Settings } from "lucide-react";
import { AppShell } from "@/components/layout/app-shell";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { useCustomer } from "@/stores/bankbuddy";

export const Route = createFileRoute("/profile")({
  head: () => ({
    meta: [{ title: "Profile | BankBuddy" }],
  }),
  component: Profile,
});

function Profile() {
  const customer = useCustomer();

  const stressColor = customer.stress > 60 ? "destructive" : customer.stress > 30 ? "warning" : "success";

  return (
    <AppShell>
      <div className="max-w-4xl mx-auto animate-rise">
        {/* Header Card */}
        <Card className="p-8 mb-6 brand-gradient text-primary-foreground">
          <div className="flex items-start gap-6">
            <Avatar className="size-24 border-4 border-white">
              <AvatarFallback className="text-3xl font-bold bg-white text-indigo-600">
                {customer.initials}
              </AvatarFallback>
            </Avatar>

            <div className="flex-1">
              <h1 className="text-3xl font-extrabold mb-2">{customer.name}</h1>
              <div className="flex gap-2 mb-4">
                <Badge variant="secondary" className="bg-white/20 text-white">
                  {customer.segmentLabel}
                </Badge>
                <Badge variant={stressColor === "success" ? "success" : "warning"} className="bg-white/20 text-white">
                  {customer.stressLevel}
                </Badge>
              </div>

              <div className="grid grid-cols-2 gap-4 text-sm">
                <div className="flex items-center gap-2">
                  <MapPin className="size-4" />
                  <span>{customer.location}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Calendar className="size-4" />
                  <span>Born: {customer.dob}</span>
                </div>
              </div>
            </div>

            <Button variant="outline" className="bg-white/10 text-white border-white/30">
              <Settings className="mr-2" />
              Edit Profile
            </Button>
          </div>
        </Card>

        {/* Info Grid */}
        <div className="grid md:grid-cols-2 gap-6 mb-6">
          {/* Financial Overview */}
          <Card className="p-6">
            <h2 className="font-bold text-lg mb-4 flex items-center gap-2">
              <CreditCard className="size-5 text-indigo-600" />
              Financial Overview
            </h2>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-600">Current Balance</span>
                <span className="font-bold">₹{customer.balance.toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Monthly Income</span>
                <span className="font-bold">₹{customer.income.toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Savings Rate</span>
                <span className="font-bold text-green-600">{customer.savingsRate}%</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Wellness Score</span>
                <span className="font-bold">{customer.wellness}/100</span>
              </div>
            </div>
          </Card>

          {/* Identity */}
          <Card className="p-6">
            <h2 className="font-bold text-lg mb-4 flex items-center gap-2">
              <Shield className="size-5 text-indigo-600" />
              Identity & Security
            </h2>
            <div className="space-y-3">
              <div>
                <div className="text-sm text-gray-600">Aadhaar Number</div>
                <div className="font-mono font-bold">{customer.aadhaar}</div>
                <div className="text-xs text-gray-500 mt-1">
                  ✓ Verified & Masked for security
                </div>
              </div>
              <div>
                <div className="text-sm text-gray-600">Preferred Language</div>
                <div className="font-bold">{customer.language.toUpperCase()}</div>
              </div>
              <Button variant="outline" size="sm" className="w-full mt-2">
                Manage Security Settings
              </Button>
            </div>
          </Card>
        </div>

        {/* Stress Analysis */}
        <Card className="p-6 mb-6">
          <h2 className="font-bold text-lg mb-4">Financial Stress Analysis</h2>
          <div className="flex items-center gap-4 mb-4">
            <div className="flex-1">
              <div className="flex justify-between text-sm mb-2">
                <span>Stress Score</span>
                <span className="font-bold">{customer.stress}/100</span>
              </div>
              <div className="h-3 bg-gray-200 rounded-full overflow-hidden">
                <div 
                  className={`h-full transition-all ${
                    customer.stress > 60 ? "bg-red-500" :
                    customer.stress > 30 ? "bg-yellow-500" :
                    "bg-green-500"
                  }`}
                  style={{ width: `${customer.stress}%` }}
                />
              </div>
            </div>
            <Badge variant={stressColor}>
              {customer.stressLevel}
            </Badge>
          </div>
          <p className="text-sm text-gray-600">
            {customer.stress > 50 
              ? "We've detected some financial stress. We recommend focusing on existing obligations before taking on new commitments."
              : "Your financial health looks good! You're eligible for a wide range of products."
            }
          </p>
        </Card>

        {/* Account */}
        <Card className="p-6">
          <h2 className="font-bold text-lg mb-4">Account Information</h2>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <div className="text-sm text-gray-600">Customer ID</div>
              <div className="font-mono font-bold">{customer.id}</div>
            </div>
            <div>
              <div className="text-sm text-gray-600">Segment</div>
              <div className="font-bold">{customer.segment}</div>
            </div>
          </div>
        </Card>
      </div>
    </AppShell>
  );
}
```

---

## TESTING

### Test Stress Blocking

```bash
1. Start dev server: npm run dev
2. Go to dashboard
3. Switch to "Meena Devi" (stressed customer)
4. Navigate to /loans
5. Should see blocking message, not loan application
6. Switch to "Ramesh Kumar" (healthy)
7. Navigate to /loans
8. Should see normal loan application
```

### Test Recommendations

```bash
1. Go to /recommendations
2. Switch between customers
3. Verify recommendations change
4. Check match scores display
5. Verify "Why this?" works (if implemented in RecommendationCard)
```

---

## NEXT STEPS

1. Create these files in order shown above
2. Test each route after creation
3. Verify customer switching works
4. Check responsive design
5. Add remaining routes (wellness, consent, etc.)
6. Polish animations
7. Complete translations
8. Build and deploy

---

## TROUBLESHOOTING

### Build Errors

```bash
# Clear cache and reinstall
rm -rf node_modules .vite
npm install
npm run dev
```

### Import Errors

```typescript
// Check tsconfig.json has:
{
  "compilerOptions": {
    "baseUrl": ".",
    "paths": {
      "@/*": ["./src/*"]
    }
  }
}
```

### Route Not Found

```bash
# TanStack Router auto-generates routes
# After adding new route file, restart dev server
# Do NOT edit routeTree.gen.ts manually
```

---

Good luck! 🚀
