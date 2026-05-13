import { useEffect, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import api from '../../lib/api'
import type { TokenResponse } from '../../types'

export function MagicLinkPage() {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const token = searchParams.get('token')
    if (!token) {
      setError('Link inválido.')
      return
    }
    api
      .get<TokenResponse>(`/auth/magic/verify?token=${token}`)
      .then(({ data }) => {
        localStorage.setItem('access_token', data.access_token)
        localStorage.setItem('refresh_token', data.refresh_token)
        navigate('/trainings', { replace: true })
      })
      .catch(() => setError('Link inválido ou expirado.'))
  }, [])

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#091f33] px-4">
      <div className="bg-white p-8 rounded-[20px] shadow-[0_4px_15px_rgba(0,0,0,0.4)] w-full max-w-sm text-center space-y-4">
        {!error ? (
          <>
            <div className="w-10 h-10 border-2 border-[#30a8f2] border-t-transparent rounded-full animate-spin mx-auto" />
            <p className="text-sm text-[#797979]">Verificando link...</p>
          </>
        ) : (
          <>
            <p className="text-sm text-red-500">{error}</p>
            <a
              href="/login"
              className="inline-block text-sm text-[#30a8f2] hover:underline font-medium"
            >
              Voltar ao login
            </a>
          </>
        )}
      </div>
    </div>
  )
}
