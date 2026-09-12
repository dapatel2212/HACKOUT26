import React from 'react'
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/onboarding')({
  component: OnboardingPage,
})

function OnboardingPage() {
  return (
    <div className="min-h-screen bg-bg-custom p-4 flex flex-col items-center justify-center">
      <h1 className="text-2xl font-bold text-indigo-900 mb-4">Onboarding</h1>
      <p className="text-center max-w-md text-slate-600 mb-8">
        Language - Consent - Segment Selection
      </p>
      <a href="/dashboard" className="bg-saffron text-white px-6 py-2 rounded-full font-semibold">
        Complete Onboarding
      </a>
    </div>
  )
}
