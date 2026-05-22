import { useState, useEffect } from 'react'

function BuyVolumes() {
  const [series, setSeries] = useState([])
  const [selectedSeries, setSelectedSeries] = useState('')
  const [volumes, setVolumes] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  
  // Form state for adding volume
  const [formData, setFormData] = useState({
    volNumber: '',
    price: '',
    stock: ''
  })
  
  // State for adding stock to existing volume
  const [selectedVolume, setSelectedVolume] = useState('')
  const [additionalStock, setAdditionalStock] = useState('')
  const [mode, setMode] = useState('new') // 'new' or 'stock'
  
  const [submitLoading, setSubmitLoading] = useState(false)

  const fetchSeries = async () => {
    try {
      setLoading(true)
      const res = await fetch('/api/catalogo/series')
      if (!res.ok) throw new Error('Failed to fetch series')
      const seriesData = await res.json()
      setSeries(seriesData)
      setError(null)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const fetchVolumes = async (seriesId) => {
    if (!seriesId) return
    try {
      const res = await fetch(`/api/catalogo/volumes/series/${seriesId}`)
      if (!res.ok) throw new Error('Failed to fetch volumes')
      const volumesData = await res.json()
      setVolumes(volumesData)
    } catch (err) {
      setError(err.message)
    }
  }

  useEffect(() => {
    fetchSeries()
  }, [])

  useEffect(() => {
    fetchVolumes(selectedSeries)
  }, [selectedSeries])

  const handleSeriesChange = (e) => {
    setSelectedSeries(e.target.value)
    setFormData({ volNumber: '', price: '', stock: '' })
    setSelectedVolume('')
    setAdditionalStock('')
    setMode('new')
  }

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value === '' ? value : (name === 'volNumber' || name === 'stock' ? parseInt(value) : parseFloat(value))
    }))
  }

  const handleStockChange = (e) => {
    setAdditionalStock(e.target.value)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      setSubmitLoading(true)
      
      if (mode === 'new') {
        const data = {
          ...formData,
          seriesId: parseInt(selectedSeries)
        }

        const response = await fetch('/api/catalogo/volumes', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(data)
        })
        
        if (!response.ok) {
          throw new Error('Failed to add volume')
        }
        
        // Reset form and refetch volumes
        setFormData({ volNumber: '', price: '', stock: '' })
        fetchVolumes(selectedSeries)
        alert('Volumen agregado exitosamente')
      } else if (mode === 'stock') {
        const stockToAdd = parseInt(additionalStock)
        if (!stockToAdd || stockToAdd <= 0) {
          throw new Error('Ingrese una cantidad válida de stock')
        }

        const response = await fetch(`/api/catalogo/volumes/stock/${selectedVolume}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ stock: stockToAdd })
        })
        
        if (!response.ok) {
          throw new Error('Failed to update stock')
        }
        
        // Reset form and refetch volumes
        setSelectedVolume('')
        setAdditionalStock('')
        fetchVolumes(selectedSeries)
        alert('Stock actualizado exitosamente')
      }
    } catch (err) {
      alert(err.message)
    } finally {
      setSubmitLoading(false)
    }
  }

  if (loading) return <div className="loading">Cargando series...</div>

  return (
    <div>
      <h1>Comprar Volúmenes (Adquirir Stock)</h1>
      
      {error && <div className="error-message">{error}</div>}
      
      <div className="form-container">
        <h2>Comprar Volúmenes (Adquirir Stock)</h2>
        
        <div className="form-group">
          <label htmlFor="series">Seleccionar Serie</label>
          <select 
            id="series" 
            value={selectedSeries}
            onChange={handleSeriesChange}
            className="form-control"
            required
          >
            <option value="" disabled>Selecciona una serie</option>
            {series.map(s => (
              <option key={s.id} value={s.id}>{s.title}</option>
            ))}
          </select>
        </div>

        {selectedSeries && (
          <>
            <div className="form-group">
              <label>Modo de operación:</label>
              <div style={{ display: 'flex', gap: '1rem', marginTop: '0.5rem' }}>
                <label>
                  <input
                    type="radio"
                    value="new"
                    checked={mode === 'new'}
                    onChange={(e) => setMode(e.target.value)}
                  />
                  Agregar nuevo volumen
                </label>
                <label>
                  <input
                    type="radio"
                    value="stock"
                    checked={mode === 'stock'}
                    onChange={(e) => setMode(e.target.value)}
                  />
                  Agregar stock a volumen existente
                </label>
              </div>
            </div>

            <form onSubmit={handleSubmit}>
              {mode === 'new' ? (
                <>
                  <div className="form-group">
                    <label htmlFor="volNumber">Número de Volumen</label>
                    <input 
                      type="number" 
                      id="volNumber" 
                      name="volNumber" 
                      className="form-control"
                      value={formData.volNumber}
                      onChange={handleInputChange}
                      min="1"
                      required
                    />
                  </div>
                  
                  <div className="form-group">
                    <label htmlFor="price">Precio</label>
                    <input 
                      type="number" 
                      id="price" 
                      name="price" 
                      className="form-control"
                      value={formData.price}
                      onChange={handleInputChange}
                      min="0"
                      step="0.01"
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label htmlFor="stock">Stock Inicial</label>
                    <input 
                      type="number" 
                      id="stock" 
                      name="stock" 
                      className="form-control"
                      value={formData.stock}
                      onChange={handleInputChange}
                      min="0"
                      required
                    />
                  </div>
                </>
              ) : (
                <>
                  <div className="form-group">
                    <label htmlFor="volume">Seleccionar Volumen</label>
                    <select 
                      id="volume" 
                      value={selectedVolume}
                      onChange={(e) => setSelectedVolume(e.target.value)}
                      className="form-control"
                      required
                    >
                      <option value="" disabled>Selecciona un volumen</option>
                      {volumes.map(v => (
                        <option key={v.id} value={v.id}>
                          Volumen {v.volNumber} (Stock actual: {v.stock})
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="form-group">
                    <label htmlFor="additionalStock">Stock a Agregar</label>
                    <input 
                      type="number" 
                      id="additionalStock" 
                      className="form-control"
                      value={additionalStock}
                      onChange={handleStockChange}
                      min="1"
                      required
                    />
                  </div>
                </>
              )}
              
              <button type="submit" className="btn" disabled={submitLoading}>
                {submitLoading ? 'Procesando...' : mode === 'new' ? 'Agregar Volumen' : 'Actualizar Stock'}
              </button>
            </form>
          </>
        )}
      </div>

      {selectedSeries && (
        <div>
          <h2>Volúmenes Existentes de {series.find(s => s.id == selectedSeries)?.title}</h2>
          {volumes.length === 0 ? (
            <p>No hay volúmenes para esta serie.</p>
          ) : (
            <div className="volumes-grid">
              {volumes.map((v) => (
                <div key={v.id} className="volume-card">
                  <h3>Volumen {v.volNumber}</h3>
                  <p>Precio: ${v.price}</p>
                  <p>Stock: {v.stock}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}

export default BuyVolumes