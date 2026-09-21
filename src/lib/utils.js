/**
 * Formatea un número a formato de moneda Argentina (ARS)
 */
export function formatPrice(num) {
    if (num === null || num === undefined) return "$ 0";

    return new Intl.NumberFormat("es-AR", {
        style: "currency",
        currency: "ARS",
        maximumFractionDigits: 0, // Si no querés mostrar centavos en decimales
    }).format(num);
}
