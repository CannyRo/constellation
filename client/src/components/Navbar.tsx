import { Link, NavLink } from 'react-router'
import { useAuth } from '../context/AuthContext'

export default function Navbar() {
  const { isAuthenticated, isAdmin, user, logout } = useAuth()

  return (
    <nav aria-label="Main navigation">
      <Link to="/">Constellation</Link>

      <ul role="list">
        <li>
          <NavLink
            to="/projects"
            className={({ isActive }) => isActive ? 'active' : ''}
            aria-current={undefined}
          >
            Projects
          </NavLink>
        </li>

        {isAuthenticated ? (
          <>
            <li>
              <NavLink
                to="/profile"
                className={({ isActive }) => isActive ? 'active' : ''}
              >
                {user?.username}
              </NavLink>
            </li>
            {isAdmin && (
              <li>
                <NavLink
                  to="/admin"
                  className={({ isActive }) => isActive ? 'active' : ''}
                >
                  Admin
                </NavLink>
              </li>
            )}
            <li>
              <button onClick={logout} type="button">
                Sign out
              </button>
            </li>
          </>
        ) : (
          <>
            <li>
              <NavLink to="/login">Sign in</NavLink>
            </li>
            <li>
              <NavLink to="/register">Sign up</NavLink>
            </li>
          </>
        )}
      </ul>
    </nav>
  )
}