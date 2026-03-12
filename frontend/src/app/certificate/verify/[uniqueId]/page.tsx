import VerifyClient from './VerifyClient';

export function generateStaticParams() {
    return [{ uniqueId: 'dummy' }];
}

export default function VerifyCertificatePage({ params }: { params: { uniqueId: string } }) {
    return <VerifyClient uniqueId={params.uniqueId} />;
}
