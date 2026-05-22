import { useState, useEffect } from 'react'

function AddManga() {
  const [authors, setAuthors] = useState([])
  const [genres, setGenres] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  
  // New author/genre names
  const [newAuthorName, setNewAuthorName] = useState('')
  const [newGenreName, setNewGenreName] = useState('')
  
  // Form state
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    imageUrl: '',
    authorId: '',
    genreId: ''
  })
  
  const [submitLoading, setSubmitLoading] = useState(false)

  const fetchData = async () => {
    try {
      setLoading(true)
      const [authorsRes, genresRes] = await Promise.all([
        fetch('/api/catalogo/authors'),
        fetch('/api/catalogo/genres')
      ])
      
      if (!authorsRes.ok || !genresRes.ok) {
        throw new Error('Failed to fetch data')
      }
      
      const authorsData = await authorsRes.json()
      const genresData = await genresRes.json()
      
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

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value === 'new' || value === '' ? value : (name.includes('Id') ? parseInt(value) : value)
    }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      setSubmitLoading(true)
      
      let finalAuthorId = formData.authorId
      let finalGenreId = formData.genreId

      // Create new author if needed
      if (finalAuthorId === 'new') {
        const authorRes = await fetch('/api/catalogo/authors', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ name: newAuthorName })
        })
        if (!authorRes.ok) throw new Error('Failed to create author')
        const newAuthor = await authorRes.json()
        finalAuthorId = newAuthor.id
      }

      // Create new genre if needed
      if (finalGenreId === 'new') {
        const genreRes = await fetch('/api/catalogo/genres', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ name: newGenreName })
        })
        if (!genreRes.ok) throw new Error('Failed to create genre')
        const newGenre = await genreRes.json()
        finalGenreId = newGenre.id
      }

      const finalData = {
        ...formData,
        authorId: finalAuthorId,
        genreId: finalGenreId
      }

      const response = await fetch('/api/catalogo/series', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(finalData)
      })
      
      if (!response.ok) {
        throw new Error('Failed to create series')
      }
      
      // Reset form and refetch
      setFormData({
        title: '',
        description: '',
        imageUrl: '',
        authorId: '',
        genreId: ''
      })
      setNewAuthorName('')
      setNewGenreName('')
      alert('Serie creada exitosamente')
    } catch (err) {
      alert(err.message)
    } finally {
      setSubmitLoading(false)
    }
  }

  if (loading) return <div className="loading">Cargando...</div>

  return (
    <div>
      <h1>Agregar Nueva Serie</h1>
      
      {error && <div className="error-message">{error}</div>}
      
      <div className="form-container">
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="title">Título</label>
            <input 
              type="text" 
              id="title" 
              name="title" 
              className="form-control"
              value={formData.title}
              onChange={handleInputChange}
              required
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="description">Descripción</label>
            <textarea 
              id="description" 
              name="description" 
              className="form-control"
              value={formData.description}
              onChange={handleInputChange}
              rows="3"
            />
          </div>

          <div className="form-group">
            <label htmlFor="imageUrl">URL de la Imagen</label>
            <input 
              type="url" 
              id="imageUrl" 
              name="imageUrl" 
              className="form-control"
              value={formData.imageUrl}
              onChange={handleInputChange}
              required
              placeholder="https://ejemplo.com/imagen.jpg"
            />
          </div>
          
          <div className="form-group" style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
            <div style={{ flex: 1, minWidth: '200px' }}>
              <label htmlFor="authorId">Autor</label>
              <select 
                id="authorId" 
                name="authorId" 
                className="form-control"
                value={formData.authorId}
                onChange={handleInputChange}
                required
              >
                <option value="" disabled>Selecciona un autor</option>
                {authors.map(a => (
                  <option key={a.id} value={a.id}>{a.name}</option>
                ))}
                <option value="new">+ Crear nuevo autor...</option>
              </select>
              
              {formData.authorId === 'new' && (
                <input
                  type="text"
                  className="form-control"
                  style={{ marginTop: '0.5rem' }}
                  placeholder="Nombre del nuevo autor"
                  value={newAuthorName}
                  onChange={(e) => setNewAuthorName(e.target.value)}
                  required
                />
              )}
            </div>
            
            <div style={{ flex: 1, minWidth: '200px' }}>
              <label htmlFor="genreId">Género</label>
              <select 
                id="genreId" 
                name="genreId" 
                className="form-control"
                value={formData.genreId}
                onChange={handleInputChange}
                required
              >
                <option value="" disabled>Selecciona un género</option>
                {genres.map(g => (
                  <option key={g.id} value={g.id}>{g.name}</option>
                ))}
                <option value="new">+ Crear nuevo género...</option>
              </select>
              
              {formData.genreId === 'new' && (
                <input
                  type="text"
                  className="form-control"
                  style={{ marginTop: '0.5rem' }}
                  placeholder="Nombre del nuevo género"
                  value={newGenreName}
                  onChange={(e) => setNewGenreName(e.target.value)}
                  required
                />
              )}
            </div>
          </div>
          
          <button type="submit" className="btn" disabled={submitLoading}>
            {submitLoading ? 'Guardando...' : 'Guardar Serie'}
          </button>
        </form>
      </div>
    </div>
  )
}

export default AddManga