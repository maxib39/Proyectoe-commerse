import Image from "next/image";
import { formatPrice } from "@/lib/utils";
import { Plus, Minus, Trash2 } from "lucide-react";
import styles from "./cartDrawer.module.css";

export default function CartItem({ item, onUpdateQty, onRemove }) {
    return (
        <div className={styles.item}>
            <div className={styles.itemImage}>
                {item.coverImage ? (
                    <Image
                        src={item.coverImage}
                        alt={item.mangaTitle}
                        width={60}
                        height={90}
                        className={styles.img}
                    />
                ) : (
                    <div className={styles.noImg}>Tomo</div>
                )}
            </div>

            <div className={styles.itemDetails}>
                <h4 className={styles.itemTitle}>{item.mangaTitle}</h4>
                <span className={styles.itemVolume}>Tomo #{item.volumeNumber}</span>
                <span className={styles.itemPrice}>{formatPrice(item.unitPrice)}</span>

                <div className={styles.itemActions}>
                    <div className={styles.qtySelector}>
                        <button
                            onClick={() => onUpdateQty(item.volumeId, item.quantity - 1)}
                            className={styles.qtyBtn}
                        >
                            <Minus size={14} />
                        </button>
                        <span className={styles.qtyNumber}>{item.quantity}</span>
                        <button
                            onClick={() => onUpdateQty(item.volumeId, item.quantity + 1)}
                            className={styles.qtyBtn}
                            disabled={item.quantity >= item.maxStock}
                        >
                            <Plus size={14} />
                        </button>
                    </div>

                    <button
                        onClick={() => onRemove(item.volumeId)}
                        className={styles.deleteBtn}
                        title="Eliminar tomo"
                    >
                        <Trash2 size={16} />
                    </button>
                </div>
            </div>
        </div>
    );
}
