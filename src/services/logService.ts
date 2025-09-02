import { PrismaClient } from '../generated/prisma';

const prisma = new PrismaClient();

export async function registerLog(userId: string | null, action: string, details?: string) {
  await prisma.log.create({
    data: {
      userId,
      action,
      details,
    },
  });
}