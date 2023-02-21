import { PrismaClient } from "@prisma/client";

const tableNames = ["User", "Store"];

export default async () => {
  const prisma = new PrismaClient();

  try {
    for (const tableName of tableNames) {
      await prisma.raw(`DELETE FROM "${tableName}";`);

      if (!["Store"].includes(tableName)) {
        await prisma.raw(
          `ALTER SEQUENCE "${tableName}_id_seq" RESTART WITH 1;`
        );
      }
    }
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error(err);
  } finally {
    await prisma.disconnect();
  }
};
