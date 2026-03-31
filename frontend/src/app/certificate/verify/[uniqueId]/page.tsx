import VerifyClient from './VerifyClient';
import React from 'react';

export function generateStaticParams() {
    return [{ uniqueId: 'dummy' }];
}

export default function VerifyCertificatePage({ params }: { params: Promise<{ uniqueId: string }> }) {
    const resolvedParams = React.use(params);
    return <VerifyClient uniqueId={resolvedParams.uniqueId} />;
}
