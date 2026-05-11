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

  if (isLoading) return <p className="p-8 text-gray-500">Carregando...</p>

  return (
    <div className="p-8 max-w-2xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-semibold text-gray-800">Treinamentos</h1>
        <button
          onClick={() => setShowForm((v) => !v)}
          className="bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-indigo-700"
        >
          {showForm ? 'Cancelar' : '+ Novo treinamento'}
        </button>
      </div>

      {showForm && (
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 mb-6 space-y-3">
          <input
            type="text"
            placeholder="Título"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300"
          />
          <input
            type="text"
            placeholder="Descrição"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300"
          />
          <button
            onClick={() => create()}
            disabled={isPending || !title.trim()}
            className="bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-indigo-700 disabled:opacity-50"
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
              className="block bg-white border border-gray-200 rounded-lg px-4 py-3 hover:border-indigo-400 transition"
            >
              <p className="font-medium text-gray-800">{t.title}</p>
              <p className="text-sm text-gray-500 mt-1">{t.description}</p>
            </Link>
          </li>
        ))}
        {trainings?.length === 0 && (
          <p className="text-gray-400 text-sm">Nenhum treinamento cadastrado.</p>
        )}
      </ul>
    </div>
  )
}
