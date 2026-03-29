import { Outlet } from 'react-router'

function Layout() {
  return (
    <>
      <header>
        {/* Navbar à créer en Sprint 2 */}
      </header>
      <main>
        <Outlet />  {/* Ici s'affiche la page correspondant à la route */}
      </main>
      <footer>
        {/* Footer à créer en Sprint 5 (pages légales) */}
      </footer>
    </>
  )
}

export default Layout