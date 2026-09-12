import React, { useEffect } from 'react'
import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { useAuthStore } from '../store/authStore'

export const Route = createFileRoute('/')({
  component: RootIndexRedirect,
})

function RootIndexRedirect() {
  const navigate = useNavigate()
  const { isAuthenticated } = useAuthStore()

  useEffect(() => {
    if (isAuthenticated) {
      navigate({ to: '/dashboard', replace: true })
    } else {
      navigate({ to: '/login', replace: true })
    }
  }, [isAuthenticated, navigate])

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950 text-slate-500 text-sm font-medium">
      Directing to BankBuddy...
    </div>
  )
}
