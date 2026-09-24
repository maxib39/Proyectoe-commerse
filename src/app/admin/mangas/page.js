"use client";

import { useEffect, useState } from "react";
import { collection, addDoc, getDocs, doc, updateDoc, query, where } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { formatPrice } from "@/lib/utils";
import toast from "react-hot-toast";
import { Plus, BookOpen, Layers } from "lucide-react";
import styles from "../admin.module.css";

const PREDEFINED_GENRES = ["Shonen", "Seinen", "Shojo", "Acción", "Aventura", "Romance", "Terror", "Comedia", "Fantasia", "Misterio", "Drama", "Sobrenatural", "Historico", "Ciencia Ficcion", "Escolar", "Psicologico"];

export default function AdminMangasPage() {
    const [mangas, setMangas] = useState([]);
    const [loading, setLoading] = useState(true);

    // Formulario de Manga
    const [mangaForm, setMangaForm] = useState({
        title: "",
        author: "",
        publisher: "Ivrea",
        genres: [],
        synopsis: "",
        coverImage: "",
        priceFrom: 12999, // en centavos
    });

    // Formulario para Agregar Tomo a un manga existente
    const [selectedMangaId, setSelectedMangaId] = useState("");
    const [volumeForm, setVolumeForm] = useState({
        number: 1,
        price: 12999,
        stock: 20,
    });

    const [submitting, setSubmitting] = useState(false);

    // Cargar mangas
    const fetchMangas = async () => {
        try {
            const snap = await getDocs(collection(db, "mangas"));
            const list = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
            setMangas(list);
            if (list.length > 0 && !selectedMangaId) {
                setSelectedMangaId(list[0].id);
            }
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchMangas();
    }, []);

    // Manejar checkboxes de géneros
    const handleGenreToggle = (genre) => {
        setMangaForm((prev) => {
            const exists = prev.genres.includes(genre);
            return {
                ...prev,
                genres: exists ? prev.genres.filter((g) => g !== genre) : [...prev.genres, genre],
            };
        });
    };

    // Crear Manga
    const handleCreateManga = async (e) => {
        e.preventDefault();
        if (mangaForm.genres.length === 0) {
            toast.error("Seleccioná al menos un género.");
            return;
        }

        setSubmitting(true);
        try {
            await addDoc(collection(db, "mangas"), {
                ...mangaForm,
                priceFrom: Number(mangaForm.priceFrom),
                createdAt: new Date().toISOString(),
            });
            toast.success("¡Manga creado exitosamente!");
            setMangaForm({
                title: "",
                author: "",
                publisher: "Ivrea",
                genres: [],
                synopsis: "",
                coverImage: "",
                priceFrom: 12999,
            });
            fetchMangas();
        } catch (error) {
            toast.error("Error al crear manga.");
            console.error(error);
        } finally {
            setSubmitting(false);
        }
    };

    // Agregar Tomo / Volumen a un Manga
    // Agregar o actualizar Tomo / Volumen a un Manga
    const handleAddVolume = async (e) => {
        e.preventDefault();
        if (!selectedMangaId) {
            toast.error("Seleccioná un manga.");
            return;
        }

        setSubmitting(true);
        try {
            const volumesRef = collection(db, "mangas", selectedMangaId, "volumes");
            const volumeNumber = Number(volumeForm.number);
            const volumePrice = Number(volumeForm.price);
            const additionalStock = Number(volumeForm.stock);

            // 1. Verificar si este número de tomo ya existe en el manga
            const q = query(volumesRef, where("number", "==", volumeNumber));
            const querySnapshot = await getDocs(q);

            if (!querySnapshot.empty) {
                // 👉 CASO A: YA EXISTE → Actualizamos stock y precio
                const existingDoc = querySnapshot.docs[0];
                const currentStock = existingDoc.data().stock || 0;
                const newStock = currentStock + additionalStock;

                await updateDoc(existingDoc.ref, {
                    stock: newStock,
                    price: volumePrice,
                    available: newStock > 0,
                });

                toast.success(`El Tomo #${volumeNumber} ya existía. Se sumó el stock (Total: ${newStock} u.) y se actualizó el precio.`);
            } else {
                // 👉 CASO B: NO EXISTE → Lo creamos por primera vez
                await addDoc(volumesRef, {
                    number: volumeNumber,
                    price: volumePrice,
                    stock: additionalStock,
                    available: additionalStock > 0,
                });

                toast.success(`Tomo #${volumeNumber} agregado con éxito.`);
            }

            // 2. Si este tomo tiene un precio menor, actualizamos priceFrom del manga
            const selectedManga = mangas.find((m) => m.id === selectedMangaId);
            if (selectedManga && volumePrice < (selectedManga.priceFrom || Infinity)) {
                await updateDoc(doc(db, "mangas", selectedMangaId), {
                    priceFrom: volumePrice,
                });
            }

            // Avanzamos automáticamente el número para el siguiente tomo
            setVolumeForm((prev) => ({ ...prev, number: prev.number + 1 }));
            fetchMangas();
        } catch (error) {
            toast.error("Error al procesar el tomo.");
            console.error(error);
        } finally {
            setSubmitting(false);
        }
    };


    return (
        <div>
            <h1 className={styles.pageTitle}>Gestión de Mangas y Tomos</h1>
            <p className={styles.pageSubtitle}>Da de alta nuevas series y cargá sus volúmenes en el catálogo</p>

            <div className={styles.adminSplit}>
                {/* Formulario 1: Crear Título de Manga */}
                <div className={styles.formCard}>
                    <div className={styles.cardTitleRow}>
                        <BookOpen size={20} />
                        <h3>1. Crear Nuevo Título de Manga</h3>
                    </div>

                    <form onSubmit={handleCreateManga} className={styles.adminForm}>
                        <label>Título del Manga *</label>
                        <input
                            type="text"
                            required
                            placeholder="Ej. Jujutsu Kaisen"
                            value={mangaForm.title}
                            onChange={(e) => setMangaForm({ ...mangaForm, title: e.target.value })}
                        />

                        <div className={styles.row}>
                            <div>
                                <label>Autor *</label>
                                <input
                                    type="text"
                                    required
                                    placeholder="Ej. Gege Akutami"
                                    value={mangaForm.author}
                                    onChange={(e) => setMangaForm({ ...mangaForm, author: e.target.value })}
                                />
                            </div>
                            <div>
                                <label>Editorial</label>
                                <input
                                    type="text"
                                    placeholder="Ej. Ivrea, Panini"
                                    value={mangaForm.publisher}
                                    onChange={(e) => setMangaForm({ ...mangaForm, publisher: e.target.value })}
                                />
                            </div>
                        </div>

                        <label>URL de Portada (Imagen web) *</label>
                        <input
                            type="url"
                            required
                            placeholder="https://..."
                            value={mangaForm.coverImage}
                            onChange={(e) => setMangaForm({ ...mangaForm, coverImage: e.target.value })}
                        />

                        <label>Precio base referencial</label>
                        <input
                            type="number"
                            placeholder="Ej: 12.999"
                            value={mangaForm.priceFrom}
                            onChange={(e) => setMangaForm({ ...mangaForm, priceFrom: e.target.value })}
                        />

                        <label>Géneros *</label>
                        <div className={styles.checkboxGroup}>
                            {PREDEFINED_GENRES.map((g) => (
                                <label key={g} className={styles.checkboxLabel}>
                                    <input
                                        type="checkbox"
                                        checked={mangaForm.genres.includes(g)}
                                        onChange={() => handleGenreToggle(g)}
                                    />
                                    <span>{g}</span>
                                </label>
                            ))}
                        </div>

                        <label>Sinopsis</label>
                        <textarea
                            rows={3}
                            placeholder="Resumen del manga..."
                            value={mangaForm.synopsis}
                            onChange={(e) => setMangaForm({ ...mangaForm, synopsis: e.target.value })}
                        />

                        <button type="submit" disabled={submitting} className={styles.primaryBtn}>
                            <Plus size={16} />
                            <span>{submitting ? "Guardando..." : "Crear Manga"}</span>
                        </button>
                    </form>
                </div>

                {/* Formulario 2: Agregar Tomo a Manga Existente */}
                <div className={styles.formCard}>
                    <div className={styles.cardTitleRow}>
                        <Layers size={20} />
                        <h3>2. Cargar Tomo / Volumen</h3>
                    </div>

                    <form onSubmit={handleAddVolume} className={styles.adminForm}>
                        <label>Seleccionar Manga *</label>
                        <select
                            value={selectedMangaId}
                            onChange={(e) => setSelectedMangaId(e.target.value)}
                            className={styles.select}
                        >
                            {mangas.map((m) => (
                                <option key={m.id} value={m.id}>
                                    {m.title} ({m.author})
                                </option>
                            ))}
                        </select>

                        <div className={styles.row}>
                            <div>
                                <label>Número de Tomo *</label>
                                <input
                                    type="number"
                                    min="1"
                                    required
                                    value={volumeForm.number}
                                    onChange={(e) => setVolumeForm({ ...volumeForm, number: e.target.value })}
                                />
                            </div>

                            <div>
                                <label>Stock disponible *</label>
                                <input
                                    type="number"
                                    min="0"
                                    required
                                    value={volumeForm.stock}
                                    onChange={(e) => setVolumeForm({ ...volumeForm, stock: e.target.value })}
                                />
                            </div>
                        </div>

                        <label>Precio del tomo *</label>
                        <input
                            type="number"
                            required
                            placeholder="Ej. 12999"
                            value={volumeForm.price}
                            onChange={(e) => setVolumeForm({ ...volumeForm, price: e.target.value })}
                        />
                        <small style={{ color: "#6b7280" }}>
                            Vista previa: <strong>{formatPrice(volumeForm.price)}</strong>
                        </small>

                        <button type="submit" disabled={submitting || mangas.length === 0} className={styles.secondaryBtn}>
                            <Plus size={16} />
                            <span>{submitting ? "Cargando..." : "Agregar Tomo"}</span>
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
}
