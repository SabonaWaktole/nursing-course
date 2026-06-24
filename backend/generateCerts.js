const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    const courseId = 'd71143bc-1716-4687-a198-2a0dcc20cf0a';
    
    // Sabona Waktole
    const userId1 = 'aa63e3d5-201d-43db-8d0c-048bc77ffa6e';
    // other users
    const userId2 = '6a8db96f-fee2-448a-aaca-56954e912161';
    const userId3 = 'bd86cad4-0549-4dd8-9232-3a4a1e71d7e7';
    
    for (const userId of [userId1, userId2, userId3]) {
        const existingCert = await prisma.certificate.findFirst({
            where: { userId, courseId }
        });
        if (!existingCert) {
            console.log(`Generating cert for user ${userId}`);
            
            const user = await prisma.user.findUnique({ where: { id: userId }, select: { name: true } });
            const course = await prisma.course.findUnique({ where: { id: courseId }, select: { title: true, hours: true } });
            let settings = await prisma.adminSettings.findUnique({ where: { id: 'singleton' } });
            if (!settings) settings = { organizationName: '', organizationAddress: '', organizationPhone: '', directorName: '', directorTitle: '', providerId: '' };

            const newCert = await prisma.certificate.create({
                data: {
                    userId,
                    courseId,
                    status: 'PENDING',
                    hoursAttended: course?.hours || 0,
                    courseTitle: course?.title,
                    organizationName: settings.organizationName,
                    organizationAddress: settings.organizationAddress,
                    organizationPhone: settings.organizationPhone,
                    directorName: settings.directorName,
                    directorTitle: settings.directorTitle,
                    providerId: settings.providerId
                },
            });
            console.log('Created cert:', newCert.id);
        }
    }
}

main().catch(console.error).finally(() => prisma.$disconnect());
