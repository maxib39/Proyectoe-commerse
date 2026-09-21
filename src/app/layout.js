import { AuthProvider } from "@/context/AuthContext";
import { CartProvider } from "@/context/CartContext";
import Navbar from "@/components/layout/Navbar";
import CartDrawer from "@/components/cart/CartDrawer";
import { Toaster } from "react-hot-toast";
import "./globals.css";

export const metadata = {
  title: "MangaStore — Tu tienda de Mangas",
  description: "Encontrá tus series y tomos favoritos al mejor precio en Argentina.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="es">
      <body>
        <AuthProvider>
          <CartProvider>
            <Toaster position="top-right" />
            <Navbar />
            <CartDrawer />
            {children}
          </CartProvider>
        </AuthProvider>
      </body>
    </html>
  );
}

