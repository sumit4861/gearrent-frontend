import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function Navbar() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  return (
    <nav style={styles.nav} className="navbar">
      <Link to="/" style={styles.logo}>⚙️ GearRent</Link>
      <div style={styles.links} className="navbar-links">
        {user ? (
          <>
            <span style={styles.username}>Hi, {user.name}</span>
            <Link to="/add-listing" style={styles.btn}>+ List Gear</Link>
            <Link to="/dashboard" style={styles.link}>Dashboard</Link>
            <button onClick={handleLogout} style={styles.logoutBtn}>Logout</button>
          </>
        ) : (
          <>
            <Link to="/login" style={styles.link}>Login</Link>
            <Link to="/register" style={styles.btn}>Sign Up</Link>
          </>
        )}
      </div>
    </nav>
  )
}

const styles = {
  nav: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '1rem 2rem',
    background: '#fff',
    borderBottom: '1px solid #e5e7eb',
    position: 'sticky',
    top: 0,
    zIndex: 100
  },
  logo: {
    fontSize: '1.4rem',
    fontWeight: '700',
    color: '#16a34a'
  },
  links: {
    display: 'flex',
    alignItems: 'center',
    gap: '1rem'
  },
  link: {
    color: '#374151',
    fontWeight: '500'
  },
  btn: {
    background: '#16a34a',
    color: '#fff',
    padding: '0.4rem 1rem',
    borderRadius: '8px',
    fontWeight: '500'
  },
  logoutBtn: {
    background: 'none',
    border: '1px solid #e5e7eb',
    padding: '0.4rem 1rem',
    borderRadius: '8px',
    cursor: 'pointer',
    color: '#374151',
    fontWeight: '500'
  },
  username: {
    color: '#6b7280',
    fontSize: '0.9rem'
  }
}