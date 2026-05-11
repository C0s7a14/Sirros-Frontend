import { Link } from 'react-router-dom'

export function HomePage() {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center text-center px-4">
      <h1 className="text-5xl font-bold text-indigo-600 mb-3">Sirros</h1>
      <p className="text-gray-500 text-lg mb-8">Plataforma de treinamentos baseada em PDFs</p>
      <Link
        to="/trainings"
        className="bg-indigo-600 text-white px-6 py-3 rounded-lg text-sm font-medium hover:bg-indigo-700 transition"
      >
        Ver treinamentos
      </Link>
    </div>
  )
}
