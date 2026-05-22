-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Series" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "imageUrl" TEXT NOT NULL DEFAULT 'https://via.placeholder.com/200x300?text=No+Image',
    "authorId" INTEGER NOT NULL,
    "genreId" INTEGER NOT NULL,
    CONSTRAINT "Series_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "Author" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Series_genreId_fkey" FOREIGN KEY ("genreId") REFERENCES "Genre" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_Series" ("authorId", "description", "genreId", "id", "title") SELECT "authorId", "description", "genreId", "id", "title" FROM "Series";
DROP TABLE "Series";
ALTER TABLE "new_Series" RENAME TO "Series";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
