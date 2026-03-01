import type { FormEvent } from 'react'

export type LoginFormProps = {
  username: string
  password: string
  error: string
  onUsernameChange: (value: string) => void
  onPasswordChange: (value: string) => void
  onSubmit: (event: FormEvent<HTMLFormElement>) => void
  hintUsername?: string
  hintPassword?: string
}

export function LoginForm({
  username,
  password,
  error,
  onUsernameChange,
  onPasswordChange,
  onSubmit,
  hintUsername,
  hintPassword,
}: LoginFormProps) {
  return (
    <form
      className="grid gap-3 mt-4"
      onSubmit={onSubmit}
    >
      <label className="grid gap-1.5 text-sm font-semibold">
        <span>Username</span>
        <input
          type="text"
          value={username}
          onChange={(e) => onUsernameChange(e.target.value)}
          placeholder="Enter username"
          className="w-full border border-[#cad7ea] rounded-lg px-3 py-2.5"
        />
      </label>
      <label className="grid gap-1.5 text-sm font-semibold">
        <span>Password</span>
        <input
          type="password"
          value={password}
          onChange={(e) => onPasswordChange(e.target.value)}
          placeholder="Enter password"
          className="w-full border border-[#cad7ea] rounded-lg px-3 py-2.5"
        />
      </label>
      {error ? (
        <p className="m-0 text-[#b42318] text-sm font-semibold">{error}</p>
      ) : null}
      <button
        type="submit"
        className="border border-[#c4d2e8] rounded-lg py-2 px-3 bg-[#10233f] text-white font-semibold"
      >
        Unlock
      </button>
      {(hintUsername ?? hintPassword) && (
        <p className="mt-3.5 m-0 text-[#5f7087] text-[0.85rem]">
          Current login:{' '}
          {hintUsername != null && <strong>{hintUsername}</strong>}
          {hintUsername != null && hintPassword != null && ' / '}
          {hintPassword != null && <strong>{hintPassword}</strong>}
        </p>
      )}
    </form>
  )
}
