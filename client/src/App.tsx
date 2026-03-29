import { Routes, Route } from 'react-router'
import Layout from './components/Layout'

// Pages provisoires — juste un placeholder pour chaque route
function Home()     { return <h1>Home</h1> }
function Projects() { return <h1>Projects</h1> }
function Login()    { return <h1>Login</h1> }
function Register() { return <h1>Register</h1> }
function Profile()  { return <h1>Profile</h1> }
function Admin()    { return <h1>Admin</h1> }
function NotFound() { return <h1>404 - Page non trouvée</h1> }

function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route path="/"          element={<Home />} />
        <Route path="/projects"  element={<Projects />} />
        <Route path="/projects/:id" element={<Projects />} />
        <Route path="/login"     element={<Login />} />
        <Route path="/register"  element={<Register />} />
        <Route path="/profile"   element={<Profile />} />
        <Route path="/admin"     element={<Admin />} />
        <Route path="*"          element={<NotFound />} />
      </Route>
    </Routes>
  )
}

export default App