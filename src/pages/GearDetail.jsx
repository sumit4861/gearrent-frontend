import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import DatePicker from 'react-datepicker'
import 'react-datepicker/dist/react-datepicker.css'
import toast from 'react-hot-toast'
import api from '../api/axios'
import { useAuth } from '../context/AuthContext'

export default function GearDetail() {
  const { id } = useParams()
  const { user } = useAuth()
  const navigate = useNavigate()

  const [gear, setGear] = useState(null)
  const [reviews, setReviews] = useState([])
  const [avgRating, setAvgRating] = useState(0)
  const [blockedDates, setBlockedDates] = useState([])
  const [startDate, setStartDate] = useState(null)
  const [endDate, setEndDate] = useState(null)
  const [loading, setLoading] = useState(true)
  const [booking, setBooking] = useState(false)
  const [activeImg, setActiveImg] = useState(0)

  useEffect(() => {
    fetchGear()
    fetchReviews()
    fetchBlockedDates()
  }, [id])

  const fetchGear = async() => {
    try {
      const res = await api.get(`/gear/${id}`)
      setGear(res.data)
    } catch(err) {
      toast.error('Gear not found')
      navigate('/')
    } finally {
      setLoading(false)
    }
  }
  const fetchReviews = async () => {
    try {
      const res = await api.get(`/reviews/${id}`)
      setReviews(res.data.reviews)
      setAvgRating(res.data.avgRating)
    } catch(err) {
      console.error(err);
    }
  }

  const fetchBlockedDates = async () => {
    try {
      const res = await api.get(`/bookings/blocked/${id}`)

      const dates = []
      res.data.forEach(b => {
        const start = new Date(b.startDate)
        const end = new Date(b.endDate)
        for(let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
          dates.push(new Date(d))
        }
      })
      setBlockedDates(dates)
    } catch(err) {
      console.error(err)
    }
  }

  const totalDays = startDate && endDate
  ? Math.ceil((endDate - startDate) / (1000*60*60*24)) : 0

  const totalPrice = gear ? totalDays * gear.pricePerDay : 0

  const handleBooking = async () => {
    if(!user) {
      toast.error('Please login to book')
      navigate('/login')
      return
    }
    if (!startDate || !endDate) {
      toast.error('Please select dates')
      return
    }
    setBooking(true)
    try {
      await api.post('/bookings', {
        gearId: id,
        startDate,
        endDate
      })
      toast.success('Booking request sent!')
      setStartDate(null)
      setEndDate(null)
      fetchBlockedDates()
    } catch(err) {
      toast.error(err.response?.data?.message || 'Booking failed')
    } finally {
      setBooking(false)
    }
  }

  if(loading) return <p style={{padding: '2rem'}}>Loading...</p>
  if(!gear) return null

  const isOwner = user?._id === gear.owner?._id

  return (
    <div style={styles.page}>
      <div style={styles.container}>

        {/* Left — images + details */}
        <div style={styles.left}>
          {/* Image gallery */}
          <div style={styles.imgWrapper}>
            <img
              src={gear.images?.[activeImg] || ''}
              alt={gear.title}
              style={styles.mainImg}
            />
          </div>
          {gear.images?.length > 1 && (
            <div style={styles.thumbRow}>
              {gear.images.map((img, i) => (
                <img
                  key={i}
                  src={img}
                  alt=""
                  onClick={() => setActiveImg(i)}
                  style={{
                    ...styles.thumb,
                    border: activeImg === i ? '2px solid #16a34a' : '2px solid transparent'
                  }}
                />
              ))}
            </div>
          )}

          {/* Gear info */}
          <div style={styles.info}>
            <div style={styles.topRow}>
              <span style={styles.categoryBadge}>{gear.category}</span>
              <span style={styles.conditionBadge}>{gear.condition}</span>
            </div>
            <h1 style={styles.title}>{gear.title}</h1>
            <p style={styles.location}>📍 {gear.location}</p>

            {avgRating > 0 && (
              <p style={styles.rating}>
                {'⭐'.repeat(Math.round(avgRating))} {avgRating} ({reviews.length} reviews)
              </p>
            )}

            <p style={styles.description}>{gear.description}</p>

            <div style={styles.ownerBox}>
              <div style={styles.ownerAvatar}>
                {gear.owner?.name?.charAt(0).toUpperCase()}
              </div>
              <div>
                <p style={styles.ownerLabel}>Listed by</p>
                <p style={styles.ownerName}>{gear.owner?.name}</p>
                <p style={styles.ownerLocation}>📍 {gear.owner?.location}</p>
              </div>
            </div>
          </div>

          {/* Reviews */}
          {reviews.length > 0 && (
            <div style={styles.reviewsSection}>
              <h3 style={styles.reviewsTitle}>Reviews ({reviews.length})</h3>
              {reviews.map(r => (
                <div key={r._id} style={styles.reviewCard}>
                  <div style={styles.reviewTop}>
                    <span style={styles.reviewerName}>{r.reviewer?.name}</span>
                    <span style={styles.reviewRating}>{'⭐'.repeat(r.rating)}</span>
                  </div>
                  <p style={styles.reviewComment}>{r.comment}</p>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Right — booking card */}
        <div style={styles.right}>
          <div style={styles.bookingCard}>
            <div style={styles.priceRow}>
              <span style={styles.price}>₹{gear.pricePerDay}</span>
              <span style={styles.perDay}>/day</span>
            </div>
            <p style={styles.depositText}>Deposit: ₹{gear.deposit}</p>

            {isOwner ? (
              <div style={styles.ownerMsg}>
                You own this listing
              </div>
            ) : (
              <>
                <div style={styles.dateSection}>
                  <label style={styles.dateLabel}>Select Dates</label>
                  <DatePicker
                    selected={startDate}
                    onChange={(dates) => {
                      const [start, end] = dates
                      setStartDate(start)
                      setEndDate(end)
                    }}
                    startDate={startDate}
                    endDate={endDate}
                    selectsRange
                    minDate={new Date()}
                    excludeDates={blockedDates}
                    inline
                    calendarClassName="gear-calendar"
                  />
                </div>

                {totalDays > 0 && (
                  <div style={styles.summary}>
                    <div style={styles.summaryRow}>
                      <span>₹{gear.pricePerDay} × {totalDays} days</span>
                      <span>₹{totalPrice}</span>
                    </div>
                    <div style={styles.summaryRow}>
                      <span>Deposit</span>
                      <span>₹{gear.deposit}</span>
                    </div>
                    <div style={{ ...styles.summaryRow, fontWeight: '700', borderTop: '1px solid #e5e7eb', paddingTop: '0.5rem' }}>
                      <span>Total</span>
                      <span>₹{totalPrice + gear.deposit}</span>
                    </div>
                  </div>
                )}

                <button
                  onClick={handleBooking}
                  disabled={booking || !startDate || !endDate}
                  style={{
                    ...styles.bookBtn,
                    opacity: !startDate || !endDate ? 0.6 : 1
                  }}
                >
                  {booking ? 'Sending request...' : 'Request to Book'}
                </button>
                <p style={styles.bookNote}>You won't be charged yet. Owner will approve your request.</p>
              </>
            )}
          </div>
        </div>

      </div>
    </div>
  )
}

const styles = {
  page: { background: '#f8f9fa', minHeight: '100vh', padding: '2rem' },
  container: {
    maxWidth: '1100px',
    margin: '0 auto',
    display: 'grid',
    gridTemplateColumns: '1fr 380px',
    gap: '2rem',
    alignItems: 'start'
  },
  left: { display: 'flex', flexDirection: 'column', gap: '1.5rem' },
  imgWrapper: { borderRadius: '12px', overflow: 'hidden' },
  mainImg: { width: '100%', height: '420px', objectFit: 'cover' },
  thumbRow: { display: 'flex', gap: '0.5rem' },
  thumb: { width: '80px', height: '60px', objectFit: 'cover', borderRadius: '6px', cursor: 'pointer' },
  info: { background: '#fff', borderRadius: '12px', padding: '1.5rem' },
  topRow: { display: 'flex', gap: '0.5rem', marginBottom: '0.75rem' },
  categoryBadge: {
    background: '#dcfce7', color: '#16a34a',
    padding: '2px 10px', borderRadius: '99px', fontSize: '0.8rem', fontWeight: '500', textTransform: 'capitalize'
  },
  conditionBadge: {
    background: '#f3f4f6', color: '#374151',
    padding: '2px 10px', borderRadius: '99px', fontSize: '0.8rem', fontWeight: '500', textTransform: 'capitalize'
  },
  title: { fontSize: '1.75rem', fontWeight: '700', marginBottom: '0.5rem' },
  location: { color: '#6b7280', fontSize: '0.95rem', marginBottom: '0.5rem' },
  rating: { fontSize: '0.95rem', marginBottom: '1rem', color: '#374151' },
  description: { color: '#4b5563', lineHeight: '1.7', fontSize: '0.95rem', marginBottom: '1.5rem' },
  ownerBox: {
    display: 'flex', alignItems: 'center', gap: '1rem',
    background: '#f9fafb', padding: '1rem', borderRadius: '10px'
  },
  ownerAvatar: {
    width: '44px', height: '44px', borderRadius: '50%',
    background: '#16a34a', color: '#fff',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    fontSize: '1.2rem', fontWeight: '700'
  },
  ownerLabel: { fontSize: '0.75rem', color: '#9ca3af' },
  ownerName: { fontWeight: '600', fontSize: '0.95rem' },
  ownerLocation: { fontSize: '0.8rem', color: '#6b7280' },
  reviewsSection: { background: '#fff', borderRadius: '12px', padding: '1.5rem' },
  reviewsTitle: { fontSize: '1.1rem', fontWeight: '600', marginBottom: '1rem' },
  reviewCard: { borderBottom: '1px solid #f3f4f6', paddingBottom: '1rem', marginBottom: '1rem' },
  reviewTop: { display: 'flex', justifyContent: 'space-between', marginBottom: '0.25rem' },
  reviewerName: { fontWeight: '600', fontSize: '0.9rem' },
  reviewRating: { fontSize: '0.85rem' },
  reviewComment: { color: '#4b5563', fontSize: '0.9rem', lineHeight: '1.6' },
  right: { position: 'sticky', top: '80px' },
  bookingCard: {
    background: '#fff', borderRadius: '16px',
    padding: '1.5rem', boxShadow: '0 4px 24px rgba(0,0,0,0.1)'
  },
  priceRow: { display: 'flex', alignItems: 'baseline', gap: '0.25rem', marginBottom: '0.25rem' },
  price: { fontSize: '1.75rem', fontWeight: '700', color: '#16a34a' },
  perDay: { color: '#6b7280', fontSize: '0.9rem' },
  depositText: { color: '#6b7280', fontSize: '0.85rem', marginBottom: '1.25rem' },
  ownerMsg: {
    background: '#f3f4f6', padding: '1rem', borderRadius: '8px',
    textAlign: 'center', color: '#6b7280', fontSize: '0.9rem'
  },
  dateSection: { marginBottom: '1rem' },
  dateLabel: { fontSize: '0.875rem', fontWeight: '500', color: '#374151', display: 'block', marginBottom: '0.5rem' },
  summary: { background: '#f9fafb', borderRadius: '8px', padding: '1rem', marginBottom: '1rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' },
  summaryRow: { display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem', color: '#374151' },
  bookBtn: {
    width: '100%', background: '#16a34a', color: '#fff',
    border: 'none', padding: '0.85rem', borderRadius: '10px',
    fontSize: '1rem', fontWeight: '600', cursor: 'pointer', marginBottom: '0.75rem'
  },
  bookNote: { fontSize: '0.8rem', color: '#9ca3af', textAlign: 'center' }
}