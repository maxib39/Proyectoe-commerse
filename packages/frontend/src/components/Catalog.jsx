import { useState, useEffect } from 'react'
import { useAuth } from '../context/AuthContext'
import { useNavigate } from 'react-router-dom'

function Catalog() {
  const [series, setSeries] = useState([])
  const [authors, setAuthors] = useState([])
  const [genres, setGenres] = useState([])
  const [selectedSeries, setSelectedSeries] = useState(null)
  const [volumes, setVolumes] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const { user } = useAuth()
  const navigate = useNavigate()

  // Estado para edición de series
  const [editingSeries, setEditingSeries] = useState(null)
  const [editForm, setEditForm] = useState({
    title: '',
    description: '',
    imageUrl: '',
    authorId: '',
    genreId: ''
  })
  const [editLoading, setEditLoading] = useState(false)

  const isVendedor = user && user.rol === 'VENDEDOR'
  const isCliente = user && user.rol === 'CLIENTE'

  const handleBuy = async (volumeId) => {
    if (!user) {
      navigate('/login')
      return
    }

    try {
      const res = await fetch(`/api/catalogo/volumes/${volumeId}/buy`, {
        method: 'POST'
      })
      const data = await res.json()
      
      if (!res.ok) {
        throw new Error(data.error || 'Error en la compra')
      }
      
      alert('¡Compra Exitosa!')
      
      // Actualizar el stock localmente para reflejar la compra
      setVolumes(volumes.map(v => 
        v.id === volumeId ? { ...v, stock: v.stock - 1 } : v
      ))
    } catch (err) {
      alert(err.message)
    }
  }

  const fetchData = async () => {
    try {
      setLoading(true)
      const [seriesRes, authorsRes, genresRes] = await Promise.all([
        fetch('/api/catalogo/series'),
        fetch('/api/catalogo/authors'),
        fetch('/api/catalogo/genres')
      ])
      
      if (!seriesRes.ok || !authorsRes.ok || !genresRes.ok) {
        throw new Error('Failed to fetch data')
      }
      
      const seriesData = await seriesRes.json()
      const authorsData = await authorsRes.json()
      const genresData = await genresRes.json()
      
      setSeries(seriesData)
      setAuthors(authorsData)
      setGenres(genresData)
      setError(null)
    } catch (err) {
      setError(err.message)
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
  }, [])

  const handleSeriesClick = async (series) => {
    if (editingSeries) return // No navegar si estamos editando
    setSelectedSeries(series)
    try {
      const res = await fetch(`/api/catalogo/volumes/series/${series.id}`)
      if (!res.ok) throw new Error('Failed to fetch volumes')
      const volumesData = await res.json()
      setVolumes(volumesData)
    } catch (err) {
      setError(err.message)
    }
  }

  const handleBack = () => {
    setSelectedSeries(null)
    setVolumes([])
  }

  // --- Funciones de VENDEDOR ---

  const handleDeleteSeries = async (e, seriesId) => {
    e.stopPropagation() // Evitar que abra los volúmenes
    if (!window.confirm('¿Estás seguro de que deseas eliminar esta serie? Se eliminarán también todos sus volúmenes.')) {
      return
    }
    try {
      const res = await fetch(`/api/catalogo/series/${seriesId}`, {
        method: 'DELETE'
      })
      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || 'Error eliminando serie')
      }
      alert('Serie eliminada exitosamente')
      // Actualizar lista local
      setSeries(series.filter(s => s.id !== seriesId))
    } catch (err) {
      alert(err.message)
    }
  }

  const handleEditClick = (e, s) => {
    e.stopPropagation() // Evitar que abra los volúmenes
    setEditingSeries(s.id)
    setEditForm({
      title: s.title || '',
      description: s.description || '',
      imageUrl: s.imageUrl || '',
      authorId: s.authorId || '',
      genreId: s.genreId || ''
    })
  }

  const handleEditCancel = (e) => {
    if (e) e.stopPropagation()
    setEditingSeries(null)
    setEditForm({ title: '', description: '', imageUrl: '', authorId: '', genreId: '' })
  }

  const handleEditChange = (e) => {
    const { name, value } = e.target
    setEditForm(prev => ({
      ...prev,
      [name]: name.includes('Id') ? parseInt(value) : value
    }))
  }

  const handleEditSubmit = async (e) => {
    e.preventDefault()
    e.stopPropagation()
    try {
      setEditLoading(true)
      const res = await fetch(`/api/catalogo/series/${editingSeries}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editForm)
      })
      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || 'Error actualizando serie')
      }
      const updated = await res.json()
      // Actualizar la lista local
      setSeries(series.map(s => s.id === editingSeries ? { ...s, ...updated } : s))
      setEditingSeries(null)
      alert('Serie actualizada exitosamente')
    } catch (err) {
      alert(err.message)
    } finally {
      setEditLoading(false)
    }
  }

  return (
    <div>
      <h1>Catálogo de Mangas</h1>
      
      {error && <div className="error-message">{error}</div>}
      
      {selectedSeries ? (
        <div>
          <button onClick={handleBack} className="btn">← Volver al Catálogo</button>
          <h2>Volúmenes de {selectedSeries.title}</h2>
          {volumes.length === 0 ? (
            <p>No hay volúmenes disponibles.</p>
          ) : (
            <div className="volumes-grid">
              {volumes.map((v) => (
                <div key={v.id} className="volume-card">
                  <h3>Volumen {v.volNumber}</h3>
                  <p>Precio: ${v.price}</p>
                  <p>Stock: {v.stock}</p>
                  {/* Solo CLIENTE (o no logueado) puede comprar. VENDEDOR no puede. */}
                  {!isVendedor && (
                    <button 
                      onClick={() => handleBuy(v.id)}
                      className="btn" 
                      style={{ backgroundColor: '#ff9800', marginTop: '10px' }}
                      disabled={v.stock <= 0}
                    >
                      {v.stock > 0 ? 'Comprar Manga' : 'Agotado'}
                    </button>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      ) : (
        loading ? (
          <div className="loading">Cargando series...</div>
        ) : (
          <div className="series-grid">
            {series.length === 0 ? (
              <div className="loading">No hay series disponibles.</div>
            ) : (
              series.map((s) => (
                <div key={s.id} className="series-card" onClick={() => handleSeriesClick(s)}>
                  {/* Modal de edición inline para vendedor */}
                  {editingSeries === s.id ? (
                    <form onClick={(e) => e.stopPropagation()} onSubmit={handleEditSubmit} style={{ padding: '10px' }}>
                      <h3 style={{ marginBottom: '10px' }}>Editar Serie</h3>
                      <div className="form-group" style={{ marginBottom: '8px' }}>
                        <label>Título</label>
                        <input 
                          type="text" name="title" className="form-control"
                          value={editForm.title} onChange={handleEditChange} required 
                        />
                      </div>
                      <div className="form-group" style={{ marginBottom: '8px' }}>
                        <label>Descripción</label>
                        <textarea 
                          name="description" className="form-control" rows="2"
                          value={editForm.description} onChange={handleEditChange} 
                        />
                      </div>
                      <div className="form-group" style={{ marginBottom: '8px' }}>
                        <label>URL Imagen</label>
                        <input 
                          type="url" name="imageUrl" className="form-control"
                          value={editForm.imageUrl} onChange={handleEditChange} required 
                        />
                      </div>
                      <div className="form-group" style={{ marginBottom: '8px' }}>
                        <label>Autor</label>
                        <select name="authorId" className="form-control" value={editForm.authorId} onChange={handleEditChange} required>
                          <option value="" disabled>Selecciona un autor</option>
                          {authors.map(a => (
                            <option key={a.id} value={a.id}>{a.name}</option>
                          ))}
                        </select>
                      </div>
                      <div className="form-group" style={{ marginBottom: '8px' }}>
                        <label>Género</label>
                        <select name="genreId" className="form-control" value={editForm.genreId} onChange={handleEditChange} required>
                          <option value="" disabled>Selecciona un género</option>
                          {genres.map(g => (
                            <option key={g.id} value={g.id}>{g.name}</option>
                          ))}
                        </select>
                      </div>
                      <div style={{ display: 'flex', gap: '8px', marginTop: '10px' }}>
                        <button type="submit" className="btn" disabled={editLoading} style={{ flex: 1 }}>
                          {editLoading ? 'Guardando...' : 'Guardar'}
                        </button>
                        <button type="button" className="btn" onClick={handleEditCancel} style={{ flex: 1, backgroundColor: '#888' }}>
                          Cancelar
                        </button>
                      </div>
                    </form>
                  ) : (
                    <>
                      {s.imageUrl && (
                        <img src={s.imageUrl} alt={`Portada de ${s.title}`} className="series-image" />
                      )}
                      <h3 className="series-title">{s.title || s.titulo || `Serie #${s.id}`}</h3>
                      <p className="series-desc">
                        {s.description || s.descripcion || 'Sin descripción disponible.'}
                      </p>
                      <div className="series-meta">
                        <span>Autor: {authors.find(a => a.id === s.authorId)?.name || s.authorId}</span>
                        <span>Género: {genres.find(g => g.id === s.genreId)?.name || s.genreId}</span>
                      </div>
                      {/* Botones de editar/eliminar solo para VENDEDOR */}
                      {isVendedor && (
                        <div style={{ display: 'flex', gap: '8px', marginTop: '10px' }}>
                          <button 
                            onClick={(e) => handleEditClick(e, s)} 
                            className="btn" 
                            style={{ flex: 1, backgroundColor: '#2196F3' }}
                          >
                            ✏️ Editar
                          </button>
                          <button 
                            onClick={(e) => handleDeleteSeries(e, s.id)} 
                            className="btn" 
                            style={{ flex: 1, backgroundColor: '#f44336' }}
                          >
                            🗑️ Eliminar
                          </button>
                        </div>
                      )}
                    </>
                  )}
                </div>
              ))
            )}
          </div>
        )
      )}
    </div>
  )
}

export default Catalog