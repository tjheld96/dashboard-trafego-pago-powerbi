-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "email" TEXT NOT NULL,
    "username" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "Character" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "vocation" TEXT NOT NULL,
    "level" INTEGER NOT NULL DEFAULT 1,
    "experience" INTEGER NOT NULL DEFAULT 0,
    "gold" INTEGER NOT NULL DEFAULT 0,
    "hp" INTEGER NOT NULL,
    "mp" INTEGER NOT NULL,
    "attrStr" INTEGER NOT NULL DEFAULT 0,
    "attrDex" INTEGER NOT NULL DEFAULT 0,
    "attrInt" INTEGER NOT NULL DEFAULT 0,
    "attrVit" INTEGER NOT NULL DEFAULT 0,
    "unspentAttributePoints" INTEGER NOT NULL DEFAULT 0,
    "skillMelee" INTEGER NOT NULL DEFAULT 10,
    "skillDistance" INTEGER NOT NULL DEFAULT 10,
    "skillMagic" INTEGER NOT NULL DEFAULT 10,
    "skillShielding" INTEGER NOT NULL DEFAULT 10,
    "skillProgressMelee" INTEGER NOT NULL DEFAULT 0,
    "skillProgressDistance" INTEGER NOT NULL DEFAULT 0,
    "skillProgressMagic" INTEGER NOT NULL DEFAULT 0,
    "skillProgressShielding" INTEGER NOT NULL DEFAULT 0,
    "currentGroundId" TEXT,
    "huntStartedAt" DATETIME,
    "lastTickAt" DATETIME,
    "deaths" INTEGER NOT NULL DEFAULT 0,
    "trophiesJson" TEXT NOT NULL DEFAULT '{}',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Character_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "User_username_key" ON "User"("username");

-- CreateIndex
CREATE UNIQUE INDEX "Character_userId_key" ON "Character"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "Character_name_key" ON "Character"("name");
