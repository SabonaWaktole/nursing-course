import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { QRCodeSVG } from 'qrcode.react';
import Navbar from '../components/Navbar';

interface CertificateData {
  uniqueId: string;
  studentName: string;
  courseName: string;
  organizationName: string;
  organizationAddress?: string;
  providerId?: string;
  directorName: string;
  directorTitle?: string;
  issuedAt: string;
}

const CertificatePage = () => {
  const { id } = useParams<{ id: string }>();
  const [result, setResult] = useState<{ valid: boolean; certificate?: CertificateData; status?: string } | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const API_URL = import.meta.env.VITE_API_URL;
    fetch(`${API_URL}/certificates/verify/${id}`)
      .then(res => res.ok ? res.json() : { valid: false })
      .then(data => {
        setResult(data);
        setLoading(false);
      })
      .catch(() => {
        setResult({ valid: false });
        setLoading(false);
      });
  }, [id]);

  const handlePrint = () => {
    window.print();
  };

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#0F172A' }}>
        <div style={{ width: '48px', height: '48px', border: '4px solid rgba(59, 130, 246, 0.2)', borderTopColor: '#3B82F6', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  if (!result?.valid || !result.certificate) {
    if (result?.status === 'PENDING') {
      return (
        <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', background: '#0F172A', color: '#F8FAFC' }}>
          <div className="no-print"><Navbar /></div>
          <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
            <div style={{ background: '#1E293B', border: '1px solid #334155', borderRadius: '24px', padding: '48px', maxWidth: '500px', width: '100%', textAlign: 'center' }}>
              <div style={{ width: '80px', height: '80px', borderRadius: '50%', background: 'rgba(245, 158, 11, 0.1)', border: '1px solid rgba(245, 158, 11, 0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 24px' }}>
                <span style={{ fontSize: '36px' }}>⏳</span>
              </div>
              <h1 style={{ fontSize: '24px', fontWeight: 700, color: '#F59E0B', marginBottom: '12px' }}>Awaiting Admin Approval</h1>
              <p style={{ color: '#94A3B8', marginBottom: '32px', lineHeight: 1.6 }}>Your certificate has been automatically generated and is currently waiting for admin approval. You will be notified once it is approved.</p>
              <Link to="/my-learning" style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', background: '#3B82F6', color: '#fff', padding: '12px 28px', borderRadius: '12px', textDecoration: 'none', fontWeight: 600, transition: 'background 0.2s' }}>
                Back to Dashboard
              </Link>
            </div>
          </div>
        </div>
      );
    }
    return (
      <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', background: '#0F172A', color: '#F8FAFC' }}>
        <div className="no-print"><Navbar /></div>
        <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
          <div style={{ background: '#1E293B', border: '1px solid #334155', borderRadius: '24px', padding: '48px', maxWidth: '440px', width: '100%', textAlign: 'center' }}>
            <div style={{ width: '80px', height: '80px', borderRadius: '50%', background: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 24px' }}>
              <span style={{ fontSize: '36px' }}>✕</span>
            </div>
            <h1 style={{ fontSize: '24px', fontWeight: 700, color: '#EF4444', marginBottom: '12px' }}>Invalid Certificate</h1>
            <p style={{ color: '#94A3B8', marginBottom: '32px' }}>This certificate ID does not exist or has been revoked.</p>
            <Link to="/" style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', background: '#3B82F6', color: '#fff', padding: '12px 28px', borderRadius: '12px', textDecoration: 'none', fontWeight: 600 }}>
              Back to Home
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const cert = result.certificate;
  const verifyUrl = `${window.location.origin}/certificate/verify/${cert.uniqueId}`;

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', background: '#0F172A', color: '#F8FAFC', fontFamily: 'Inter, sans-serif' }}>
      {/* Google Fonts */}
      <link href="https://fonts.googleapis.com/css2?family=Great+Vibes&family=Playfair+Display:ital,wght@0,400;0,600;1,400;1,600&display=swap" rel="stylesheet" />

      <div className="no-print"><Navbar /></div>

      <main style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '40px 16px' }}>
        {/* Header */}
        <div className="no-print" style={{ width: '100%', maxWidth: '900px', marginBottom: '32px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '14px', color: '#94A3B8', marginBottom: '16px' }}>
            <Link to="/" style={{ color: '#94A3B8', textDecoration: 'none' }}>Home</Link>
            <span>›</span>
            <span style={{ color: '#F8FAFC', fontWeight: 500 }}>Verification</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap', gap: '16px' }}>
            <div>
              <h1 style={{ fontSize: '28px', fontWeight: 800, margin: '0 0 8px 0' }}>Certificate Verification</h1>
              <p style={{ color: '#94A3B8', margin: 0 }}>Verified official record for <strong style={{ color: '#F8FAFC' }}>{cert.studentName}</strong></p>
            </div>
            <button
              onClick={handlePrint}
              style={{ display: 'flex', alignItems: 'center', gap: '8px', background: '#3B82F6', color: '#fff', padding: '12px 24px', borderRadius: '12px', border: 'none', fontWeight: 600, fontSize: '14px', cursor: 'pointer', boxShadow: '0 4px 14px rgba(59, 130, 246, 0.3)' }}
            >
              ↓ Download PDF / Print
            </button>
          </div>
        </div>

        {/* Certificate Card — Matching UW design */}
        <div style={{ width: '100%', maxWidth: '900px', display: 'flex', justifyContent: 'center', marginBottom: '48px' }}>
          <div
            id="certificate-container"
            style={{
              position: 'relative',
              background: 'white',
              color: '#0f172a',
              width: '100%',
              maxWidth: '900px',
              aspectRatio: '1.414 / 1',
              boxShadow: '0 25px 60px rgba(0, 0, 0, 0.4)',
              borderRadius: '2px',
              overflow: 'hidden',
              display: 'flex',
              flexDirection: 'column',
            }}
          >
            {/* Subtle outer border */}
            <div style={{ position: 'absolute', inset: 0, border: '1px solid rgba(226, 232, 240, 0.6)', pointerEvents: 'none', zIndex: 10 }} />

            {/* Top-left triangles */}
            <svg style={{ position: 'absolute', top: 0, left: 0, pointerEvents: 'none', zIndex: 0 }} width="280" height="260" viewBox="0 0 280 260" fill="none">
              <polygon points="0,0 240,0 0,220" fill="#c8dce8" opacity="0.25" />
              <polygon points="0,0 180,0 0,160" fill="#b4cede" opacity="0.20" />
              <polygon points="0,0 110,0 0,100" fill="#a0bfd4" opacity="0.22" />
              <polygon points="0,0 55,0 0,50" fill="#8db3c9" opacity="0.18" />
            </svg>

            {/* Bottom-right triangles */}
            <svg style={{ position: 'absolute', bottom: 0, right: 0, pointerEvents: 'none', zIndex: 0 }} width="120" height="110" viewBox="0 0 120 110" fill="none">
              <polygon points="120,110 120,30 40,110" fill="#c8dce8" opacity="0.12" />
              <polygon points="120,110 120,60 60,110" fill="#b4cede" opacity="0.10" />
            </svg>

            {/* Content */}
            <div style={{ position: 'relative', zIndex: 20, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'space-between', height: '100%', padding: '5% 7%', textAlign: 'center' }}>

              {/* Header: Org info top-left */}
              <div style={{ width: '100%', textAlign: 'left', marginBottom: '8px' }}>
                <h3 style={{ fontSize: 'clamp(12px, 1.6vw, 16px)', fontWeight: 700, color: '#1e293b', margin: 0, letterSpacing: '-0.01em' }}>{cert.organizationName}</h3>
                {cert.organizationAddress && (
                  <p style={{ fontSize: 'clamp(8px, 1vw, 11px)', color: '#94a3b8', margin: '2px 0 0 0' }}>{cert.organizationAddress}</p>
                )}
                {cert.providerId && (
                  <p style={{ fontSize: 'clamp(8px, 1vw, 11px)', color: '#94a3b8', margin: '2px 0 0 0' }}>Provider ID: {cert.providerId}</p>
                )}
              </div>

              {/* Title */}
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px', marginTop: '4px' }}>
                <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: 'clamp(22px, 3.5vw, 36px)', fontWeight: 600, fontStyle: 'italic', color: '#1e293b', letterSpacing: '0.02em', margin: 0 }}>
                  Certificate of Completion
                </h2>
              </div>

              {/* Body */}
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px', width: '100%', maxWidth: '700px', marginTop: '-4px' }}>
                <p style={{ fontSize: 'clamp(7px, 1vw, 11px)', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.25em', fontWeight: 500, margin: 0 }}>
                  This is to certify that
                </p>

                <div style={{ position: 'relative', padding: '4px 0', width: '100%' }}>
                  <h3 style={{ fontFamily: "'Great Vibes', cursive", fontSize: 'clamp(28px, 5vw, 52px)', color: '#1e293b', margin: 0 }}>
                    {cert.studentName}
                  </h3>
                </div>

                <p style={{ fontSize: 'clamp(7px, 1vw, 11px)', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.2em', fontWeight: 500, margin: 0 }}>
                  Has successfully completed the training program
                </p>

                <h4 style={{ fontFamily: "'Playfair Display', serif", fontSize: 'clamp(14px, 2.2vw, 22px)', fontWeight: 500, fontStyle: 'italic', color: '#5a8fa8', margin: 0, maxWidth: '600px' }}>
                  {cert.courseName}
                </h4>
              </div>

              {/* Bottom: Date | QR | Signature */}
              <div style={{ width: '100%', display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', marginBottom: '6%', padding: '0 2%' }}>
                {/* Date */}
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '2px', minWidth: '25%' }}>
                  <p style={{ fontFamily: "'Playfair Display', serif", fontSize: 'clamp(10px, 1.4vw, 15px)', fontWeight: 500, fontStyle: 'italic', color: '#334155', margin: 0, paddingBottom: '6px', width: '100%', textAlign: 'center' }}>
                    {new Date(cert.issuedAt).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
                  </p>
                  <div style={{ width: '100%', height: '1px', background: '#94a3b8' }} />
                  <p style={{ fontSize: 'clamp(6px, 0.8vw, 9px)', textTransform: 'uppercase', letterSpacing: '0.2em', color: '#94a3b8', fontWeight: 500, margin: '4px 0 0 0' }}>Date Issued</p>
                </div>

                {/* QR Code */}
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px', margin: '0 16px' }}>
                  <div style={{ padding: '4px', border: '1px solid #e2e8f0', borderRadius: '6px', background: 'white' }}>
                    <QRCodeSVG
                      value={verifyUrl}
                      size={72}
                      level="M"
                      fgColor="#4a8da8"
                      bgColor="#ffffff"
                    />
                  </div>
                  <p style={{ fontSize: 'clamp(5px, 0.7vw, 8px)', textTransform: 'uppercase', letterSpacing: '0.15em', color: '#4a8da8', fontWeight: 600, margin: 0 }}>Scan to Verify</p>
                </div>

                {/* Signature */}
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '2px', minWidth: '25%' }}>
                  <div style={{ width: '100%', display: 'flex', alignItems: 'flex-end', justifyContent: 'center', paddingBottom: '6px' }}>
                    <span style={{ fontFamily: "'Great Vibes', cursive", fontSize: 'clamp(16px, 2.5vw, 26px)', color: '#334155' }}>
                      {cert.directorName}
                    </span>
                  </div>
                  <div style={{ width: '100%', height: '1px', background: '#94a3b8' }} />
                  {cert.directorTitle && (
                    <p style={{ fontSize: 'clamp(6px, 0.8vw, 9px)', textTransform: 'uppercase', letterSpacing: '0.15em', color: '#94a3b8', fontWeight: 500, margin: '4px 0 0 0' }}>{cert.directorTitle}</p>
                  )}
                </div>
              </div>

              {/* Footer */}
              <div style={{ width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '2px', marginTop: '12px' }}>
                <p style={{ fontSize: 'clamp(6px, 0.75vw, 9px)', color: '#94a3b8', fontWeight: 500, fontStyle: 'italic', margin: 0 }}>
                  This record shall be retained by CNA or HHA employer for (4) years starting from the date of enrollment.
                </p>
                <p style={{ fontFamily: 'monospace', fontSize: 'clamp(6px, 0.7vw, 8px)', color: '#cbd5e1', margin: 0 }}>
                  Credential ID: {cert.uniqueId} • {cert.organizationName}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Info Cards */}
        <div className="no-print" style={{ width: '100%', maxWidth: '900px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
          <div style={{ background: '#1E293B', border: '1px solid #334155', borderRadius: '20px', padding: '24px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
              <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: 'rgba(16, 185, 129, 0.1)', border: '1px solid rgba(16, 185, 129, 0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <span style={{ color: '#10B981', fontSize: '20px' }}>✓</span>
              </div>
              <span style={{ fontWeight: 600, fontSize: '15px' }}>Registry Verification</span>
            </div>
            <p style={{ color: '#10B981', fontWeight: 600, fontSize: '14px', margin: '0 0 4px 0' }}>✓ Valid Official Document</p>
            <p style={{ color: '#94A3B8', fontSize: '14px', margin: 0, lineHeight: 1.5 }}>This certificate is a valid, recognized credential and has been successfully matched against our central database.</p>
          </div>

          <div style={{ background: '#1E293B', border: '1px solid #334155', borderRadius: '20px', padding: '24px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
              <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: 'rgba(59, 130, 246, 0.1)', border: '1px solid rgba(59, 130, 246, 0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <span style={{ color: '#3B82F6', fontSize: '20px' }}>🔗</span>
              </div>
              <span style={{ fontWeight: 600, fontSize: '15px' }}>Share Credential</span>
            </div>
            <p style={{ color: '#94A3B8', fontSize: '14px', margin: '0 0 16px 0' }}>Allow others to verify this credential by sharing this unique link or ID.</p>
            <div style={{ display: 'flex', alignItems: 'center', background: '#0F172A', padding: '10px 14px', borderRadius: '10px', border: '1px solid #334155' }}>
              <code style={{ flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', fontSize: '12px', color: '#94A3B8' }}>{window.location.href}</code>
              <button
                onClick={() => navigator.clipboard.writeText(window.location.href)}
                style={{ background: 'none', border: 'none', color: '#3B82F6', cursor: 'pointer', fontWeight: 700, fontSize: '13px', padding: '4px 8px', borderRadius: '6px' }}
              >
                Copy
              </button>
            </div>
          </div>
        </div>
      </main>

      <style>{`
        @media print {
          .no-print { display: none !important; }
          body { background: white !important; }
          main { padding: 0 !important; }
          #certificate-container {
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            max-width: none;
            max-height: none;
            box-shadow: none !important;
            border: none !important;
            transform: none !important;
            border-radius: 0 !important;
          }
        }
      `}</style>
    </div>
  );
};

export default CertificatePage;
