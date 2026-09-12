import { PROFILES } from '../store/useDemoStore'

export const getDashboardData = async (profileId) => {
  await new Promise((resolve) => setTimeout(resolve, 300))
  const profile = Object.values(PROFILES).find((p) => p.id === profileId) || PROFILES.RAMESH

  return {
    profileId: profile.id,
    name: profile.name,
    segment: profile.segment,
    displaySegment: profile.displaySegment,
    balance: profile.balance,
    monthlyIncome: profile.monthlyIncome,
    savingsRate: profile.savingsRate,
    wellnessScore: profile.wellnessScore,
    stressScore: profile.stressScore,
    status: profile.status,
    nextEmi: profile.upcomingEmi,
    recommendedThemes: profile.recommendedThemes,
  }
}

export const getTransactionsData = async (profileId) => {
  await new Promise((resolve) => setTimeout(resolve, 200))

  const baseTransactions = {
    ramesh: [
      { id: 'tx-1', title: 'Kisan Seed Store', category: 'Farm Supplies', amount: 4800, type: 'debit', date: '10 Sep 2026', status: 'Completed' },
      { id: 'tx-2', title: 'Mandi Direct Transfer (Paddy)', category: 'Crop Income', amount: 28000, type: 'credit', date: '04 Sep 2026', status: 'Completed' },
      { id: 'tx-3', title: 'Diesel Pump Payment', category: 'Utilities', amount: 1200, type: 'debit', date: '28 Aug 2026', status: 'Completed' },
      { id: 'tx-4', title: 'PM-Kisan DBT Installment', category: 'Government Scheme', amount: 2000, type: 'credit', date: '15 Aug 2026', status: 'Completed' },
      { id: 'tx-5', title: 'Grocery & Ration', category: 'Household', amount: 3500, type: 'debit', date: '12 Aug 2026', status: 'Completed' },
    ],
    priya: [
      { id: 'tx-1', title: 'TechCorp Solutions Salary', category: 'Salary', amount: 85000, type: 'credit', date: '01 Sep 2026', status: 'Completed' },
      { id: 'tx-2', title: 'Home Loan Auto-Debit', category: 'EMI', amount: 15000, type: 'debit', date: '05 Sep 2026', status: 'Completed' },
      { id: 'tx-3', title: 'Nifty Index Fund SIP', category: 'Investment', amount: 12000, type: 'debit', date: '07 Sep 2026', status: 'Completed' },
      { id: 'tx-4', title: 'Organic Supermarket', category: 'Groceries', amount: 4200, type: 'debit', date: '09 Sep 2026', status: 'Completed' },
      { id: 'tx-5', title: 'Electricity & Gas Bill', category: 'Utilities', amount: 2800, type: 'debit', date: '08 Sep 2026', status: 'Completed' },
    ],
    suresh: [
      { id: 'tx-1', title: 'Wholesale FMCG Supplies', category: 'Inventory', amount: 24000, type: 'debit', date: '10 Sep 2026', status: 'Completed' },
      { id: 'tx-2', title: 'Daily BharatPe QR Settlement', category: 'Business Income', amount: 14500, type: 'credit', date: '09 Sep 2026', status: 'Completed' },
      { id: 'tx-3', title: 'Shop Electricity Commercial', category: 'Utilities', amount: 3800, type: 'debit', date: '06 Sep 2026', status: 'Completed' },
      { id: 'tx-4', title: 'Working Capital Loan EMI', category: 'EMI', amount: 12500, type: 'debit', date: '04 Sep 2026', status: 'Completed' },
      { id: 'tx-5', title: 'PayTM Merchant Settlement', category: 'Business Income', amount: 9800, type: 'credit', date: '02 Sep 2026', status: 'Completed' },
    ],
    arjun: [
      { id: 'tx-1', title: 'Zomato Weekly Payout', category: 'Gig Payout', amount: 8400, type: 'credit', date: '08 Sep 2026', status: 'Completed' },
      { id: 'tx-2', title: 'Fuel - Indian Oil Petrol', category: 'Transport', amount: 1600, type: 'debit', date: '09 Sep 2026', status: 'Completed' },
      { id: 'tx-3', title: 'Bike Maintenance & Oil', category: 'Vehicle', amount: 1450, type: 'debit', date: '05 Sep 2026', status: 'Completed' },
      { id: 'tx-4', title: 'Two-Wheeler Loan EMI', category: 'EMI', amount: 4200, type: 'debit', date: '03 Sep 2026', status: 'Completed' },
      { id: 'tx-5', title: 'Swiggy Weekly Settlement', category: 'Gig Payout', amount: 7900, type: 'credit', date: '01 Sep 2026', status: 'Completed' },
    ],
    meena: [
      { id: 'tx-1', title: 'Tailoring Work Income', category: 'Earned Income', amount: 6500, type: 'credit', date: '08 Sep 2026', status: 'Completed' },
      { id: 'tx-2', title: 'Micro-Loan EMI Attempt (Bounced)', category: 'EMI', amount: 4200, type: 'failed', date: '05 Sep 2026', status: 'Failed' },
      { id: 'tx-3', title: 'Clinic Medical Prescription', category: 'Health', amount: 1850, type: 'debit', date: '03 Sep 2026', status: 'Completed' },
      { id: 'tx-4', title: 'Local Kirana Groceries', category: 'Household', amount: 2200, type: 'debit', date: '01 Sep 2026', status: 'Completed' },
      { id: 'tx-5', title: 'School Books & Uniform', category: 'Education', amount: 1400, type: 'debit', date: '25 Aug 2026', status: 'Completed' },
    ],
  }

  return baseTransactions[profileId] || baseTransactions.ramesh
}

export const getMoneyFlowTrends = (profileId, range = '3M') => {
  const profile = Object.values(PROFILES).find((p) => p.id === profileId) || PROFILES.RAMESH
  const baseInc = profile.monthlyIncome
  const baseExp = Math.round(baseInc * (1 - profile.savingsRate / 100))

  if (range === '1M') {
    return [
      { period: 'Week 1', income: Math.round(baseInc * 0.25), expense: Math.round(baseExp * 0.28) },
      { period: 'Week 2', income: Math.round(baseInc * 0.3), expense: Math.round(baseExp * 0.22) },
      { period: 'Week 3', income: Math.round(baseInc * 0.22), expense: Math.round(baseExp * 0.26) },
      { period: 'Week 4', income: Math.round(baseInc * 0.23), expense: Math.round(baseExp * 0.24) },
    ]
  }

  if (range === '6M') {
    return [
      { period: 'Apr', income: Math.round(baseInc * 0.9), expense: Math.round(baseExp * 0.95) },
      { period: 'May', income: Math.round(baseInc * 0.95), expense: Math.round(baseExp * 0.9) },
      { period: 'Jun', income: Math.round(baseInc * 1.05), expense: Math.round(baseExp * 1.0) },
      { period: 'Jul', income: Math.round(baseInc * 0.98), expense: Math.round(baseExp * 1.05) },
      { period: 'Aug', income: Math.round(baseInc * 1.02), expense: Math.round(baseExp * 0.92) },
      { period: 'Sep', income: baseInc, expense: baseExp },
    ]
  }

  return [
    { period: 'Jul', income: Math.round(baseInc * 0.95), expense: Math.round(baseExp * 1.05) },
    { period: 'Aug', income: Math.round(baseInc * 1.02), expense: Math.round(baseExp * 0.94) },
    { period: 'Sep', income: baseInc, expense: baseExp },
  ]
}

export const getRecommendationsData = (profileId) => {
  const profile = Object.values(PROFILES).find((p) => p.id === profileId) || PROFILES.RAMESH

  if (profile.id === 'ramesh') {
    return [
      {
        id: 'rec-1',
        title: 'Pradhan Mantri Weather Insurance',
        category: 'Agricultural Protection',
        matchScore: 94,
        benefit: 'Automatic direct-bank payout on rainfall deficit or drought without manual claims.',
        explanation: 'Tailored for seasonal Kharif crop cycles. Protects input seed and fertilizer investments.',
        positiveFactors: ['Seasonal crop spend detected (+32%)', 'Zero existing weather cover (+28%)'],
        negativeFactors: ['Requires active land ownership verification'],
        actionType: 'explore',
        actionLabel: 'Explore Policy',
      },
      {
        id: 'rec-2',
        title: 'Kisan Credit Card (KCC) Limit',
        category: 'Working Capital',
        matchScore: 89,
        benefit: 'Concessional interest rate at 4% p.a. with subvention for timely repayment.',
        explanation: 'Designed for pre-harvest agricultural liquidity. Avoids reliance on local informal lenders.',
        positiveFactors: ['Consistent mandi crop receipts (+25%)', 'Low baseline financial stress score (+20%)'],
        negativeFactors: ['Annual renewal audit required'],
        actionType: 'apply',
        actionLabel: 'Apply for KCC',
      },
      {
        id: 'rec-3',
        title: 'Harvest Flexible SIP',
        category: 'Wealth & Savings',
        matchScore: 82,
        benefit: 'Pause or increase contributions according to post-harvest market realizations.',
        explanation: 'Allows disciplined wealth creation without fixed monthly penalty clauses during lean seasons.',
        positiveFactors: ['Lump-sum inflow surplus in harvesting months (+22%)', 'Emergency buffer building (+18%)'],
        negativeFactors: ['Requires basic KYC completion'],
        actionType: 'explore',
        actionLabel: 'Start Flexible SIP',
      },
    ]
  }

  if (profile.id === 'priya') {
    return [
      {
        id: 'rec-1',
        title: 'Equity Growth SIP (Nifty 50 Index)',
        category: 'Wealth Building',
        matchScore: 96,
        benefit: 'High-compounding equity wealth creation with industry-low 0.1% expense ratio.',
        explanation: 'Matched to your predictable corporate salary and 32% monthly savings surplus.',
        positiveFactors: ['High savings rate of 32% (+35%)', 'Zero loan default record (+25%)'],
        negativeFactors: ['Equity market volatility risk'],
        actionType: 'apply',
        actionLabel: 'Start SIP',
      },
      {
        id: 'rec-2',
        title: 'Comprehensive Health Shield (₹15 Lakh)',
        category: 'Family Insurance',
        matchScore: 91,
        benefit: 'Cashless hospital network across 12,000+ facilities with zero room-rent capping.',
        explanation: 'Guarantees your long-term wealth is insulated from unforeseen medical emergencies.',
        positiveFactors: ['Dependent family profile (+28%)', 'Corporate top-up eligible (+20%)'],
        negativeFactors: ['2-year waiting period for pre-existing ailments'],
        actionType: 'explore',
        actionLabel: 'View Health Plan',
      },
      {
        id: 'rec-3',
        title: 'Section 80C ELSS Tax Saver',
        category: 'Tax Planning',
        matchScore: 88,
        benefit: 'Save up to ₹46,800 tax annually under Section 80C with short 3-year lock-in.',
        explanation: 'Optimizes remaining annual tax exemption quota with highest historical returns in 80C instruments.',
        positiveFactors: ['Annual tax bracket optimization (+30%)', '3-year lock-in vs 5-year FD (+15%)'],
        negativeFactors: ['Mandatory 36-month lock-in'],
        actionType: 'apply',
        actionLabel: 'Invest in ELSS',
      },
    ]
  }

  if (profile.id === 'suresh') {
    return [
      {
        id: 'rec-1',
        title: 'Digital Smart Overdraft',
        category: 'SME Liquidity',
        matchScore: 91,
        benefit: 'Instant credit limit against daily UPI receivables. Pay interest only on utilized amount.',
        explanation: 'Matched to daily grocery store inventory purchasing cycles and QR settlement streams.',
        positiveFactors: ['High daily UPI merchant cash velocity (+30%)', 'Moderate working capital utilization (+22%)'],
        negativeFactors: ['Slightly higher interest rate if held beyond 30 days'],
        actionType: 'apply',
        actionLabel: 'Activate Overdraft',
      },
      {
        id: 'rec-2',
        title: 'Zero-Fee Soundbox & POS Terminal',
        category: 'Merchant Banking',
        matchScore: 86,
        benefit: 'Instant vernacular audio confirmation in Hindi for every customer payment.',
        explanation: 'Reduces payment reconciliation loss and builds verified bank turnover history.',
        positiveFactors: ['Frequent sub-₹500 transactions (+28%)', 'High customer footfall (+18%)'],
        negativeFactors: ['Monthly transaction activity threshold required'],
        actionType: 'explore',
        actionLabel: 'Order Soundbox',
      },
      {
        id: 'rec-3',
        title: 'Shopkeeper Fire & Theft Insurance',
        category: 'Business Protection',
        matchScore: 83,
        benefit: 'Comprehensive protection up to ₹10 Lakh for inventory, cash in transit, and premises.',
        explanation: 'Insulates small retailers from devastating structural losses.',
        positiveFactors: ['Retail physical inventory assets (+24%)', 'Low annual premium (+19%)'],
        negativeFactors: ['Annual physical audit requirement'],
        actionType: 'explore',
        actionLabel: 'Protect Shop',
      },
    ]
  }

  if (profile.id === 'arjun') {
    return [
      {
        id: 'rec-1',
        title: 'Daily Micro-Insurance (Accident & Hospital)',
        category: 'Gig Protection',
        matchScore: 95,
        benefit: '₹3/day premium deducted automatically from weekly platform payouts.',
        explanation: 'Specifically engineered for delivery professionals with on-road accident and wage-loss protection.',
        positiveFactors: ['High two-wheeler mobility (+36%)', 'Zero medical buffer currently (+25%)'],
        negativeFactors: ['Covers only verified on-duty incidents'],
        actionType: 'explore',
        actionLabel: 'Enroll for ₹3/day',
      },
      {
        id: 'rec-2',
        title: 'Emergency Rainy-Day Fund Account',
        category: 'Liquid Savings',
        matchScore: 90,
        benefit: 'Earn 6.5% interest on daily balances with instant UPI withdrawal anytime.',
        explanation: 'Prevents reliance on high-cost instant loan apps during motorcycle breakdown or illness.',
        positiveFactors: ['Weekly payout cadence (+28%)', 'Builds 2-month expense cushion (+20%)'],
        negativeFactors: ['Low starting balance requirement'],
        actionType: 'apply',
        actionLabel: 'Open Rainy Day Fund',
      },
      {
        id: 'rec-3',
        title: 'Flexible Spare-Change SIP',
        category: 'Micro Investment',
        matchScore: 84,
        benefit: 'Rounds up daily delivery fuel spends to the nearest ₹10 and invests into gold/index funds.',
        explanation: 'Effortless automated saving tailored for variable gig earnings without monthly commitments.',
        positiveFactors: ['Frequent daily micro-spends (+26%)', 'Gentle entry into wealth creation (+18%)'],
        negativeFactors: ['Modest accumulation pace'],
        actionType: 'explore',
        actionLabel: 'Turn on Round-Ups',
      },
    ]
  }

  // Meena Devi (Stressed - Stress Score 72, Loans Blocked)
  return [
    {
      id: 'rec-1',
      title: 'EMI Consolidation & Date Alignment',
      category: 'Debt Relief',
      matchScore: 98,
      benefit: 'Align monthly payments to after the 10th of each month, avoiding bounce penalties.',
      explanation: 'Responsible lending intervention: Synchronizes loan deduction dates with your real tailoring cash receipt days.',
      positiveFactors: ['Prevents recurring ₹500 bounce fees (+40%)', 'Stabilizes credit health (+30%)'],
      negativeFactors: ['Requires agreement from existing lender partners'],
      actionType: 'support',
      actionLabel: 'Request EMI Alignment',
    },
    {
      id: 'rec-2',
      title: 'Tenure Extension for 30% Lower EMI',
      category: 'Cash Flow Protection',
      matchScore: 94,
      benefit: 'Extend remaining loan tenure by 12 months to lower monthly obligations immediately.',
      explanation: 'Reduces immediate monthly strain without triggering adverse default records.',
      positiveFactors: ['Immediately restores positive cash flow buffer (+35%)', 'Safe RBI restructuring framework (+25%)'],
      negativeFactors: ['Slightly increases total nominal interest over duration'],
      actionType: 'support',
      actionLabel: 'Explore Restructuring',
    },
    {
      id: 'rec-3',
      title: 'Free Certified Vernacular Counselor',
      category: 'Financial Wellness Support',
      matchScore: 92,
      benefit: 'Confidential 1-on-1 guidance in Marathi with a certified banking ombudsman advisor.',
      explanation: 'Completely free community support. We will help draft a sustainable household recovery plan.',
      positiveFactors: ['100% confidential and non-punitive (+32%)', 'Available in Marathi (+24%)'],
      negativeFactors: ['Session takes 20 minutes'],
      actionType: 'support',
      actionLabel: 'Book Free Session',
    },
  ]
}
