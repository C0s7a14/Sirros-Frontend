import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../hooks/useAuth'
import api from '../../lib/api'

type Tab = 'login' | 'register'

export function LoginPage() {
  const [tab, setTab] = useState<Tab>('login')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [magicEmail, setMagicEmail] = useState('')
  const [magicLoading, setMagicLoading] = useState(false)
  const [magicUrl, setMagicUrl] = useState<string | null>(null)
  const [magicError, setMagicError] = useState<string | null>(null)
  const { login, loading, error } = useAuth()
  const navigate = useNavigate()

  async function handleLogin(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const ok = await login(email, password)
    if (ok) navigate('/trainings')
  }

  async function handleMagicRequest(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setMagicLoading(true)
    setMagicError(null)
    setMagicUrl(null)
    try {
      const { data } = await api.post('/auth/magic/request', { email: magicEmail })
      setMagicUrl(data.magic_url)
    } catch {
      setMagicError('Erro ao enviar o link. Tente novamente.')
    } finally {
      setMagicLoading(false)
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
          <div className="space-y-4">
            {!magicUrl ? (
              <form onSubmit={handleMagicRequest} className="space-y-4">
                <p className="text-sm text-[#797979]">
                  Informe seu e-mail e enviaremos um link de acesso.
                </p>
                {magicError && <p className="text-red-500 text-sm">{magicError}</p>}
                <div className="space-y-1">
                  <label className="text-sm font-medium text-[#333]">E-mail</label>
                  <input
                    type="email"
                    value={magicEmail}
                    onChange={(e) => setMagicEmail(e.target.value)}
                    className="w-full border border-[#30a8f2] bg-[#30a8f2]/10 rounded-[15px] px-4 py-2.5 text-sm text-[#333] focus:outline-none focus:ring-2 focus:ring-[#30a8f2]"
                    required
                  />
                </div>
                <button
                  type="submit"
                  disabled={magicLoading}
                  className="w-full bg-[#30a8f2] text-white py-2.5 rounded-lg text-sm font-semibold hover:bg-[#1a96e0] disabled:opacity-50 transition-colors duration-200"
                >
                  {magicLoading ? 'Enviando...' : 'Enviar link mágico'}
                </button>
              </form>
            ) : (
              <div className="space-y-4 text-center">
                <div className="w-12 h-12 rounded-full bg-[#30a8f2]/10 flex items-center justify-center mx-auto">
                  <svg className="w-6 h-6 text-[#30a8f2]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                </div>
                <p className="text-sm font-medium text-[#333]">Link enviado!</p>
                <p className="text-xs text-[#797979]">Verifique seu e-mail para acessar.</p>
                <a
                  href={magicUrl}
                  className="block w-full bg-[#30a8f2] text-white py-2.5 rounded-lg text-sm font-semibold hover:bg-[#1a96e0] transition-colors duration-200 text-center"
                >
                  Abrir link de acesso
                </a>
                <button
                  onClick={() => { setMagicUrl(null); setMagicEmail('') }}
                  className="text-xs text-[#797979] hover:text-[#333] transition-colors"
                >
                  Enviar novamente
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
