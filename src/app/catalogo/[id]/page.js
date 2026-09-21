"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { doc, getDoc, collection, getDocs, query, orderBy } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { formatPrice } from "@/lib/utils";
import toast from "react-hot-toast";
import styles from "./detalle.module.css";
import { useCart } from "@/context/CartContext";


export default function DetalleMangaPage() {
    const { id } = useParams();
    const [manga, setManga] = useState(null);
    const [volumes, setVolumes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [quantities, setQuantities] = useState({}); // Cantidad seleccionada por volumen
    const { addToCart } = useCart();
    useEffect(() => {
        async function fetchMangaAndVolumes() {
            try {
                // 1. Obtener los datos del título de manga
                const mangaRef = doc(db, "mangas", id);
                const mangaSnap = await getDoc(mangaRef);

                if (!mangaSnap.exists()) {
                    setLoading(false);
                    return;
                }

                setManga({ id: mangaSnap.id, ...mangaSnap.data() });

                // 2. Obtener los volúmenes de la subcolección ordenados por número
                const volumesRef = collection(db, "mangas", id, "volumes");
                const q = query(volumesRef, orderBy("number", "asc"));
                const volumesSnap = await getDocs(q);

                const volumeList = volumesSnap.docs.map((doc) => ({
                    id: doc.id,
                    ...doc.data(),
                }));

                setVolumes(volumeList);

                // Inicializar selector de cantidad en 1 para cada tomo
                const initialQuantities = {};
                volumeList.forEach((v) => {
                    initialQuantities[v.id] = 1;
                });
                setQuantities(initialQuantities);
            } catch (error) {
                console.error("Error al obtener detalle del manga:", error);
            } finally {
                setLoading(false);
            }
        }

        if (id) fetchMangaAndVolumes();
    }, [id]);

    const handleQuantityChange = (volumeId, value, maxStock) => {
        const val = parseInt(value, 10);
        if (isNaN(val) || val < 1) return;
        if (val > maxStock) {
            toast.error(`Solo hay ${maxStock} unidades disponibles.`);
            return;
        }
        setQuantities((prev) => ({ ...prev, [volumeId]: val }));
    };

    const handleAddToCart = (volume) => {
        const qty = quantities[volume.id] || 1;
        // En la Fase 3 conectaremos esto con CartContext
        addToCart(manga, volume, qty);
        toast.success(
            `Agregado: ${manga.title} — Vol. ${volume.number} (x${qty})`
        );
    };

    if (loading) {
        return <div className={styles.loading}>Cargando información del manga...</div>;
    }

    if (!manga) {
        return (
            <div className={styles.notFound}>
                <h2>Manga no encontrado</h2>
                <Link href="/catalogo">Volver al catálogo</Link>
            </div>
        );
    }

    return (
        <main className={styles.container}>
            <Link href="/catalogo" className={styles.backLink}>
                ← Volver al catálogo
            </Link>

            {/* Encabezado del Manga */}
            <section className={styles.mangaHeader}>
                <div className={styles.coverWrapper}>
                    {manga.coverImage ? (
                        <Image
                            src={manga.coverImage}
                            alt={manga.title}
                            width={300}
                            height={450}
                            className={styles.cover}
                            priority
                        />
                    ) : (
                        <div className={styles.placeholder}>Sin portada</div>
                    )}
                </div>

                <div className={styles.mangaDetails}>
                    <span className={styles.publisher}>{manga.publisher}</span>
                    <h1>{manga.title}</h1>
                    <p className={styles.author}>Por <strong>{manga.author}</strong></p>

                    <div className={styles.genres}>
                        {manga.genres?.map((genre, idx) => (
                            <span key={idx} className={styles.genreBadge}>
                                {genre}
                            </span>
                        ))}
                    </div>

                    <div className={styles.synopsis}>
                        <h3>Sinopsis</h3>
                        <p>{manga.synopsis || "Sin sinopsis disponible."}</p>
                    </div>
                </div>
            </section>

            {/* Lista de Volúmenes / Tomos */}
            <section className={styles.volumesSection}>
                <h2>Volúmenes Disponibles</h2>
                <p className={styles.volumesSub}>
                    Seleccioná los tomos que quieras agregar a tu compra:
                </p>

                {volumes.length === 0 ? (
                    <p className={styles.noVolumes}>Aún no hay tomos cargados para este manga.</p>
                ) : (
                    <div className={styles.volumeList}>
                        {volumes.map((vol) => (
                            <div key={vol.id} className={styles.volumeCard}>
                                <div className={styles.volumeInfo}>
                                    <span className={styles.volumeNumber}>Tomo #{vol.number}</span>
                                    <span className={styles.volumeTitle}>{vol.title || `Volumen ${vol.number}`}</span>
                                    <span className={styles.stock}>
                                        {vol.stock > 0 ? `Stock: ${vol.stock} u.` : "Agotado"}
                                    </span>
                                </div>

                                <div className={styles.volumeAction}>
                                    <span className={styles.price}>{formatPrice(vol.price)}</span>

                                    {vol.stock > 0 ? (
                                        <div className={styles.actions}>
                                            <input
                                                type="number"
                                                min="1"
                                                max={vol.stock}
                                                value={quantities[vol.id] || 1}
                                                onChange={(e) =>
                                                    handleQuantityChange(vol.id, e.target.value, vol.stock)
                                                }
                                                className={styles.quantityInput}
                                            />
                                            <button
                                                onClick={() => handleAddToCart(vol)}
                                                className={styles.addBtn}
                                            >
                                                Agregar
                                            </button>
                                        </div>
                                    ) : (
                                        <button disabled className={styles.disabledBtn}>
                                            Sin stock
                                        </button>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </section>
        </main>
    );
}
