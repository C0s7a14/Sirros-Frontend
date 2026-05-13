import { Link, Outlet } from 'react-router-dom'

export function Layout() {
  return (
    <div className="min-h-screen bg-white">
      <div className="h-1 bg-[#30a8f2] w-full fixed top-0 left-0 z-50" />
      <header className="bg-[#091f33] px-8 py-0 flex items-center h-[85px] fixed top-1 left-0 right-0 z-40">
        <Link
          to="/"
          className="text-xl font-bold text-white hover:text-[#30a8f2] transition-colors duration-200"
          style={{ fontFamily: 'Raleway, sans-serif' }}
        >
          Sirros
        </Link>
      </header>
      <main className="pt-[86px]">
        <Outlet />
      </main>
    </div>
  )
}
