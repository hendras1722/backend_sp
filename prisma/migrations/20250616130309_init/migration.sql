/*
  Warnings:

  - You are about to drop the `_TaskAssignees` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `assigneeId` to the `tasks` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "_TaskAssignees" DROP CONSTRAINT "_TaskAssignees_A_fkey";

-- DropForeignKey
ALTER TABLE "_TaskAssignees" DROP CONSTRAINT "_TaskAssignees_B_fkey";

-- AlterTable
ALTER TABLE "tasks" ADD COLUMN     "assigneeId" TEXT NOT NULL;

-- DropTable
DROP TABLE "_TaskAssignees";

-- AddForeignKey
ALTER TABLE "tasks" ADD CONSTRAINT "tasks_assigneeId_fkey" FOREIGN KEY ("assigneeId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
