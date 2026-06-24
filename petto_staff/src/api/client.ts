const API_BASE = 'http://localhost:5000/api'

function getHeaders() {
  const user = JSON.parse(localStorage.getItem('user') || 'null')
  return {
    'Content-Type': 'application/json',
    'x-user-id': user?.id || '',
    'x-role': user?.role || 'customer'
  }
}

export async function apiGet(path: string) {
  const res = await fetch(`${API_BASE}${path}`, {
    headers: getHeaders()
  })
  if (!res.ok) throw await res.json()
  return res.json()
}

export async function apiPost(path: string, body: any) {
  const res = await fetch(`${API_BASE}${path}`, {
    method: 'POST',
    headers: getHeaders(),
    body: JSON.stringify(body)
  })
  if (!res.ok) throw await res.json()
  return res.json()
}
