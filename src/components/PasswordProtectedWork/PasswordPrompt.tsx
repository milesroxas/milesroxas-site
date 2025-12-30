'use client'

import { Lock } from 'lucide-react'
import type React from 'react'
import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useWorkPasswordStore } from '@/stores/workPasswordStore'

interface PasswordPromptProps {
  workId: number
  onUnlock: () => void
}

export const PasswordPrompt: React.FC<PasswordPromptProps> = ({ workId, onUnlock }) => {
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const unlockWork = useWorkPasswordStore((state) => state.unlockWork)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError('')

    try {
      const response = await fetch('/api/verify-work-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ workId, password }),
      })

      const data = await response.json()

      if (data.verified) {
        unlockWork(workId)
        // Small delay to show success before revealing content
        setTimeout(() => {
          onUnlock()
        }, 200)
      } else {
        setError('Incorrect password. Please try again.')
        setPassword('')
      }
    } catch (err) {
      setError('Error verifying password. Please try again.')
      console.error('Password verification error:', err)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="flex min-h-[60vh] items-center justify-center">
      <div className="w-full max-w-md space-y-8 rounded-lg border border-border bg-card p-8 shadow-lg">
        <div className="text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
            <Lock className="h-8 w-8 text-primary" />
          </div>
          <h2 className="text-2xl font-bold">This work is password protected</h2>
          <p className="mt-2 text-sm text-muted-foreground">
            Enter the password to view this content
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter password"
              disabled={isLoading}
              autoFocus
            />
          </div>

          {error && (
            <div className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">{error}</div>
          )}

          <Button type="submit" disabled={isLoading || !password} className="w-full">
            {isLoading ? 'Verifying...' : 'Unlock'}
          </Button>
        </form>
      </div>
    </div>
  )
}
