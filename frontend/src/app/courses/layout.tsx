import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "CNACEUS Courses | Online Healthcare Training",
  description: "Explore our catalog of CNACEUS healthcare courses. Complete your healthcare education with our flexible online certifications.",
  alternates: {
    canonical: "/courses",
  },
  openGraph: {
    title: "CNACEUS Courses | Online Healthcare Training",
    description: "Explore our catalog of CNACEUS healthcare courses. Complete your healthcare education with our flexible online certifications.",
    url: "https://cnaceus.excelcommunityliving.website/courses",
  },
};

export default function CoursesLayout({
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
                "name": "Courses",
                "item": "https://cnaceus.excelcommunityliving.website/courses"
              }
            ]
          })
        }}
      />
      {children}
    </>
  );
}
