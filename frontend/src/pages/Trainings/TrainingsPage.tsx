import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Link } from 'react-router-dom'
import { trainingsService } from '../../services/trainings'

export function TrainingsPage() {
  const queryClient = useQueryClient()
  const [showForm, setShowForm] = useState(false)
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')

  const { data: trainings, isLoading } = useQuery({
    queryKey: ['trainings'],
    queryFn: trainingsService.list,
  })

  const { mutate: create, isPending } = useMutation({
    mutationFn: () => trainingsService.create({ title, description }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['trainings'] })
      setTitle('')
      setDescription('')
      setShowForm(false)
    },
  })

  if (isLoading) return <p className="p-8 text-[#797979]">Carregando...</p>

  return (
    <div className="p-8 max-w-2xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <h1
          className="text-2xl font-bold text-[#091f33]"
          style={{ fontFamily: 'Raleway, sans-serif' }}
        >
          Treinamentos
        </h1>
        <button
          onClick={() => setShowForm((v) => !v)}
          className="bg-[#30a8f2] text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-[#1a96e0] transition-colors duration-200"
        >
          {showForm ? 'Cancelar' : '+ Novo treinamento'}
        </button>
      </div>

      {showForm && (
        <div className="bg-[rgba(205,205,205,0.2)] border border-[#30a8f2]/30 rounded-[20px] p-5 mb-6 space-y-3">
          <input
            type="text"
            placeholder="Título"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full border border-[#30a8f2] bg-[#30a8f2]/10 rounded-[15px] px-4 py-2.5 text-sm text-[#333] focus:outline-none focus:ring-2 focus:ring-[#30a8f2]"
          />
          <input
            type="text"
            placeholder="Descrição"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full border border-[#30a8f2] bg-[#30a8f2]/10 rounded-[15px] px-4 py-2.5 text-sm text-[#333] focus:outline-none focus:ring-2 focus:ring-[#30a8f2]"
          />
          <button
            onClick={() => create()}
            disabled={isPending || !title.trim()}
            className="bg-[#30a8f2] text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-[#1a96e0] disabled:opacity-50 transition-colors duration-200"
          >
            {isPending ? 'Criando...' : 'Criar'}
          </button>
        </div>
      )}

      <ul className="space-y-3">
        {trainings?.map((t) => (
          <li key={t.id}>
            <Link
              to={`/trainings/${t.id}`}
              className="block bg-white border border-transparent rounded-[20px] px-5 py-4 shadow-[0_4px_15px_rgba(0,0,0,0.08)] hover:border-[#30a8f2] hover:shadow-[0_4px_15px_rgba(48,168,242,0.15)] transition-all duration-200"
            >
              <p className="font-semibold text-[#091f33]">{t.title}</p>
              <p className="text-sm text-[#797979] mt-1">{t.description}</p>
            </Link>
          </li>
        ))}
        {trainings?.length === 0 && (
          <p className="text-[#797979] text-sm">Nenhum treinamento cadastrado.</p>
        )}
      </ul>
    </div>
  )
}
