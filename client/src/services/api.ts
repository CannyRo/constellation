import axios from 'axios'

// const api = axios.create({
//   baseURL: import.meta.env.VITE_API_URL || 'http://localhost:3000',
//   withCredentials: true, // send automatically the httpOnly cookie
//   headers: {
//     'Content-Type': 'application/json',
//   },
// })

const api = axios.create({
  baseURL: '',
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
})

export default api