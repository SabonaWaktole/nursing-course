import prisma from './prisma';

/**
 * Creates a notification routed to the correct instructor(s).
 * 
 * - If the course has an assigned instructor, the notification goes ONLY to that instructor.
 * - If the course has NO assigned instructor (null), individual notifications are created
 *   for EVERY admin so that at least one admin sees it.
 */
export async function createInstructorNotification(
    courseId: string,
    data: { title: string; message: string; type: string }
) {
    try {
        // Fetch the course to check its instructor
        const course = await prisma.course.findUnique({
            where: { id: courseId },
            select: { instructorId: true, title: true },
        });

        const instructorId = course?.instructorId;
        console.log(`[Notification] Creating alert for course: "${course?.title}" (ID: ${courseId})`);
        console.log(`[Notification] Found instructorId in database: ${instructorId ? `'${instructorId}'` : 'null'}`);

        if (instructorId && instructorId.trim() !== '') {
            // Course HAS an assigned instructor → send ONLY to them
            console.log(`[Notification] Action: Routing exclusively to instructor ${instructorId}`);
            await (prisma as any).notification.create({
                data: {
                    userId: instructorId,
                    title: data.title,
                    message: data.message,
                    type: data.type,
                },
            });
        } else {
            // Course has NO instructor → send individual notification to each admin
            const admins = await prisma.user.findMany({
                where: { role: 'ADMIN' },
                select: { id: true, name: true },
            });

            console.log(`[Notification] Action: No instructor assigned to this course! Broadcasting to ${admins.length} admins:`, admins.map(a => a.name));

            if (admins.length > 0) {
                await (prisma as any).notification.createMany({
                    data: admins.map((admin: { id: string }) => ({
                        userId: admin.id,
                        title: data.title,
                        message: data.message,
                        type: data.type,
                    })),
                });
            }
        }
    } catch (err) {
        console.warn('[Notification] Failed to create instructor notification:', err);
    }
}
