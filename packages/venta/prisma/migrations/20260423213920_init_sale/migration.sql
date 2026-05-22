-- CreateTable
CREATE TABLE "Venta" (
    "nroVenta" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "fecha" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "clienteId" INTEGER NOT NULL,
    "monto" DECIMAL NOT NULL,
    CONSTRAINT "Venta_clienteId_fkey" FOREIGN KEY ("clienteId") REFERENCES "Clente" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Clente" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "nombre" TEXT NOT NULL,
    "apellido" TEXT NOT NULL
);

-- CreateTable
CREATE TABLE "SaleDetail" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "ventaId" INTEGER NOT NULL,
    "mangaId" INTEGER NOT NULL,
    "mangaTitle" TEXT NOT NULL,
    "volume" INTEGER NOT NULL,
    "priceAtSale" DECIMAL NOT NULL,
    "quantity" INTEGER NOT NULL,
    CONSTRAINT "SaleDetail_ventaId_fkey" FOREIGN KEY ("ventaId") REFERENCES "Venta" ("nroVenta") ON DELETE RESTRICT ON UPDATE CASCADE
);
