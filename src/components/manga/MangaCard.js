import Link from "next/link";
import Image from "next/image";
import { formatPrice } from "@/lib/utils";
import styles from "./mangaCard.module.css";

export default function MangaCard({ manga }) {
    return (
        <Link href={`/catalogo/${manga.id}`} className={styles.card}>
            <div className={styles.imageContainer}>
                {manga.coverImage ? (
                    <Image
                        src={manga.coverImage}
                        alt={manga.title}
                        fill
                        sizes="(max-width: 768px) 50vw, (max-width: 1200px) 33vw, 25vw"
                        className={styles.image}
                        priority={false}
                    />
                ) : (
                    <div className={styles.placeholder}>Sin portada</div>
                )}
            </div>

            <div className={styles.info}>
                <span className={styles.publisher}>{manga.publisher || "Editorial"}</span>
                <h3 className={styles.title}>{manga.title}</h3>
                <p className={styles.author}>{manga.author}</p>

                <div className={styles.genres}>
                    {manga.genres?.slice(0, 2).map((genre, index) => (
                        <span key={index} className={styles.genreBadge}>
                            {genre}
                        </span>
                    ))}
                </div>

                <div className={styles.footer}>
                    <span className={styles.priceLabel}>Desde</span>
                    <span className={styles.price}>{formatPrice(manga.priceFrom)}</span>
                </div>
            </div>
        </Link>
    );
}
