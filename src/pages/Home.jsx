import {useState, useEffect} from 'react'
import {Link} from 'react-router-dom'
import api from '../api/axios'

const CATEGORIES = ['all', 'cycle', 'camera', 'tent', 'cricket', 'drone', 'music', 'sports', 'others']

export default function Home() {
  const [gear, setGear] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({category: 'all', maxPrice: '', search: ''})

  const fetchGear = async() => {
    setLoading(true)
    try {
      const params = {};
      if(filters.category !== 'all') params.category = filters.category
      if(filters.maxPrice) params.maxPrice = filters.maxPrice
      if(filters.search) params.search = filters.search
      
      const res = await api.get('/gear', {params})
      setGear(res.data)
    } catch(err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchGear()
  }, [filters.category])

  const handleSearch = (e) => {
    e.preventDefault()
    fetchGear()
  }
  return (
    <div style={styles.page}>
      <div style={styles.hero} className="hero">
        <h1 style={styles.heroTitle}> Rent gear from people near you</h1>
        <p style={styles.heroSub}>Cycles, cameras, tents, drones and more - without buying</p>

        {/* Search bar */}
        <form onSubmit={handleSearch} style={styles.searchRow} className="search-row">
          <input
            type="text"
            placeholder='Search gear...'
            value={filters.search}
            onChange={(e) => setFilters({...filters, search: e.target.value})}
            style={styles.searchInput}
          />
          <input
            type="number"
            placeholder='Max ₹/day'
            value={filters.maxPrice}
            onChange={(e) => setFilters({...filters, maxPrice: e.target.value})}
            style={{...styles.searchInput, width: '130px'}}
          />
          <button type='submit' style={styles.searchBtn}>Search</button>
        </form>
      </div>

      {/* Category filters */}
      <div style={styles.categories} className="categories">
        {CATEGORIES.map(cat => (
          <button
          key={cat}
          onClick={() => setFilters({...filters, category: cat})}
          style={{
            ...styles.catBtn,
            background: filters.category === cat ? '#16a34a' : '#fff',
            color: filters.category === cat ? '#fff' : '#374151',
            border: filters.category === cat ? '1px solid #16a34a' : '1px solid #e5e7eb'
          }}
        >
          {cat.charAt(0).toUpperCase() + cat.slice(1)}
        </button>
        ))}
      </div>

      {/* Gear grid */}
      <div style={styles.container} className="gear-grid">
        {loading ? (
          <p style={styles.msg}>Loading gear...</p>
        ) : gear.length === 0 ? (
          <p style={styles.msg}>No gear found. Try different filters.</p>
        ) : (
          <div style={styles.grid}>
            {gear.map(item => (
              <GearCard key={item._id} item={item} />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

function GearCard({item}) {
  return (
    <Link to={`/gear/${item._id}`} style={styles.card}>
      <div style={styles.imgWrapper}>
        {item.images?.[0] ? (
          <img src={item.images[0]} alt={item.title} style={styles.img} />
        ) : (
          <div style={styles.noImg}>No Image</div>
        )}
        <span style={styles.categoryBadge}>{item.category}</span>
      </div>
      <div style={styles.cardBody}>
        <h3 style={styles.carTitle}>{item.title}</h3>
        <p style={styles.cardLocation}>📍 {item.location}</p>
        <p style={styles.cardCondition}>Condition: {item.condition}</p>
        <div style={styles.cardFooter}>
          <span style={styles.price}>₹{item.pricePerDay}<span style={styles.perDay}>/day</span></span>
          <span style={styles.deposit}>Deposit: ₹{item.deposit}</span>
        </div>
      </div>
    </Link>
  )
}

const styles = {
  page: { minHeight: '100vh', background: '#f8f9fa' },
  hero: {
    background: 'linear-gradient(135deg, #16a34a, #15803d)',
    padding: '3rem 2rem',
    textAlign: 'center',
    color: '#fff'
  },
  heroTitle: { fontSize: '2.2rem', fontWeight: '700', marginBottom: '0.5rem' },
  heroSub: { fontSize: '1.1rem', opacity: 0.9, marginBottom: '1.5rem' },
  searchRow: {
    display: 'flex',
    gap: '0.5rem',
    justifyContent: 'center',
    flexWrap: 'wrap'
  },
  searchInput: {
    padding: '0.65rem 1rem',
    borderRadius: '8px',
    border: 'none',
    fontSize: '0.95rem',
    width: '250px',
    outline: 'none'
  },
  searchBtn: {
    background: '#fff',
    color: '#16a34a',
    border: 'none',
    padding: '0.65rem 1.5rem',
    borderRadius: '8px',
    fontWeight: '600',
    cursor: 'pointer',
    fontSize: '0.95rem'
  },
  categories: {
    display: 'flex',
    gap: '0.5rem',
    padding: '1.25rem 2rem',
    flexWrap: 'wrap',
    background: '#fff',
    borderBottom: '1px solid #e5e7eb'
  },
  catBtn: {
    padding: '0.4rem 1rem',
    borderRadius: '99px',
    cursor: 'pointer',
    fontWeight: '500',
    fontSize: '0.875rem'
  },
  container: { padding: '2rem' },
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
    gap: '1.5rem'
  },
  msg: { textAlign: 'center', color: '#6b7280', marginTop: '3rem', fontSize: '1rem' },
  card: {
    background: '#fff',
    borderRadius: '12px',
    overflow: 'hidden',
    boxShadow: '0 2px 12px rgba(0,0,0,0.07)',
    display: 'block',
    transition: 'transform 0.2s',
    cursor: 'pointer'
  },
  imgWrapper: { position: 'relative' },
  img: { width: '100%', height: '200px', objectFit: 'cover' },
  noImg: {
    width: '100%',
    height: '200px',
    background: '#f3f4f6',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: '#9ca3af'
  },
  categoryBadge: {
    position: 'absolute',
    top: '10px',
    left: '10px',
    background: '#16a34a',
    color: '#fff',
    padding: '2px 10px',
    borderRadius: '99px',
    fontSize: '0.75rem',
    fontWeight: '500',
    textTransform: 'capitalize'
  },
  cardBody: { padding: '1rem' },
  cardTitle: { fontSize: '1rem', fontWeight: '600', marginBottom: '0.3rem' },
  cardLocation: { fontSize: '0.85rem', color: '#6b7280', marginBottom: '0.25rem' },
  cardCondition: { fontSize: '0.85rem', color: '#6b7280', marginBottom: '0.75rem', textTransform: 'capitalize' },
  cardFooter: { display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
  price: { fontSize: '1.1rem', fontWeight: '700', color: '#16a34a' },
  perDay: { fontSize: '0.8rem', fontWeight: '400', color: '#6b7280' },
  deposit: { fontSize: '0.8rem', color: '#6b7280' }
}