import VerifyClient from './VerifyClient';

export default async function VerifyCertificatePage({ params }: { params: { uniqueId: string } }) {
    const { uniqueId } = params;

    const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

    try {
        const res = await fetch(`${API_URL}/api/certificates/verify/${uniqueId}`, {
            cache: 'no-store' // We don't want to permanently cache verification results
        });

        if (!res.ok) {
            return <VerifyClient result={{ valid: false }} />;
        }

        const data = await res.json();
        return <VerifyClient result={data} />;

    } catch (error) {
        console.error("Error verifying certificate:", error);
        return <VerifyClient result={{ valid: false }} />;
    }
}
