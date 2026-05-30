import { useRef, useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { trainingsService } from '../../services/trainings'
import type { AskResponse } from '../../types'

interface Message {
  role: 'user' | 'assistant'
  content: string
}

export function TrainingPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const fileRef = useRef<HTMLInputElement>(null)
  const [uploading, setUploading] = useState(false)
  const [processingDocId, setProcessingDocId] = useState<string | null>(null)
  const [pdfReady, setPdfReady] = useState(false)
  const [question, setQuestion] = useState('')
  const [messages, setMessages] = useState<Message[]>([])
  const [asking, setAsking] = useState(false)

  const { data: training, isLoading } = useQuery({
    queryKey: ['training', id],
    queryFn: () => trainingsService.get(id!),
    enabled: !!id,
  })

  useEffect(() => {
    if (!processingDocId) return
    const interval = setInterval(async () => {
      try {
        const doc = await trainingsService.getDocument(processingDocId)
        if (doc.status === 'done') {
          setPdfReady(true)
          setProcessingDocId(null)
          clearInterval(interval)
        }
      } catch {
        clearInterval(interval)
      }
    }, 2000)
    return () => clearInterval(interval)
  }, [processingDocId])

  async function handleUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file || !id) return
    setUploading(true)
    setPdfReady(false)
    try {
      const doc = await trainingsService.uploadDocument(id, file)
      setProcessingDocId(doc.id)
    } catch {
      setProcessingDocId(null)
    } finally {
      setUploading(false)
    }
  }

  async function handleAsk(e: React.FormEvent) {
    e.preventDefault()
    if (!question.trim() || !id) return
    const userQuestion = question.trim()
    setQuestion('')
    setMessages((prev) => [...prev, { role: 'user', content: userQuestion }])
    setAsking(true)
    try {
      const res: AskResponse = await trainingsService.ask(id, userQuestion)
      setMessages((prev) => [...prev, { role: 'assistant', content: res.answer }])
    } catch {
      setMessages((prev) => [...prev, { role: 'assistant', content: 'Erro ao obter resposta.' }])
    } finally {
      setAsking(false)
    }
  }

  if (isLoading) return <p className="p-8 text-[#797979]">Carregando...</p>
  if (!training) return <p className="p-8 text-red-500">Treinamento não encontrado.</p>

  return (
    <div className="p-8 max-w-2xl mx-auto space-y-6">
      <button
        onClick={() => navigate('/trainings')}
        className="text-sm text-[#30a8f2] hover:underline mb-2 inline-block font-medium"
      >
        ← Treinamentos
      </button>

      <h1
        className="text-2xl font-bold text-[#091f33]"
        style={{ fontFamily: 'Raleway, sans-serif' }}
      >
        {training.title}
      </h1>
      <p className="text-[#797979]">{training.description}</p>

      <div className="border-2 border-dashed border-[#30a8f2]/50 bg-[#30a8f2]/5 rounded-[20px] p-6 text-center space-y-3">
        <p className="text-sm text-[#797979]">Adicionar PDF ao treinamento</p>
        <input ref={fileRef} type="file" accept=".pdf" className="hidden" onChange={handleUpload} />
        <button
          onClick={() => fileRef.current?.click()}
          disabled={uploading}
          className="bg-[#30a8f2] text-white px-5 py-2 rounded-lg text-sm font-semibold hover:bg-[#1a96e0] disabled:opacity-50 transition-colors duration-200"
        >
          {uploading ? 'Enviando...' : 'Selecionar PDF'}
        </button>
        {processingDocId && (
          <div className="flex items-center gap-2 text-sm text-yellow-700 bg-yellow-50 border border-yellow-200 rounded-lg px-3 py-2">
            <svg className="animate-spin h-4 w-4 text-yellow-600" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
            </svg>
            Processando PDF, aguarde...
          </div>
        )}
        {pdfReady && (
          <div className="flex items-center gap-2 text-sm text-green-700 bg-green-50 border border-green-200 rounded-lg px-3 py-2">
            ✓ PDF processado! Você já pode fazer perguntas.
          </div>
        )}
      </div>

      <div className="bg-white rounded-[20px] shadow-[0_4px_15px_rgba(0,0,0,0.08)] overflow-hidden">
        <div className="bg-[#091f33] px-5 py-3">
          <h2 className="text-sm font-semibold text-white">Perguntar sobre o conteúdo</h2>
        </div>

        <div className="p-4 space-y-3 min-h-[120px] max-h-80 overflow-y-auto">
          {messages.length === 0 && (
            <p className="text-sm text-[#797979] text-center mt-8">
              Faça uma pergunta sobre o PDF enviado.
            </p>
          )}
          {messages.map((msg, i) => (
            <div
              key={i}
              className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-[80%] px-4 py-2 rounded-lg text-sm ${
                  msg.role === 'user'
                    ? 'bg-[#30a8f2] text-white'
                    : 'bg-gray-100 text-[#333]'
                }`}
              >
                {msg.content}
              </div>
            </div>
          ))}
          {asking && (
            <div className="flex justify-start">
              <div className="bg-gray-100 text-[#797979] px-4 py-2 rounded-lg text-sm">
                Pensando...
              </div>
            </div>
          )}
        </div>

        <form onSubmit={handleAsk} className="border-t border-gray-100 p-3 flex gap-2">
          <input
            type="text"
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            placeholder="Digite sua pergunta..."
            disabled={asking}
            className="flex-1 text-sm border border-[#30a8f2]/40 rounded-[15px] px-4 py-2 focus:outline-none focus:ring-2 focus:ring-[#30a8f2] disabled:opacity-50"
          />
          <button
            type="submit"
            disabled={asking || !question.trim()}
            className="bg-[#30a8f2] text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-[#1a96e0] disabled:opacity-50 transition-colors duration-200"
          >
            Enviar
          </button>
        </form>
      </div>
    </div>
  )
}
