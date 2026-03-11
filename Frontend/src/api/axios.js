import axios from 'axios'

const API = axios.create({
  baseURL: 'http://localhost:3000/api' || 'http://10.11.24.134:5173/api',
  headers: {
    'ngrok-skip-browser-warning': true,
  },
})

export default API
