# 📚 MangaStore — E-Commerce de Mangas

Plataforma de comercio electrónico especializada en la venta y distribución de mangas en Argentina. El proyecto está construido sobre una arquitectura moderna con **Next.js**, **Firebase** y **Vercel**, diseñado para brindar una experiencia de usuario rápida, reactiva y elegante.

---

## 🎯 ¿En qué consiste el proyecto?

**MangaStore** es una tienda online pensada para lectores y coleccionistas de manga. Su enfoque principal resuelve una particularidad clave del sector: **los mangas no se compran como un producto genérico aislado, sino por serie o título y luego por volumen o tomo específico**.

### Características Principales

1. **Catálogo por Títulos**:
   - En la página principal y el catálogo, los usuarios navegan por las series de manga disponibles (ej. *One Piece*, *Naruto*, *Jujutsu Kaisen*), viendo datos relevantes como sinopsis, autores, editoriales, géneros y precio base ("Desde $...").
2. **Selección Detallada de Volúmenes**:
   - Al ingresar a un manga específico, el usuario puede explorar cada uno de sus tomos/volúmenes disponibles, verificar su precio individual en pesos argentinos (ARS), disponibilidad y agregarlos al carrito de forma independiente.
3. **Autenticación y Perfiles (Firebase Auth)**:
   - Registro e inicio de sesión seguro con Email y Contraseña o mediante Google (con un solo clic).
   - Manejo de roles (`user` para compradores habituales y `admin` para administración).
4. **Carrito de Compras Persistente**:
   - Permite agregar tomos de múltiples series, modificar cantidades respetando el stock disponible y conservar el carrito tanto en almacenamiento local (`localStorage`) como en sesión.
5. **Checkout y Simulación de Compra**:
   - Formulario de datos de envío y facturación.
   - Confirmación de pedido con descuento automático de stock y registro del pedido en base de datos.
   - **Envío de email de confirmación** en tiempo real al correo del comprador con el resumen y número de orden.
6. **Historial de Pedidos**:
   - Sección privada para que los usuarios puedan consultar sus compras anteriores y el estado de cada pedido.
7. **Panel de Administración (Admin Dashboard)**:
   - Panel protegido para gestionar el catálogo (alta, baja y modificación de títulos y volúmenes) y supervisar los pedidos realizados.

---

## 🛠️ Tecnologías Utilizadas

### Frontend & Framework Fullstack
- **[Next.js](https://nextjs.org/) (App Router)**: Framework fullstack sobre React que gestiona el renderizado (SSR/Client Components), la navegación y los endpoints de backend sin necesidad de un servidor externo independiente.
- **[React](https://react.dev/)**: Biblioteca base para la construcción de interfaces declarativas y componentes modulares.
- **CSS Modules**: Estilos modulares y desacoplados para evitar colisiones y mantener el control sobre el diseño visual.
- **[next/image](https://nextjs.org/docs/app/api-reference/components/image)**: Optimización automática de imágenes (formato WebP, carga diferida/lazy loading y redimensionamiento responsivo).

### Backend & Serverless
- **Next.js API Routes**: Funciones serverless para procesar transacciones seguras, interactuar con el SDK administrativo de Firebase y despachar correos electrónicos.
- **[Nodemailer](https://nodemailer.com/)**: Librería para el despacho automatizado de correos electrónicos transaccionales vía protocolo SMTP (integrado con Gmail App Passwords).

### Base de Datos & Autenticación (Firebase)
- **[Firebase Authentication](https://firebase.google.com/docs/auth)**: Gestión de credenciales, tokens de acceso y proveedores OAuth (Google).
- **[Cloud Firestore](https://firebase.google.com/docs/firestore)**: Base de datos NoSQL documental y en tiempo real para usuarios, mangas, volúmenes y órdenes de compra.
- **[Firebase Storage](https://firebase.google.com/docs/storage)**: Almacenamiento seguro de imágenes de portadas y banners subidos desde el panel administrativo.
- **Firebase Admin SDK**: Operaciones de backend privilegiadas y validación de seguridad.

### UI & Experiencia de Usuario
- **[Lucide React](https://lucide.dev/)**: Iconografía moderna y ligera.
- **[React Hot Toast](https://react-hot-toast.com/)**: Notificaciones emergentes accesibles para feedback inmediato (errores, confirmaciones, alertas).
- **[React Hook Form](https://react-hook-form.com/)**: Gestión performante de formularios y validaciones de datos.

### Infraestructura & Despliegue
- **[Vercel](https://vercel.com/)**: Plataforma de hosting y CI/CD nativa para Next.js con despliegues automáticos desde repositorios Git.

---

## 🗄️ Modelo de Datos

La base de datos en Firestore se estructura de la siguiente manera:

```text
mangas/ (Colección)
  └── {mangaId}
        ├── title: string
        ├── author: string
        ├── publisher: string
        ├── genres: array
        ├── synopsis: string
        ├── coverImage: string (URL Firebase Storage)
        ├── priceFrom: number (en centavos ARS)
        └── volumes/ (Subcolección)
              └── {volumeId}
                    ├── number: number
                    ├── title: string
                    ├── price: number (en centavos ARS)
                    ├── stock: number
                    └── available: boolean

users/ (Colección)
  └── {userId}
        ├── displayName: string
        ├── email: string
        ├── role: "user" | "admin"
        └── createdAt: timestamp

orders/ (Colección)
  └── {orderId}
        ├── userId: string
        ├── userEmail: string
        ├── items: array de tomos comprados
        ├── total: number (en centavos ARS)
        ├── shippingInfo: object (dirección, ciudad, etc.)
        ├── status: "confirmado" | "enviado" | "entregado"
        └── createdAt: timestamp
```

> **Nota sobre precios:** Los valores monetarios se almacenan como enteros (centavos) para evitar errores de cálculo de punto flotante y se formatean en la UI mediante la API nativa de JavaScript `Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS' })`.

---

## 🚀 Puesta en Marcha en Desarrollo

### 1. Prerrequisitos
- Node.js versión **18.x** o superior (recomendado 20+ LTS).
- Cuenta de Google/Firebase con un proyecto configurado.

### 2. Instalación
Clonar o ubicarse en el directorio del proyecto e instalar las dependencias necesarias:

```bash
npm install
npm install firebase react-hot-toast lucide-react react-hook-form
npm install firebase-admin nodemailer
```

### 3. Variables de Entorno
Crear un archivo `.env.local` en la raíz del proyecto tomando como referencia el siguiente esquema:

```env
# Firebase Client SDK (Públicas)
NEXT_PUBLIC_FIREBASE_API_KEY=tu_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=tu_proyecto.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=tu_proyecto
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=tu_proyecto.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=tu_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=tu_app_id

# Firebase Admin SDK (Privadas / Server-side)
FIREBASE_ADMIN_PROJECT_ID=tu_proyecto
FIREBASE_ADMIN_CLIENT_EMAIL=tu_service_account@tu_proyecto.iam.gserviceaccount.com
FIREBASE_ADMIN_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"

# Email SMTP (Gmail App Password)
EMAIL_USER=tu_correo@gmail.com
EMAIL_PASS=tu_app_password_de_16_caracteres
```

### 4. Ejecución del Servidor Local
Iniciar el servidor de desarrollo:

```bash
npm run dev
```

Abrir [http://localhost:3000](http://localhost:3000) en el navegador.

---

## 🌐 Despliegue en Vercel

1. Vincular el repositorio del proyecto en **GitHub**.
2. En [vercel.com](https://vercel.com/), importar el repositorio (detecta automáticamente la configuración de Next.js).
3. En la sección **Environment Variables**, cargar todas las variables listadas en `.env.local`.
4. Hacer clic en **Deploy**.
5. Agregar el dominio generado por Vercel (`https://tu-proyecto.vercel.app`) en la consola de Firebase:  
   *Authentication* → *Settings* → *Authorized domains*.
