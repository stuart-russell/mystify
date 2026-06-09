-- CreateTable
CREATE TABLE "BoxPurchase" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "shop" TEXT NOT NULL,
    "orderId" TEXT NOT NULL,
    "orderLineItemId" TEXT NOT NULL,
    "mysteryBoxId" TEXT NOT NULL,
    "price" TEXT,
    "quantity" INTEGER NOT NULL DEFAULT 1,
    "status" TEXT NOT NULL DEFAULT 'unopened',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "openedAt" DATETIME,
    CONSTRAINT "BoxPurchase_mysteryBoxId_fkey" FOREIGN KEY ("mysteryBoxId") REFERENCES "MysteryBox" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "BoxReveal" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "boxPurchaseId" TEXT NOT NULL,
    "setId" INTEGER,
    "variantId" TEXT NOT NULL,
    "itemName" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "BoxReveal_boxPurchaseId_fkey" FOREIGN KEY ("boxPurchaseId") REFERENCES "BoxPurchase" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "BoxDesign" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "mysteryBoxId" TEXT NOT NULL,
    "animationStyle" TEXT NOT NULL DEFAULT 'default',
    "boxImageUrl" TEXT,
    "openSoundUrl" TEXT,
    "backgroundColor" TEXT,
    "backgroundImageUrl" TEXT,
    CONSTRAINT "BoxDesign_mysteryBoxId_fkey" FOREIGN KEY ("mysteryBoxId") REFERENCES "MysteryBox" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_MysteryBox" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "shop" TEXT NOT NULL,
    "productId" TEXT NOT NULL,
    "productTitle" TEXT NOT NULL,
    "boxType" TEXT NOT NULL,
    "boxStatus" TEXT NOT NULL DEFAULT 'draft',
    "smartStockManagement" BOOLEAN NOT NULL DEFAULT false,
    "preventDuplicateBundleSelections" BOOLEAN NOT NULL DEFAULT false,
    "itemConfig" TEXT,
    "bundleConfig" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);
INSERT INTO "new_MysteryBox" ("boxStatus", "boxType", "bundleConfig", "createdAt", "id", "itemConfig", "preventDuplicateBundleSelections", "productId", "productTitle", "shop", "smartStockManagement", "updatedAt") SELECT "boxStatus", "boxType", "bundleConfig", "createdAt", "id", "itemConfig", "preventDuplicateBundleSelections", "productId", "productTitle", "shop", "smartStockManagement", "updatedAt" FROM "MysteryBox";
DROP TABLE "MysteryBox";
ALTER TABLE "new_MysteryBox" RENAME TO "MysteryBox";
CREATE INDEX "MysteryBox_shop_idx" ON "MysteryBox"("shop");
CREATE UNIQUE INDEX "MysteryBox_shop_productId_key" ON "MysteryBox"("shop", "productId");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;

-- CreateIndex
CREATE INDEX "BoxPurchase_shop_orderId_idx" ON "BoxPurchase"("shop", "orderId");

-- CreateIndex
CREATE INDEX "BoxReveal_boxPurchaseId_idx" ON "BoxReveal"("boxPurchaseId");

-- CreateIndex
CREATE UNIQUE INDEX "BoxDesign_mysteryBoxId_key" ON "BoxDesign"("mysteryBoxId");
