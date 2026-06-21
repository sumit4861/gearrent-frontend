import {useState} from 'react'
import {Link, useNavigate} from 'react-router-dom'
import {useAuth} from '../context/AuthContext'
import api from '../api/axios'
import toast from 'react-hot-toast'

export default function Login() {
  const [form, setForm] = useState({email: '', password: ''})
  const [loading, setLoading] = useState(false)
  const {login} = useAuth()
  const navigate = useNavigate()

  const handleChange = (e) => {
    setForm({...form, [e.target.name]: e.target.value})
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    try{
      const res = await api.post('/auth/login', form)
      login(res.data.user, res.data.token)
      toast.success('Welcome back!')
      navigate('/')
    } catch(err) {
      toast.error(err.response?.data?.message || 'Login failed')
    } finally {
      setLoading(false)
    }
  }
  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <h2 style={styles.title}>Welcome back</h2>
        <p style={styles.sub}>Login to your GearRent account</p>
  
        <form onSubmit={handleSubmit} style={styles.form}>
          <div style={styles.field}>
            <label style={styles.label}>Email</label>
            <input 
              type="email"
              name="email"
              value={form.email}
              onChange={handleChange}
              placeholder="you@example.com"
              required
              style={styles.input}
            />
          </div>
          <div style={styles.field}>
            <label style={styles.label}>Password</label>
            <input
              type="password"
              name="password"
              value={form.password}
              onChange={handleChange}
              placeholder="••••••••"
              required
              style={styles.input}
            />
          </div>
          <button type="submit" disabled={loading} style={styles.btn}>
            {loading ? 'Logging in...' : 'Login'}
          </button>
        </form>
        <p style={styles.footer}>
          Don't have an account? <Link to="/register" style={styles.link}>Sign up</Link>
        </p>
      </div>
    </div>
  )
}


const styles = {
  container: {
    minHeight: '100vh',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    background: '#f8f9fa'
  },
  card: {
    background: '#fff',
    padding: '2.5rem',
    borderRadius: '16px',
    boxShadow: '0 4px 24px rgba(0,0,0,0.08)',
    width: '100%',
    maxWidth: '400px'
  },
  title: {
    fontSize: '1.6rem',
    fontWeight: '700',
    marginBottom: '0.25rem'
  },
  sub: {
    color: '#6b7280',
    marginBottom: '1.5rem',
    fontSize: '0.95rem'
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: '1rem'
  },
  field: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.4rem'
  },
  label: {
    fontSize: '0.875rem',
    fontWeight: '500',
    color: '#374151'
  },
  input: {
    padding: '0.65rem 1rem',
    borderRadius: '8px',
    border: '1px solid #e5e7eb',
    fontSize: '0.95rem',
    outline: 'none'
  },
  btn: {
    background: '#16a34a',
    color: '#fff',
    padding: '0.75rem',
    borderRadius: '8px',
    border: 'none',
    fontSize: '1rem',
    fontWeight: '600',
    cursor: 'pointer',
    marginTop: '0.5rem'
  },
  footer: {
    textAlign: 'center',
    marginTop: '1.25rem',
    fontSize: '0.9rem',
    color: '#6b7280'
  },
  link: {
    color: '#16a34a',
    fontWeight: '500'
  }
}