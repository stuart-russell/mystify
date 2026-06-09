import type { PrismaClient } from "@prisma/client";

type BoxDesignData = {
  animationStyle?: string;
  boxImageUrl?: string | null;
  openSoundUrl?: string | null;
  backgroundColor?: string | null;
  backgroundImageUrl?: string | null;
};

export const boxDesign = {
  async createDefault(prisma: PrismaClient, mysteryBoxId: string) {
    return prisma.boxDesign.create({
      data: { mysteryBoxId },
    });
  },

  async getByBoxId(prisma: PrismaClient, mysteryBoxId: string) {
    return prisma.boxDesign.findUnique({
      where: { mysteryBoxId },
    });
  },

  async update(
    prisma: PrismaClient,
    mysteryBoxId: string,
    data: BoxDesignData,
  ) {
    return prisma.boxDesign.update({
      where: { mysteryBoxId },
      data,
    });
  },

  async deleteByBoxId(prisma: PrismaClient, mysteryBoxId: string) {
    await prisma.boxDesign.deleteMany({
      where: { mysteryBoxId },
    });
  },
};
