import axios from 'axios'

const API = axios.create({
  baseURL: 'http://192.168.1.83:3000/api',
  headers: {
    'ngrok-skip-browser-warning': true,
  },
})

export default API
