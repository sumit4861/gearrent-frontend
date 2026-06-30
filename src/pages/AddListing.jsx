import {useState} from 'react'
import {useNavigate} from 'react-router-dom'
import api from '../api/axios'
import toast from 'react-hot-toast'

const CATEGORIES = ['cycle', 'camera', 'tent', 'cricekt', 'drone', 'music', 'sports', 'others']
const CONDITIONS = ['new', 'like-new', 'good', 'fair']

export default function AddListing() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    title: '',
    description: '',
    category: '',
    condition: '',
    pricePerDay: '',
    deposit: '',
    location: ''
  })

  const [images, setImages] = useState([])
  const [loading, setLoading] = useState(false)
  const [aiLoading, setAiLoading] = useState(false)

  const handleChange = (e) => {
    setForm({...form, [e.target.name]: e.target.value})
  }
  
  const handleImages = (e) => {
    setImages([...e.target.files])
  }

  const handleGenerate = async() => {
    if(!form.title || !form.category || !form.condition) {
      toast.error('Fill in title, category and condition first')
      return
    }
    setAiLoading(true)
    try {
      const res = await api.post('/gear/generate-description', {
        title: form.title,
        category: form.category,
        condition: form.condition
      })
      setForm({...form, description: res.data.description})
      toast.success('Description generated')
    } catch(err) {
      toast.error('Failed to generate description')
    } finally {
      setAiLoading(false)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if(images.length === 0) {
      toast.error('Please upload at least one image')
      return 
    }
    setLoading(true)
    try {
      const formData = new FormData()
      Object.keys(form).forEach(key => formData.append(key, form[key]))
      images.forEach(img => formData.append('images', img))

      const res = await api.post('/gear', formData, {
        headers: {'Content-Type': 'multipart/form-data'}
      })

      toast.success('Listing created!')
      navigate(`/gear/${res.data._id}`)
    } catch(err) {
      toast.error(err.response?.data?.message || 'Failed to create listing')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div stype={styles.page}>
      <div style={styles.container}>
        <h2 style={styles.title}>List Your gear</h2>
        <p style={styles.sub}>Fill in the details below to start renting out your gear</p>

        <form onSubmit={handleSubmit} style={styles.form}>

          {/* Title */}
          <div style={styles.field}>
            <label style={styles.label}>Gear Title</label>
            <input 
              name="title"
              value={form.title}
              onChange={handleChange}
              placeholder='e.g. Trek Mountain Cycle'
              required
              style={styles.input}
            />
          </div>

          {/* Category + Condition */}
          <div style={styles.row}>
            <div style={styles.field}>
              <label style={styles.label}>Category</label>
              <select 
              name="category" 
              value={form.category} 
              onChange={handleChange}
              required style={styles.input}>
                <option value="">Select category</option>
                {CATEGORIES.map(c => (
                  <option key={c} value={c}>{c.charAt(0).toUpperCase() + c.slice(1)}</option>
                ))}
              </select>
            </div>
            <div style={styles.field}>
              <label style={styles.label}>Condition</label>
              <select
                name="condition"
                value={form.condition}
                onChange={handleChange}
                required style={styles.input}>
                <option value="">Select condition</option>
                {CONDITIONS.map(c => (
                  <option key={c} value={c}>{c.charAt(0).toUpperCase() + c.slice(1)}</option>
                ))}
              </select>
            </div>
          </div>
          
          {/* Description with AI */}
          <div style={styles.field}>
            <div style={styles.labelRow}>
              <label style={styles.label}>Description</label>
              <button
                type="button"
                onClick={handleGenerate}
                disabled={aiLoading}
                style={styles.aiBtn}
              >
                {aiLoading ? '✨ Generating...' : '✨ Generate with AI'}
              </button>
            </div>
            <textarea
              name="description"
              value={form.description}
              onChange={handleChange}
              placeholder="Describe your gear — or use AI to generate a description"
              required
              rows={4}
              style={{ ...styles.input, resize: 'vertical' }}
            />
          </div>
            {/* Price + Deposit */}
            <div style={styles.row}>
              <div style={styles.field}>
                <label style={styles.label}>Price per Day (₹)</label>
                <input
                  type="number"
                  name="pricePerDay"
                  value={form.pricePerDay}
                  onChange={handleChange}
                  placeholder="e.g. 200"
                  required
                  min="1"
                  style={styles.input}
                />
              </div>
              <div style={styles.field}>
                <label style={styles.label}>Deposit (₹)</label>
                <input
                  type="number"
                  name="deposit"
                  value={form.deposit}
                  onChange={handleChange}
                  placeholder="e.g. 500"
                  required
                  min="0"
                  style={styles.input}
                />
              </div>
            </div>

            {/* Location */}
            <div style={styles.field}>
              <label style={styles.label}>Location</label>
              <input
                name="location"
                value={form.location}
                onChange={handleChange}
                placeholder="e.g. Bhopal"
                required
                style={styles.input}
              />
            </div>
            
            {/* Images */}
            <div style={styles.field}>
              <label style={styles.label}>Images (max 4)</label>
              <input
                type="file"
                multiple
                accept="image/*"
                onChange={handleImages}
                style={styles.fileInput}
              />
              {images.length > 0 && (
                <div style={styles.previewRow}>
                  {[...images].map((img, i) => (
                    <img
                      key={i}
                      src={URL.createObjectURL(img)}
                      alt=""
                      style={styles.preview}
                    />
                  ))}
                </div>
              )}
            </div>

            <button type="submit" disabled={loading} style={styles.submitBtn}>
              {loading ? 'Creating listing...' : 'Create Listing'}
            </button>
        </form>
      </div>
    </div>
  )
}

const styles = {
  page: { minHeight: '100vh', background: '#f8f9fa', padding: '2rem' },
  container: {
    maxWidth: '680px',
    margin: '0 auto',
    background: '#fff',
    borderRadius: '16px',
    padding: '2rem',
    boxShadow: '0 4px 24px rgba(0,0,0,0.07)'
  },
  title: { fontSize: '1.6rem', fontWeight: '700', marginBottom: '0.25rem' },
  sub: { color: '#6b7280', marginBottom: '1.5rem', fontSize: '0.95rem' },
  form: { display: 'flex', flexDirection: 'column', gap: '1.25rem' },
  row: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' },
  field: { display: 'flex', flexDirection: 'column', gap: '0.4rem' },
  labelRow: { display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
  label: { fontSize: '0.875rem', fontWeight: '500', color: '#374151' },
  input: {
    padding: '0.65rem 1rem',
    borderRadius: '8px',
    border: '1px solid #e5e7eb',
    fontSize: '0.95rem',
    outline: 'none',
    width: '100%',
    fontFamily: 'inherit'
  },
  aiBtn: {
    background: '#eef2ff',
    color: '#4f46e5',
    border: '1px solid #c7d2fe',
    padding: '0.3rem 0.85rem',
    borderRadius: '8px',
    fontSize: '0.8rem',
    fontWeight: '500',
    cursor: 'pointer'
  },
  fileInput: { fontSize: '0.9rem' },
  previewRow: { display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginTop: '0.5rem' },
  preview: { width: '80px', height: '60px', objectFit: 'cover', borderRadius: '6px' },
  submitBtn: {
    background: '#16a34a',
    color: '#fff',
    padding: '0.85rem',
    borderRadius: '10px',
    border: 'none',
    fontSize: '1rem',
    fontWeight: '600',
    cursor: 'pointer'
  }
}