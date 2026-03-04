----------------------------------------------------------
-- Session Table -----------------------------------------
-- CreateTable
CREATE TABLE "Session" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "shop" TEXT NOT NULL,
    "state" TEXT NOT NULL,
    "isOnline" BOOLEAN NOT NULL DEFAULT false,
    "scope" TEXT,
    "expires" DATETIME,
    "accessToken" TEXT NOT NULL,
    "userId" BIGINT,
    "firstName" TEXT,
    "lastName" TEXT,
    "email" TEXT,
    "accountOwner" BOOLEAN NOT NULL DEFAULT false,
    "locale" TEXT,
    "collaborator" BOOLEAN DEFAULT false,
    "emailVerified" BOOLEAN DEFAULT false
);
-- Session Table -----------------------------------------
----------------------------------------------------------

----------------------------------------------------------
-- Mystery Box Table -------------------------------------
-- CreateTable
CREATE TABLE "MysteryBox" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "shop" TEXT NOT NULL,
    "productTitle" TEXT NOT NULL DEFAULT '',
    "productId" TEXT NOT NULL,
    "boxType" TEXT NOT NULL,
    "boxStatus" TEXT NOT NULL DEFAULT 'draft',
    "itemConfig" TEXT,
    "bundleConfig" TEXT,
    "smartStockManagement" BOOLEAN NOT NULL DEFAULT false,
    "preventDuplicateBundleSelections" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "MysteryBox_shop_productId_key" ON "MysteryBox"("shop", "productId");

-- CreateIndex
CREATE INDEX "MysteryBox_shop_idx" ON "MysteryBox"("shop");
-- Mystery Box Table -------------------------------------
----------------------------------------------------------
