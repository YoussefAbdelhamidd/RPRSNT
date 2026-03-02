import { useState, type FormEvent } from 'react'
import { LoginForm } from '../components'
import { AGENT_CREDENTIALS } from '../constants'
import { grantAccessSession } from '../utils'

export type LoginPageProps = {
  onAuthenticated: () => void
  /** If true, show username/password hint (dev only) */
  showHint?: boolean
}

export function LoginPage({ onAuthenticated, showHint = false }: LoginPageProps) {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const trimmed = username.trim()
    const entry = Object.entries(AGENT_CREDENTIALS).find(
      ([u]) => u.toLowerCase() === trimmed.toLowerCase()
    )
    if (!entry || password !== entry[1]) {
      setError('Invalid username or password.')
      return
    }
    grantAccessSession()
    onAuthenticated()
    setError('')
    setUsername('')
    setPassword('')
  }

  const clearError = () => {
    if (error) setError('')
  }

  return (
    <main className="min-h-screen grid place-items-center p-6 bg-gradient-to-br from-[#f5f7fb] to-[#e8eef9]">
      <section className="w-full max-w-[460px] bg-white rounded-[18px] p-6 shadow-lg">
        <h1 className="m-0 text-[1.9rem]">Secure Access</h1>
        <p className="mt-1.5 text-[#4c5e75]">
          Enter username and password to open the main dashboard.
        </p>
        <LoginForm
          username={username}
          password={password}
          error={error}
          onUsernameChange={(v) => {
            setUsername(v)
            clearError()
          }}
          onPasswordChange={(v) => {
            setPassword(v)
            clearError()
          }}
          onSubmit={handleSubmit}
          hintUsername={showHint ? Object.keys(AGENT_CREDENTIALS)[0] : undefined}
          hintPassword={showHint ? Object.values(AGENT_CREDENTIALS)[0] : undefined}
        />
      </section>
    </main>
  )
}
