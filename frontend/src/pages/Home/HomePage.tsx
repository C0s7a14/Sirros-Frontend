import { Link } from 'react-router-dom'

export function HomePage() {
  return (
    <div className="min-h-screen bg-[#091f33] flex flex-col items-center justify-center text-center px-4">
      <h1 className="text-5xl font-extrabold text-white mb-3" style={{ fontFamily: 'Raleway, sans-serif' }}>
        Sirros <span className="text-[#30a8f2]">Treinamentos</span>
      </h1>
      <p className="text-white/70 text-lg mb-10 font-light">
        Plataforma de treinamentos baseada em PDFs
      </p>
      <Link
        to="/trainings"
        className="bg-[#30a8f2] text-white px-8 py-3 rounded-lg text-sm font-semibold hover:bg-[#1a96e0] transition-colors duration-200"
      >
        Ver treinamentos
      </Link>
    </div>
  )
}
