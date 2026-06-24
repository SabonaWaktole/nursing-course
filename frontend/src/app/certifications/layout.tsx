import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "CNACEUS Certifications | Professional Certifications",
  description: "Verify and manage your CNACEUS online certifications. Our platform ensures trusted healthcare education credentials.",
  alternates: {
    canonical: "/certifications",
  },
  openGraph: {
    title: "CNACEUS Certifications | Professional Certifications",
    description: "Verify and manage your CNACEUS online certifications. Our platform ensures trusted healthcare education credentials.",
    url: "https://cnaceus.excelcommunityliving.website/certifications",
  },
};

export default function CertificationsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "BreadcrumbList",
            "itemListElement": [
              {
                "@type": "ListItem",
                "position": 1,
                "name": "Home",
                "item": "https://cnaceus.excelcommunityliving.website"
              },
              {
                "@type": "ListItem",
                "position": 2,
                "name": "Certifications",
                "item": "https://cnaceus.excelcommunityliving.website/certifications"
              }
            ]
          })
        }}
      />
      {children}
    </>
  );
}
