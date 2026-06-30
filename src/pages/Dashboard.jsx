import {useState, useEffect} from 'react'
import {Link} from 'react-router-dom'
import api from '../api/axios'
import toast from 'react-hot-toast'
import {useAuth} from '../context/AuthContext'

export default function Dashboard() {
  const { user, loading: authLoading } = useAuth()
  const [tab, setTab] = useState('myListings')
  const [myListings, setMyListings] = useState([])
  const [ownerBookings, setOwnerBookings] = useState([])
  const [myBookings, setMyBookings] = useState([])
  const [loading, setLoading] = useState(true)
  const [reviewModal, setReviewModal] = useState(null)
  const [rating, setRating] = useState(5)
  const [comment, setComment] = useState('')
  const [submittingReview, setSubmittingReview] = useState(false)


  useEffect(() => {
    if (!authLoading && user) {
      fetchAll()
    }
  }, [authLoading, user])
  
  const fetchAll = async () => {
    setLoading(true) 
    try {
      const [listingsRes, ownerBookingsRes, myBookingsRes] = await Promise.all([
        api.get('/gear'),
        api.get('/bookings/owner'),
        api.get('/bookings/my')
      ])
      setMyListings(listingsRes.data.filter(g => g.owner._id === user._id))
      setOwnerBookings(ownerBookingsRes.data)
      setMyBookings(myBookingsRes.data)
    } catch(err) {
      console.error('Dashboard fetch error:', err)
      toast.error('Failed to load dashboard')
    } finally {
      setLoading(false)
    }
  }

  const handleApprove = async (id) => {
    try {
      await api.patch(`/bookings/${id}/approve`)
      toast.success('Booking approved!')
      fetchAll()
    } catch(err) {
      toast.error(err.response?.data?.message || 'Failed to approve')
    } 
  }

  const handleReject = async (id) => {
    try {
      await api.patch(`/bookings/${id}/reject`)
      toast.success('Booking rejected!')
      fetchAll()
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to reject')
    }
  }

  const handleComplete = async (id) => {
    try {
      await api.patch(`/bookings/${id}/complete`)
      toast.success('Marked as completed!')
      fetchAll()
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to complete')
    }
  }

  const handleDelete = async (id) => {
    if(!window.confirm('Delete this listing')) return 
    try {
      await api.delete(`/gear/${id}`)
      toast.success('Listing deleted!')
      fetchAll()
    } catch (err) {
      toast.error('Failed to delete')
    }
  }

  const statusColor = (status) => {
    if (status === 'pending') return '#f59e0b'
    if (status === 'approved') return '#16a34a'
    if (status === 'rejected') return '#ef4444'
    if (status === 'completed') return '#6b7280'
    return '#374151'
  }

  const handleSubmitReview = async () => {
    if(!comment.trim()) {
      toast.error('Please write a comment')
      return
    }

    setSubmittingReview(true)
    try {
      await api.post('/reviews', {
        gearId: reviewModal.gear._id,
        bookingId: reviewModal._id,
        rating,
        comment
      })

      toast.success('Review submitted')
      setReviewModal(null)
      setRating(5)
      setComment('')
      fetchAll()
    } catch(err) {
      toast.error(err.response?.data?.message || 'Failed to submit review')
    } finally {
      setSubmittingReview(false)
    }
  }
  if(loading) return <p style={{padding: '2rem'}}>Loading dashboard...</p>

  return (
    <div style={styles.page}>
      <div style={styles.container}>
        <h2 style={styles.title}>Dashboard</h2>
        <p style={styles.sub}>Welcome back, {user?.name}</p>

        {/* Tabs */}
        <div style={styles.tabs}>
          {[
            {key: 'myListings', label: `My Listings (${myListings.length})` },
            {key: 'ownerBookings', label: `Booking Requests (${ownerBookings.length})`},
            {key: 'myBookings', label: `My Rentals (${myBookings.length})` }
          ].map(t => (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              style={{
                ...styles.tab,
                borderBottom: tab === t.key ? '2px solid #16a34a' : '2px solid transparent',
                color: tab === t.key ? '#16a34a' : '#6b7280',
                fontWeight: tab === t.key ? '600' : '400'
              }}
            > {t.label}</button>
          ))}
        </div>
        
        {/* My Listings */}
        {tab === 'myListings' && (
          <div>
            <div style={{display: 'flex', justifyContent: 'flex-end', marginBottom: '1rem'}}>
              <Link to="/add-listing" style={styles.addBtn}>+ Add New Listing</Link>
            </div>
            {myListings.length === 0 ? (
              <p style={styles.empty}>You haven't lsited any gear yet.</p>
              ) : (
                <div style={styles.listingGrid}>
                  {myListings.map(gear => (
                    <div key={gear._id} style={styles.listingCard}>
                      <img
                        src={gear.images?.[0]}
                        alt={gear.title}
                        style={styles.listingImg}
                      />
                      <div style={styles.listingInfo}>
                        <h3 style={styles.listingTitle}>{gear.title}</h3>
                        <p style={styles.listingMeta}>📍 {gear.location}</p>
                        <p style={styles.listingMeta}>₹{gear.pricePerDay}/day · Deposit ₹{gear.deposit}</p>
                        <span style={{
                          ...styles.badge,
                          background: gear.isAvailable ? '#dcfce7' : '#fee2e2',
                          color: gear.isAvailable ? '#16a34a' : '#ef4444'
                        }}>
                          {gear.isAvailable ? 'Available' : 'Unavailable'}
                        </span>
                      </div>
                      <div style={styles.listingActions}>
                        <Link to={`/gear/${gear._id}`} style={styles.viewBtn}>View</Link>
                        <button onClick={() => handleDelete(gear._id)} style={styles.deleteBtn}>Delete</button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
          </div>
        )}

        {/* Owner Booking Requests */}
        {tab === 'ownerBookings' && (
          <div>
            {ownerBookings.length === 0 ? (
              <p style={styles.empty}>No booking requests yet.</p>
            ) : (
              <div style={styles.bookingList}>
                {ownerBookings.map(b => (
                  <div key={b._id} style={styles.bookingCard}>
                    <div style={styles.bookingLeft}>
                      <img src={b.gear?.images?.[0]} alt="" style={styles.bookingImg} />
                      <div>
                        <h4 style={styles.bookingGear}>{b.gear?.title}</h4>
                        <p style={styles.bookingMeta}>Renter: {b.renter?.name} ({b.renter?.email})</p>
                        <p style={styles.bookingMeta}>
                          {new Date(b.startDate).toLocaleDateString()} → {new Date(b.endDate).toLocaleDateString()}
                        </p>
                        <p style={styles.bookingMeta}>{b.totalDays} days · ₹{b.totalPrice} + ₹{b.deposit} deposit</p>
                        <span style={{ ...styles.badge, background: '#f3f4f6', color: statusColor(b.status) }}>
                          {b.status.toUpperCase()}
                        </span>
                      </div>
                    </div>
                    <div style={styles.bookingActions}>
                      {b.status === 'pending' && (
                        <>
                          <Link to={`/gear/${b.gear._id}`} style={styles.viewBtn}>View</Link>
                          <button onClick={() => handleApprove(b._id)} style={styles.approveBtn}>Approve</button>
                          <button onClick={() => handleReject(b._id)} style={styles.rejectBtn}>Reject</button>
                        </>
                      )}
                      {b.status === 'approved' && (
                        <button onClick={() => handleComplete(b._id)} style={styles.completeBtn}>Mark Complete</button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* My Rentals */}
        {tab === 'myBookings' && (
          <div>
            {myBookings.length === 0 ? (
              <p style={styles.empty}>You haven't rented any gear yet.</p>
            ) : (
              <div style={styles.bookingList}>
                {myBookings.map(b => (
                  <div key={b._id} style={styles.bookingCard}>
                    <div style={styles.bookingLeft}>
                      <img src={b.gear?.images?.[0]} alt="" style={styles.bookingImg} />
                      <div>
                        <h4 style={styles.bookingGear}>{b.gear?.title}</h4>
                        <p style={styles.bookingMeta}>📍 {b.gear?.location}</p>
                        <p style={styles.bookingMeta}>
                          {new Date(b.startDate).toLocaleDateString()} → {new Date(b.endDate).toLocaleDateString()}
                        </p>
                        <p style={styles.bookingMeta}>{b.totalDays} days · ₹{b.totalPrice}</p>
                        <span style={{ ...styles.badge, background: '#f3f4f6', color: statusColor(b.status) }}>
                          {b.status.toUpperCase()}
                        </span>
                      </div>
                    </div>
                    <div style={styles.listingActions}>
                      <Link to={`/gear/${b.gear._id}`} style={styles.viewBtn}>View</Link>
                      {b.status === 'completed' && (
                        <button onClick={() => setReviewModal(b)} style={styles.reviewBtn}>
                          Leave Review
                        </button>
                      )} 
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Review Modal */}
      {reviewModal && (
        <div style={styles.modalOverlay} onClick={() => setReviewModal(null)}>
          <div style={styles.modalCard} onClick={(e) => e.stopPropagation()}>
            <h3 style={styles.modalTitle}>Review {reviewModal.gear?.title}</h3>

            <div style={styles.starRow}> 
              {[1, 2, 3, 4, 5].map(n => (
                <span
                  key={n}
                  onClick={() => setRating(n)}
                  style={{
                    ...styles.star,
                    color: n <= rating ? '#f59e06' : '#e5e7eb'
                  }}
                >★</span>
              ))}
            </div>

            <textarea
              placeholder='Share  your experience with this gear...'
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              rows={4}
              style={styles.modalTextarea}
            />

            <div style={styles.modalActions}>
              <button onClick={() => setReviewModal(null)} style={styles.modalCancelBtn}>Cancel</button>
              <button onClick={handleSubmitReview} disabled={submittingReview} style={styles.modalSubmitBtn}>
                {submittingReview ? 'Submitting...' : 'Submit Review'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

const styles = {
  page: { minHeight: '100vh', background: '#f8f9fa', padding: '2rem' },
  container: { maxWidth: '900px', margin: '0 auto' },
  title: { fontSize: '1.6rem', fontWeight: '700', marginBottom: '0.25rem' },
  sub: { color: '#6b7280', marginBottom: '1.5rem', fontSize: '0.95rem' },
  tabs: {
    display: 'flex', gap: '0',
    borderBottom: '1px solid #e5e7eb',
    marginBottom: '1.5rem'
  },
  tab: {
    padding: '0.75rem 1.25rem',
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    fontSize: '0.9rem',
    transition: 'all 0.15s'
  },
  empty: { textAlign: 'center', color: '#9ca3af', padding: '3rem 0' },
  addBtn: {
    background: '#16a34a', color: '#fff',
    padding: '0.5rem 1rem', borderRadius: '8px',
    fontSize: '0.9rem', fontWeight: '500'
  },
  listingGrid: { display: 'flex', flexDirection: 'column', gap: '1rem' },
  listingCard: {
    background: '#fff', borderRadius: '12px',
    padding: '1rem', display: 'flex',
    alignItems: 'center', gap: '1rem',
    boxShadow: '0 2px 8px rgba(0,0,0,0.06)'
  },
  listingImg: { width: '90px', height: '70px', objectFit: 'cover', borderRadius: '8px', flexShrink: 0 },
  listingInfo: { flex: 1 },
  listingTitle: { fontSize: '1rem', fontWeight: '600', marginBottom: '0.25rem' },
  listingMeta: { fontSize: '0.85rem', color: '#6b7280', marginBottom: '0.2rem' },
  listingActions: { display: 'flex', flexDirection: 'column', gap: '0.5rem' },
  viewBtn: {
    background: '#f3f4f6', color: '#374151',
    padding: '0.4rem 0.85rem', borderRadius: '6px',
    fontSize: '0.85rem', fontWeight: '500', textAlign: 'center'
  },
  deleteBtn: {
    background: '#fee2e2', color: '#ef4444',
    border: 'none', padding: '0.4rem 0.85rem',
    borderRadius: '6px', fontSize: '0.85rem',
    fontWeight: '500', cursor: 'pointer'
  },
  badge: {
    display: 'inline-block', padding: '2px 10px',
    borderRadius: '99px', fontSize: '0.75rem',
    fontWeight: '500', marginTop: '0.4rem'
  },
  bookingList: { display: 'flex', flexDirection: 'column', gap: '1rem' },
  bookingCard: {
    background: '#fff', borderRadius: '12px',
    padding: '1rem', display: 'flex',
    alignItems: 'center', justifyContent: 'space-between',
    gap: '1rem', boxShadow: '0 2px 8px rgba(0,0,0,0.06)'
  },
  bookingLeft: { display: 'flex', gap: '1rem', alignItems: 'center' },
  bookingImg: { width: '80px', height: '65px', objectFit: 'cover', borderRadius: '8px', flexShrink: 0 },
  bookingGear: { fontSize: '0.95rem', fontWeight: '600', marginBottom: '0.25rem' },
  bookingMeta: { fontSize: '0.82rem', color: '#6b7280', marginBottom: '0.2rem' },
  bookingActions: { display: 'flex', flexDirection: 'column', gap: '0.5rem' },
  approveBtn: {
    background: '#dcfce7', color: '#16a34a',
    border: 'none', padding: '0.4rem 0.85rem',
    borderRadius: '6px', fontSize: '0.85rem',
    fontWeight: '500', cursor: 'pointer'
  },
  rejectBtn: {
    background: '#fee2e2', color: '#ef4444',
    border: 'none', padding: '0.4rem 0.85rem',
    borderRadius: '6px', fontSize: '0.85rem',
    fontWeight: '500', cursor: 'pointer'
  },
  completeBtn: {
    background: '#e0f2fe', color: '#0369a1',
    border: 'none', padding: '0.4rem 0.85rem',
    borderRadius: '6px', fontSize: '0.85rem',
    fontWeight: '500', cursor: 'pointer'
  },
  reviewBtn: {
    background: '#fef9c3', color: '#854d0e',
    padding: '0.4rem 0.85rem', borderRadius: '6px',
    border: 'none',
    fontSize: '0.85rem', fontWeight: '500', flexShrink: 0
  },
  modalOverlay: {
    position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
    background: 'rgba(0,0,0,0.5)', curson: 'pointer',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    zIndex: 1000
  },
  modalCard: {
    background: '#fff', borderRadius: '16px',
    padding: '1.75rem', width: '420px', maxWidth: '90vw'
  },
  modalTitle: { fontSize: '1.15rem', fontWeight: '600', marginBottom: '1rem' },
  starRow: { display: 'flex', gap: '0.4rem', marginBottom: '1rem', fontSize: '1.8rem', cursor: 'pointer' },
  star: { transition: 'color 0.15s' },
  modalTextarea: {
    width: '100%', padding: '0.75rem',
    borderRadius: '8px', border: '1px solid #e5e7eb',
    fontSize: '0.9rem', fontFamily: 'inherit',
    resize: 'vertical', marginBottom: '1.25rem'
  },
  modalActions: { display: 'flex', gap: '0.75rem', justifyContent: 'flex-end' },
  modalCancelBtn: {
    background: '#f3f4f6', color: '#374151',
    border: 'none', padding: '0.6rem 1.2rem',
    borderRadius: '8px', fontSize: '0.9rem',
    fontWeight: '500', cursor: 'pointer'
  },
  modalSubmitBtn: {
    background: '#16a34a', color: '#fff',
    border: 'none', padding: '0.6rem 1.2rem',
    borderRadius: '8px', fontSize: '0.9rem',
    fontWeight: '600', cursor: 'pointer'
  }
}