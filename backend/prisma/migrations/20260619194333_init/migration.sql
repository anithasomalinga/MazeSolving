-- CreateTable
CREATE TABLE "Score" (
    "id" SERIAL NOT NULL,
    "name" VARCHAR(20) NOT NULL,
    "timeMs" INTEGER NOT NULL,
    "difficulty" VARCHAR(10) NOT NULL,
    "date" VARCHAR(10) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Score_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Score_date_difficulty_idx" ON "Score"("date", "difficulty");