import { Link, Outlet } from 'react-router-dom'

export function Layout() {
  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200 px-8 py-4 flex items-center gap-4">
        <Link to="/" className="text-xl font-bold text-indigo-600 hover:opacity-80 transition">
          Sirros
        </Link>
      </header>
      <main>
        <Outlet />
      </main>
    </div>
  )
}
