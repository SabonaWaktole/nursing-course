import VerifyClient from './VerifyClient';
import React from 'react';

export default function VerifyCertificatePage({ params }: { params: Promise<{ uniqueId: string }> }) {
    const resolvedParams = React.use(params);
    return <VerifyClient uniqueId={resolvedParams.uniqueId} />;
}
