import { Routes, Route } from 'react-router'
import { AuthProvider } from './context/AuthContext'
import { ProtectedRoute, AdminRoute } from './components/ProtectedRoute'
import Layout from './components/Layout'
import Login from './pages/Login'
import Register from './pages/Register'

// Pages provisoires — juste un placeholder pour chaque route
function Home()     { return <h1>Home</h1> }
function Projects() { return <h1>Projects</h1> }
function Profile()  { return <h1>Profile</h1> }
function Admin()    { return <h1>Admin</h1> }
function NotFound() { return <h1>404 - Page not found</h1> }

function App() {
  return (
    <AuthProvider>
      <Routes>
        <Route element={<Layout />}>
          {/* Public */}
          <Route path="/"         element={<Home />} />
          <Route path="/projects" element={<Projects />} />
          <Route path="/projects/:id" element={<Projects />} />
          <Route path="/login"    element={<Login />} />
          <Route path="/register" element={<Register />} />

          {/* Protected (connected users) */}
          <Route element={<ProtectedRoute />}>
            <Route path="/profile" element={<Profile />} />
          </Route>

          {/* Admin */}
          <Route element={<AdminRoute />}>
            <Route path="/admin" element={<Admin />} />
          </Route>

          <Route path="*" element={<NotFound />} />
        </Route>
      </Routes>
    </AuthProvider>
  )
}

export default App