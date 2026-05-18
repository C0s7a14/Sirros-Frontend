import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../hooks/useAuth'
import api from '../../lib/api'
import type { TokenResponse } from '../../types'

type Tab = 'login' | 'register'

export function LoginPage() {
  const [tab, setTab] = useState<Tab>('login')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [regEmail, setRegEmail] = useState('')
  const [regPassword, setRegPassword] = useState('')
  const [regLoading, setRegLoading] = useState(false)
  const [regError, setRegError] = useState<string | null>(null)
  const { login, loading, error } = useAuth()
  const navigate = useNavigate()

  async function handleLogin(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const ok = await login(email, password)
    if (ok) navigate('/trainings')
  }

  async function handleRegister(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setRegLoading(true)
    setRegError(null)
    try {
      const { data } = await api.post<TokenResponse>('/auth/register', {
        email: regEmail,
        password: regPassword,
      })
      localStorage.setItem('access_token', data.access_token)
      localStorage.setItem('refresh_token', data.refresh_token)
      navigate('/trainings')
    } catch (err: unknown) {
      const status = (err as { response?: { status?: number } })?.response?.status
      if (status === 409) {
        setRegError('E-mail já cadastrado.')
      } else {
        setRegError('Erro ao criar conta. Tente novamente.')
      }
    } finally {
      setRegLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#091f33] px-4">
      <div className="bg-white p-8 rounded-[20px] shadow-[0_4px_15px_rgba(0,0,0,0.4)] w-full max-w-sm space-y-5">
        <h1
          className="text-2xl font-bold text-[#091f33]"
          style={{ fontFamily: 'Raleway, sans-serif' }}
        >
          Sirros
        </h1>

        <div className="flex border-b border-gray-100">
          <button
            onClick={() => setTab('login')}
            className={`flex-1 pb-2 text-sm font-semibold transition-colors duration-200 ${
              tab === 'login'
                ? 'text-[#30a8f2] border-b-2 border-[#30a8f2]'
                : 'text-[#797979] hover:text-[#333]'
            }`}
          >
            Entrar
          </button>
          <button
            onClick={() => setTab('register')}
            className={`flex-1 pb-2 text-sm font-semibold transition-colors duration-200 ${
              tab === 'register'
                ? 'text-[#30a8f2] border-b-2 border-[#30a8f2]'
                : 'text-[#797979] hover:text-[#333]'
            }`}
          >
            Criar conta
          </button>
        </div>

        {tab === 'login' && (
          <form onSubmit={handleLogin} className="space-y-4">
            {error && <p className="text-red-500 text-sm">{error}</p>}
            <div className="space-y-1">
              <label className="text-sm font-medium text-[#333]">E-mail</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full border border-[#30a8f2] bg-[#30a8f2]/10 rounded-[15px] px-4 py-2.5 text-sm text-[#333] focus:outline-none focus:ring-2 focus:ring-[#30a8f2]"
                required
              />
            </div>
            <div className="space-y-1">
              <label className="text-sm font-medium text-[#333]">Senha</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full border border-[#30a8f2] bg-[#30a8f2]/10 rounded-[15px] px-4 py-2.5 text-sm text-[#333] focus:outline-none focus:ring-2 focus:ring-[#30a8f2]"
                required
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-[#30a8f2] text-white py-2.5 rounded-lg text-sm font-semibold hover:bg-[#1a96e0] disabled:opacity-50 transition-colors duration-200"
            >
              {loading ? 'Entrando...' : 'Entrar'}
            </button>
          </form>
        )}

        {tab === 'register' && (
          <form onSubmit={handleRegister} className="space-y-4">
            {regError && <p className="text-red-500 text-sm">{regError}</p>}
            <div className="space-y-1">
              <label className="text-sm font-medium text-[#333]">E-mail</label>
              <input
                type="email"
                value={regEmail}
                onChange={(e) => setRegEmail(e.target.value)}
                className="w-full border border-[#30a8f2] bg-[#30a8f2]/10 rounded-[15px] px-4 py-2.5 text-sm text-[#333] focus:outline-none focus:ring-2 focus:ring-[#30a8f2]"
                required
              />
            </div>
            <div className="space-y-1">
              <label className="text-sm font-medium text-[#333]">Senha</label>
              <input
                type="password"
                value={regPassword}
                onChange={(e) => setRegPassword(e.target.value)}
                className="w-full border border-[#30a8f2] bg-[#30a8f2]/10 rounded-[15px] px-4 py-2.5 text-sm text-[#333] focus:outline-none focus:ring-2 focus:ring-[#30a8f2]"
                required
                minLength={6}
              />
            </div>
            <button
              type="submit"
              disabled={regLoading}
              className="w-full bg-[#30a8f2] text-white py-2.5 rounded-lg text-sm font-semibold hover:bg-[#1a96e0] disabled:opacity-50 transition-colors duration-200"
            >
              {regLoading ? 'Criando conta...' : 'Criar conta'}
            </button>
          </form>
        )}
      </div>
    </div>
  )
}
