'use client';

import { useParams } from 'next/navigation';
import VerifyClient from './VerifyClient';

export default function VerifyCertificatePage() {
    const params = useParams();
    const uniqueId = params.uniqueId as string;

    return <VerifyClient uniqueId={uniqueId} />;
}
