async function fix() {
    try {
        const { PrismaClient } = require('@prisma/client');
        const prisma = new PrismaClient();
        
        console.log("Altering 'options' column to JSONB...");
        
        // This command converts the text[] array to a jsonb array
        await prisma.$executeRaw`ALTER TABLE "Question" ALTER COLUMN "options" TYPE jsonb USING array_to_json("options")::jsonb;`;
        
        console.log("Successfully altered column type.");
        prisma.$disconnect();
    } catch (e) {
        console.error("Failed to alter table:", e);
    }
}
fix();
