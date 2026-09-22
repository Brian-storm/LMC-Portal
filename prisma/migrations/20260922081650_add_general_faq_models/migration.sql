-- CreateTable
CREATE TABLE "general_faq_categories" (
    "id" TEXT NOT NULL,
    "nameZh" TEXT NOT NULL,
    "nameEn" TEXT NOT NULL,
    "nameZhCn" TEXT,
    "order" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "general_faq_categories_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "general_faqs" (
    "id" TEXT NOT NULL,
    "categoryId" TEXT NOT NULL,
    "questionZh" TEXT NOT NULL,
    "questionEn" TEXT NOT NULL,
    "questionZhCn" TEXT,
    "answerZh" TEXT NOT NULL,
    "answerEn" TEXT NOT NULL,
    "answerZhCn" TEXT,
    "order" INTEGER NOT NULL DEFAULT 0,
    "isPublished" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "general_faqs_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "general_faqs" ADD CONSTRAINT "general_faqs_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "general_faq_categories"("id") ON DELETE CASCADE ON UPDATE CASCADE;
