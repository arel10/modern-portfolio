import type { Metadata } from "next"
import { Poppins } from "next/font/google"
import "../styles/globals.css"
import PageLoader from "@/components/PageLoader"
import AnalyticsTracker from "@/components/AnalyticsTracker"

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["400", "600"],
  variable: "--font-poppins",
})

const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000"
const ownerName = "Afcha Arel Pratama"
const siteTitle = process.env.NEXT_PUBLIC_SITE_TITLE || `${ownerName} | Portfolio`
const avatarUrl = "/images/hero.jpg"

export const metadata: Metadata = {
  metadataBase: new URL(baseUrl),
  title: {
    default: siteTitle,
    template: `%s | ${siteTitle}`,
  },
  description: `Personal portfolio of ${ownerName}. Fullstack Developer & Product Development specialist with experience in Next.js, Node.js, PostgreSQL, Flutter.`,
  keywords: ["Portfolio", "Software Developer", "Fullstack Developer", "Web Development", "Next.js", "React", "Node.js", "TypeScript", "Flutter"],
  authors: [{ name: ownerName }],
  creator: ownerName,
  openGraph: {
    type: "website",
    locale: "id_ID",
    url: "/",
    title: siteTitle,
    description: `Personal portfolio of ${ownerName}. Fullstack Developer & Product Development specialist.`,
    siteName: siteTitle,
    images: [
      {
        url: avatarUrl,
        width: 1200,
        height: 630,
        alt: `${ownerName} Portfolio`,
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: siteTitle,
    description: `Personal portfolio of ${ownerName}. Fullstack Developer & Product Development specialist.`,
    images: [avatarUrl],
  },
  alternates: {
    canonical: "/",
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="id">
      <body className={`${poppins.className} antialiased`}>
        <PageLoader />
        <AnalyticsTracker />
        {children}
      </body>
    </html>
  )
}
