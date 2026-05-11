import { useRef, useState } from 'react'
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
  const [uploadMsg, setUploadMsg] = useState<string | null>(null)
  const [question, setQuestion] = useState('')
  const [messages, setMessages] = useState<Message[]>([])
  const [asking, setAsking] = useState(false)

  const { data: training, isLoading } = useQuery({
    queryKey: ['training', id],
    queryFn: () => trainingsService.get(id!),
    enabled: !!id,
  })

  async function handleUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file || !id) return
    setUploading(true)
    setUploadMsg(null)
    try {
      await trainingsService.uploadDocument(id, file)
      setUploadMsg('PDF enviado! Processamento em andamento.')
    } catch {
      setUploadMsg('Erro ao enviar PDF.')
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

  if (isLoading) return <p className="p-8 text-gray-500">Carregando...</p>
  if (!training) return <p className="p-8 text-red-500">Treinamento não encontrado.</p>

  return (
    <div className="p-8 max-w-2xl mx-auto space-y-6">
      <button
        onClick={() => navigate('/trainings')}
        className="text-sm text-indigo-600 hover:underline mb-2 inline-block"
      >
        ← Treinamentos
      </button>
      <h1 className="text-2xl font-semibold text-gray-800">{training.title}</h1>
      <p className="text-gray-600">{training.description}</p>

      <div className="border border-dashed border-gray-300 rounded-lg p-6 text-center space-y-3">
        <p className="text-sm text-gray-500">Adicionar PDF ao treinamento</p>
        <input ref={fileRef} type="file" accept=".pdf" className="hidden" onChange={handleUpload} />
        <button
          onClick={() => fileRef.current?.click()}
          disabled={uploading}
          className="bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-indigo-700 disabled:opacity-50"
        >
          {uploading ? 'Enviando...' : 'Selecionar PDF'}
        </button>
        {uploadMsg && <p className="text-sm text-gray-600">{uploadMsg}</p>}
      </div>

      <div className="border border-gray-200 rounded-lg overflow-hidden">
        <div className="bg-gray-50 px-4 py-3 border-b border-gray-200">
          <h2 className="text-sm font-medium text-gray-700">Perguntar sobre o conteúdo</h2>
        </div>

        <div className="p-4 space-y-3 min-h-[120px] max-h-80 overflow-y-auto">
          {messages.length === 0 && (
            <p className="text-sm text-gray-400 text-center mt-8">
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
                    ? 'bg-indigo-600 text-white'
                    : 'bg-gray-100 text-gray-800'
                }`}
              >
                {msg.content}
              </div>
            </div>
          ))}
          {asking && (
            <div className="flex justify-start">
              <div className="bg-gray-100 text-gray-400 px-4 py-2 rounded-lg text-sm">
                Pensando...
              </div>
            </div>
          )}
        </div>

        <form onSubmit={handleAsk} className="border-t border-gray-200 p-3 flex gap-2">
          <input
            type="text"
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            placeholder="Digite sua pergunta..."
            disabled={asking}
            className="flex-1 text-sm border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-300 disabled:opacity-50"
          />
          <button
            type="submit"
            disabled={asking || !question.trim()}
            className="bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-indigo-700 disabled:opacity-50"
          >
            Enviar
          </button>
        </form>
      </div>
    </div>
  )
}
