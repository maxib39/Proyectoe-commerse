/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "firebasestorage.googleapis.com",
      },
      {
        protocol: "https",
        hostname: "**", // Permite imágenes de cualquier URL HTTPS mientras estés testeando
      },
    ],
  },
};

export default nextConfig;
