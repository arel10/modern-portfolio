import Header from "@/components/Header"
import Footer from "@/components/Footer"
import Hero from "./hero"
import About from "./about"
import Journey from "./journey"
import TechStack from "./tech-stack"
import Project from "./project"
import AchievementsCertificates from "./achievements-certificates"
import Contact from "./contact"
import {
  fetchProfile,
  fetchRoles,
  fetchStats,
  fetchSocials,
  fetchExperiences,
  fetchEducations,
  fetchAchievements,
  fetchCertificates,
  fetchProjects,
  fetchTechStack,
} from "@/lib/data-fetcher"

// Halaman publik di-cache di CDN dan diperbarui otomatis tiap 60 detik.
// Saat data diubah dari admin, cache juga langsung di-purge lewat
// /api/admin/revalidate supaya perubahan tetap instan.
export const revalidate = 60

export default async function Home() {
  const [
    profile,
    roles,
    stats,
    socials,
    experiences,
    educations,
    achievements,
    certificates,
    projects,
    techStack,
  ] = await Promise.all([
    fetchProfile(),
    fetchRoles(),
    fetchStats(),
    fetchSocials(),
    fetchExperiences(),
    fetchEducations(),
    fetchAchievements(),
    fetchCertificates(),
    fetchProjects(),
    fetchTechStack(),
  ])

  return (
    <>
      <header className="cursor-default sticky top-0 z-50">
        <Header />
      </header>
      <Hero profile={profile} roles={roles} stats={stats} socials={socials} />
      <About profile={profile} />
      <Journey experiences={experiences} educations={educations} />
      <TechStack techStack={techStack} />
      <Project projects={projects} socials={socials} />
      <AchievementsCertificates
        achievements={achievements}
        certificates={certificates}
      />
      <Contact profile={profile} socials={socials} />
      <Footer />
    </>
  )
}
