import { useState } from 'react'
import { apiGet, apiPost } from './api/client'

export default function App() {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [data, setData] = useState<any>(null)

  async function login() {
    const res = await apiPost('/auth/login', { username, password })
    localStorage.setItem('user', JSON.stringify(res.user))
    setData(res)
  }

  async function load() {
    const [orders, products] = await Promise.all([
      apiGet('/orders'),
      apiGet('/products')
    ])
    setData({ orders, products })
  }

  return (
    <div style={{ padding: 20 }}>
      <h1>Petto Staff</h1>

      <input placeholder="username" onChange={e => setUsername(e.target.value)} />
      <input placeholder="password" type="password" onChange={e => setPassword(e.target.value)} />
      <button onClick={login}>Login</button>
      <button onClick={load}>Load Data</button>

      <pre>{JSON.stringify(data, null, 2)}</pre>
    </div>
  )
}