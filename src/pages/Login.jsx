import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/useAuth'

export default function Login() {
  const { login } = useAuth()
  const nav = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [remember, setRemember] = useState(false)

  const onSubmit = (e) => {
    e.preventDefault()
    setError('')
    const ok = login(email, password)
    if (ok) {
      if (remember) {
        try {
          localStorage.setItem('geo_last_user', email)
        } catch {
          /* noop */
        }
      }
      nav('/')
    }
    else setError('Credenciais inválidas')
  }
  const loginRapido = (e, p) => {
    setEmail(e)
    setPassword(p)
    setTimeout(() => onSubmit(new Event('submit')), 0)
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-100 p-4">
      <div className="w-full max-w-md bg-white shadow rounded p-6 space-y-4">
        <h1 className="text-2xl font-semibold text-slate-800">GeoIntel RJ</h1>
        <p className="text-slate-500 text-sm">Portal de acesso</p>
        <form onSubmit={onSubmit} className="space-y-3">
          <div>
            <label className="block text-sm text-slate-600">E-mail</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="mt-1 w-full rounded border border-slate-300 p-2"
              placeholder="user@email.com"
            />
          </div>
          <div>
            <label className="block text-sm text-slate-600">Senha</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="mt-1 w-full rounded border border-slate-300 p-2"
              placeholder="••••••••"
            />
          </div>
          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" checked={remember} onChange={(e)=>setRemember(e.target.checked)} />
            Lembrar-me neste dispositivo
          </label>
          {error ? <div className="text-sm text-red-600">{error}</div> : null}
          <button className="w-full bg-blue-600 hover:bg-blue-700 text-white rounded p-2">
            Entrar
          </button>
        </form>
        <div className="text-xs text-slate-500">Acesso de exemplo:</div>
        <div className="grid grid-cols-2 gap-2">
          <button className="border rounded p-2 text-sm" onClick={()=>loginRapido('user1@email.com','123456')}>
            Entrar como Analista
          </button>
          <button className="border rounded p-2 text-sm" onClick={()=>loginRapido('user1@email.com','123456')}>
            Entrar como Coordenador
          </button>
        </div>
      </div>
    </div>
  )
}
