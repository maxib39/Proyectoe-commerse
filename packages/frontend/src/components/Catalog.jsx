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
                  <button 
                    onClick={() => handleBuy(v.id)}
                    className="btn" 
                    style={{ backgroundColor: '#ff9800', marginTop: '10px' }}
                    disabled={v.stock <= 0}
                  >
                    {v.stock > 0 ? 'Comprar Manga' : 'Agotado'}
                  </button>
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