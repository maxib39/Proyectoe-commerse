"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { collection, getDocs, limit, query } from "firebase/firestore";
import { db } from "@/lib/firebase";
import MangaCard from "@/components/manga/MangaCard";
import { BookOpen, Sparkles, ShieldCheck, Truck, ArrowRight } from "lucide-react";
import styles from "./page.module.css";
import { useAuth } from "@/context/AuthContext";

export default function HomePage() {
  const [featuredMangas, setFeaturedMangas] = useState([]);
  const [loading, setLoading] = useState(true);
  const { user, userData, logout } = useAuth();

  useEffect(() => {
    async function fetchFeatured() {
      try {
        const q = query(collection(db, "mangas"), limit(4));
        const snap = await getDocs(q);
        const list = snap.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
        setFeaturedMangas(list);
      } catch (error) {
        console.error("Error al cargar mangas destacados:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchFeatured();
  }, []);

  return (
    <main className={styles.main}>
      {/* Hero Section */}
      <section className={styles.hero}>
        <div className={styles.heroContent}>


          <h1 className={styles.heroTitle}>
            Completá tu colección con tus tomos favoritos
          </h1>

          <p className={styles.heroSubtitle}>
            Encontrá las mejores series de Shonen, Seinen, Shojo y más. Elegí los volúmenes exactos que te faltan y recibilos en la puerta de tu casa.
          </p>

          <div className={styles.heroActions}>
            <Link href="/catalogo" className={styles.primaryBtn}>
              <BookOpen size={20} />
              <span>Explorar Catálogo</span>
            </Link>
          </div>
        </div>
      </section>

      {/* Beneficios */}
      <section className={styles.featuresSection}>
        <div className={styles.featureCard}>
          <div className={styles.featureIcon}>
            <Truck size={24} />
          </div>
          <h3>Envíos a todo el País</h3>
          <p>Llegamos a cualquier rincón de Argentina con empaquetado seguro.</p>
        </div>

        <div className={styles.featureCard}>
          <div className={styles.featureIcon}>
            <ShieldCheck size={24} />
          </div>
          <h3>Tomos 100% Originales</h3>
          <p>Ediciones oficiales de Ivrea, Panini Manga, Ovni Press y más.</p>
        </div>

        <div className={styles.featureCard}>
          <div className={styles.featureIcon}>
            <Sparkles size={24} />
          </div>
          <h3>Compra Fácil y Rápida</h3>
          <p>Seleccioná tus volúmenes en segundos y recibí el comprobante por email.</p>
        </div>
      </section>

      {/* Mangas Destacados */}
      <section className={styles.featuredSection}>
        <div className={styles.sectionHeader}>
          <div>
            <h2>Mangas Destacados</h2>
            <p>Los títulos más buscados por los lectores</p>
          </div>
          <Link href="/catalogo" className={styles.viewAllLink}>
            <span>Ver todo el catálogo</span>
            <ArrowRight size={16} />
          </Link>
        </div>

        {loading ? (
          <div className={styles.loading}>Cargando recomendaciones...</div>
        ) : featuredMangas.length === 0 ? (
          <div className={styles.empty}>
            <p>Aún no hay mangas cargados en la tienda.</p>
            <Link href="/admin/mangas">Cargar mangas desde el Panel Admin</Link>
          </div>
        ) : (
          <div className={styles.mangaGrid}>
            {featuredMangas.map((manga) => (
              <MangaCard key={manga.id} manga={manga} />
            ))}
          </div>
        )}
      </section>
    </main>
  );
}

