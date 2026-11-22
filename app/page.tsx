import Header from "@/components/Header"
import Footer from "@/components/Footer"
import Hero from "./hero"
import About from "./about"
import Experience from "./experience"
import TechStack from "./tech-stack"
import Project from "./project"
import Contact from "./contact"
import {
  fetchProfile,
  fetchRoles,
  fetchStats,
  fetchSocials,
  fetchExperiences,
  fetchProjects,
  fetchTechStack,
} from "@/lib/data-fetcher"

// Pastikan halaman publik selalu merender data terkini dari PostgreSQL
export const dynamic = 'force-dynamic'
export const revalidate = 0

export default async function Home() {
  const [profile, roles, stats, socials, experiences, projects, techStack] =
    await Promise.all([
      fetchProfile(),
      fetchRoles(),
      fetchStats(),
      fetchSocials(),
      fetchExperiences(),
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
      <Experience experiences={experiences} />
      <TechStack techStack={techStack} />
      <Project projects={projects} socials={socials} />
      <Contact profile={profile} socials={socials} />
      <Footer />
    </>
  )
}
