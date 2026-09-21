"use client";

import { useEffect, useState, useMemo } from "react";
import { collection, getDocs } from "firebase/firestore";
import { db } from "@/lib/firebase";
import MangaCard from "@/components/manga/MangaCard";
import styles from "./catalogo.module.css";

export default function CatalogoPage() {
    const [mangas, setMangas] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const [selectedGenre, setSelectedGenre] = useState("Todos");
    const [sortBy, setSortBy] = useState("default");

    // 1. Obtener la lista de mangas de Firestore
    useEffect(() => {
        async function fetchMangas() {
            try {
                const querySnapshot = await getDocs(collection(db, "mangas"));
                const mangaList = querySnapshot.docs.map((doc) => ({
                    id: doc.id,
                    ...doc.data(),
                }));
                setMangas(mangaList);
            } catch (error) {
                console.error("Error al cargar mangas:", error);
            } finally {
                setLoading(false);
            }
        }

        fetchMangas();
    }, []);

    // 2. Extraer todos los géneros únicos disponibles
    const availableGenres = useMemo(() => {
        const genresSet = new Set(["Todos"]);
        mangas.forEach((m) => {
            if (Array.isArray(m.genres)) {
                m.genres.forEach((g) => genresSet.add(g));
            }
        });
        return Array.from(genresSet);
    }, [mangas]);

    // 3. Filtrar y ordenar en memoria
    const filteredMangas = useMemo(() => {
        return mangas
            .filter((manga) => {
                const matchesSearch =
                    manga.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                    manga.author?.toLowerCase().includes(searchTerm.toLowerCase());

                const matchesGenre =
                    selectedGenre === "Todos" ||
                    (Array.isArray(manga.genres) && manga.genres.includes(selectedGenre));

                return matchesSearch && matchesGenre;
            })
            .sort((a, b) => {
                if (sortBy === "price-asc") return (a.priceFrom || 0) - (b.priceFrom || 0);
                if (sortBy === "price-desc") return (b.priceFrom || 0) - (a.priceFrom || 0);
                if (sortBy === "title") return (a.title || "").localeCompare(b.title || "");
                return 0;
            });
    }, [mangas, searchTerm, selectedGenre, sortBy]);

    return (
        <main className={styles.container}>
            <header className={styles.header}>
                <h1>Catálogo de Mangas</h1>
                <p>Explorá tus títulos favoritos y elegí los tomos que te falten</p>
            </header>

            {/* Barra de Filtros y Búsqueda */}
            <section className={styles.filtersBar}>
                <input
                    type="text"
                    placeholder="Buscar por título o autor..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className={styles.searchInput}
                />

                <div className={styles.selectGroup}>
                    <select
                        value={selectedGenre}
                        onChange={(e) => setSelectedGenre(e.target.value)}
                        className={styles.select}
                    >
                        {availableGenres.map((genre) => (
                            <option key={genre} value={genre}>
                                {genre}
                            </option>
                        ))}
                    </select>

                    <select
                        value={sortBy}
                        onChange={(e) => setSortBy(e.target.value)}
                        className={styles.select}
                    >
                        <option value="default">Ordenar por defecto</option>
                        <option value="price-asc">Precio: menor a mayor</option>
                        <option value="price-desc">Precio: mayor a menor</option>
                        <option value="title">Título: A - Z</option>
                    </select>
                </div>
            </section>

            {/* Grid de Mangas */}
            {loading ? (
                <div className={styles.loading}>Cargando mangas...</div>
            ) : filteredMangas.length === 0 ? (
                <div className={styles.noResults}>
                    No se encontraron mangas con los filtros seleccionados.
                </div>
            ) : (
                <div className={styles.grid}>
                    {filteredMangas.map((manga) => (
                        <MangaCard key={manga.id} manga={manga} />
                    ))}
                </div>
            )}
        </main>
    );
}
