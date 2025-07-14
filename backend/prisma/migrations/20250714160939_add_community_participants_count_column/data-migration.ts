import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  await prisma.$transaction(
    async tx => {
      const communities = await tx.community.findMany();

      for (const community of communities) {
        const participants = await tx.participant.findMany({
          where: {
            communityId: community.id,
            status: "ACTIVE",
          },
        });

        const participantsCount = participants ? participants.length : 0;

        await tx.community.update({
          where: { id: community.id },
          data: {
            participantsCount: participantsCount,
          },
        });
      }
    },
    {
      maxWait: 5000, // 5 seconds max wait to connect to prisma
      timeout: 20000, // 20 seconds
    },
  );
}

main()
  .catch(async e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => await prisma.$disconnect);
