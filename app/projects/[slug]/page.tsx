import type { Metadata } from "next"
import Image from "next/image"
import Link from "next/link"
import { notFound, permanentRedirect } from "next/navigation"
import Header from "@/components/Header"
import Footer from "@/components/Footer"
import FadeUp from "@/components/animations/FadeUp"
import { fetchProjects } from "@/lib/data-fetcher"
import { findProjectBySlug, projectSlug } from "@/lib/project-slug"

export const revalidate = 60
export const dynamicParams = true

interface ProjectPageProps {
  params: Promise<{ slug: string }>
}

const baseUrl =
  process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000"

function projectImage(project: { image_path: string }): string {
  return project.image_path || "/images/hero.jpg"
}

export async function generateStaticParams() {
  const projects = await fetchProjects()
  return projects.map((project) => ({ slug: projectSlug(project) }))
}

export async function generateMetadata({
  params,
}: ProjectPageProps): Promise<Metadata> {
  const { slug } = await params
  const projects = await fetchProjects()
  const project = findProjectBySlug(projects, slug)

  if (!project) {
    return { title: "Project tidak ditemukan" }
  }

  const canonical = `/projects/${projectSlug(project)}`
  const image = new URL(projectImage(project), baseUrl).toString()

  return {
    title: project.title,
    description: project.short_description,
    alternates: { canonical },
    openGraph: {
      type: "article",
      title: project.title,
      description: project.short_description,
      url: canonical,
      images: [{ url: image, alt: project.title }],
    },
    twitter: {
      card: "summary_large_image",
      title: project.title,
      description: project.short_description,
      images: [image],
    },
  }
}

export default async function ProjectDetailPage({ params }: ProjectPageProps) {
  const { slug } = await params
  const projects = await fetchProjects()
  const project = findProjectBySlug(projects, slug)

  if (!project) notFound()

  const canonicalSlug = projectSlug(project)
  if (slug.toLowerCase() !== canonicalSlug) {
    permanentRedirect(`/projects/${canonicalSlug}`)
  }

  const index = projects.findIndex((item) => item.id === project.id)
  const previous = index > 0 ? projects[index - 1] : null
  const next =
    index >= 0 && index < projects.length - 1 ? projects[index + 1] : null

  const hasLiveDemo = Boolean(project.live_demo_url?.trim())
  const hasRepo = Boolean(project.github_url?.trim())

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "CreativeWork",
    name: project.title,
    description: project.short_description,
    image: new URL(projectImage(project), baseUrl).toString(),
    url: new URL(canonicalSlug, baseUrl).toString(),
    dateCreated: project.created_at_label || undefined,
    keywords: project.tech.join(", "),
    creator: {
      "@type": "Person",
      name: "Afcha Arel Pratama",
    },
  }

  return (
    <main className="min-h-screen bg-background">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <Header />

      <article className="mx-auto w-full max-w-[1280px] px-6 pb-20 pt-32 sm:px-10 md:pt-40 lg:px-16">
        {/* Breadcrumb */}
        <FadeUp>
          <nav
            aria-label="Breadcrumb"
            className="mb-6 flex flex-wrap items-center gap-2 text-[11px] font-bold uppercase tracking-[0.18em] text-text-secondary"
          >
            <Link href="/" className="transition-colors hover:text-text-primary">
              Home
            </Link>
            <span aria-hidden="true" className="opacity-50">
              /
            </span>
            <Link
              href="/#projects"
              className="transition-colors hover:text-text-primary"
            >
              Projects
            </Link>
            <span aria-hidden="true" className="opacity-50">
              /
            </span>
            <span className="truncate text-text-primary normal-case tracking-normal">
              {project.title}
            </span>
          </nav>
        </FadeUp>

        <div className="grid gap-10 lg:grid-cols-[minmax(0,1fr)_340px] lg:gap-14">
          {/* Main content */}
          <div className="min-w-0">
            <FadeUp>
              <div className="flex flex-wrap items-center gap-2">
                <span className="rounded-full border border-text-secondary/15 bg-thirdary/60 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.16em] text-text-secondary">
                  {project.is_private_repo ? "Private Project" : "Case Study"}
                </span>
                {project.created_at_label && (
                  <span className="rounded-full border border-text-secondary/15 bg-thirdary/60 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.16em] text-text-secondary">
                    {project.created_at_label}
                  </span>
                )}
              </div>

              <h1 className="mt-5 text-4xl font-black leading-[1.05] tracking-tighter text-text-primary sm:text-5xl md:text-6xl">
                {project.title}
              </h1>

              <p className="mt-5 max-w-3xl text-sm font-medium leading-relaxed text-text-secondary sm:text-base">
                {project.short_description}
              </p>

              {project.tech.length > 0 && (
                <div className="mt-6 flex flex-wrap gap-2">
                  {project.tech.map((tech) => (
                    <span
                      key={tech}
                      className="rounded-lg border border-text-secondary/15 bg-background px-2.5 py-1 text-[11px] font-bold uppercase tracking-wider text-text-primary"
                    >
                      {tech}
                    </span>
                  ))}
                </div>
              )}
            </FadeUp>

            <FadeUp delay={0.08}>
              <div className="relative mt-10 aspect-[16/10] w-full overflow-hidden rounded-3xl border border-text-secondary/15 bg-thirdary/40 shadow-xl">
                <Image
                  src={projectImage(project)}
                  alt={project.title}
                  fill
                  priority
                  sizes="(max-width: 1024px) 100vw, 860px"
                  className="object-cover"
                />
              </div>
            </FadeUp>

            <FadeUp delay={0.12}>
              <section className="mt-14">
                <div className="flex items-end justify-between gap-4 border-b border-text-secondary/15 pb-4">
                  <h2 className="text-2xl font-black tracking-tight text-text-primary sm:text-3xl">
                    Key Features
                  </h2>
                  <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-text-secondary">
                    {project.features.length} Fitur
                  </span>
                </div>

                {project.features.length > 0 ? (
                  <ul className="mt-6 grid gap-3 sm:grid-cols-2">
                    {project.features.map((feature, featureIndex) => (
                      <li
                        key={feature}
                        className="group flex items-start gap-3 rounded-2xl border border-text-secondary/10 bg-thirdary/30 p-4 transition-colors duration-300 hover:border-text-primary/30 hover:bg-thirdary/60"
                      >
                        <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full border border-text-secondary/20 bg-background text-[10px] font-black text-text-primary">
                          {String(featureIndex + 1).padStart(2, "0")}
                        </span>
                        <span className="text-sm font-semibold leading-relaxed text-text-primary">
                          {feature}
                        </span>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="mt-6 text-sm font-medium text-text-secondary">
                    Detail fitur belum ditambahkan.
                  </p>
                )}
              </section>
            </FadeUp>
          </div>

          {/* Sidebar */}
          <aside className="lg:sticky lg:top-28 lg:self-start">
            <FadeUp delay={0.16}>
              <div className="rounded-3xl border border-text-secondary/15 bg-thirdary/30 p-6 backdrop-blur-sm">
                <h2 className="text-[10px] font-bold uppercase tracking-[0.2em] text-text-secondary">
                  Project Details
                </h2>

                <dl className="mt-5 space-y-4 text-sm">
                  <div className="flex items-start justify-between gap-4">
                    <dt className="font-medium text-text-secondary">Dibuat</dt>
                    <dd className="text-right font-bold text-text-primary">
                      {project.created_at_label || "Tidak diketahui"}
                    </dd>
                  </div>
                  <div className="flex items-start justify-between gap-4">
                    <dt className="font-medium text-text-secondary">Jumlah Tech</dt>
                    <dd className="text-right font-bold text-text-primary">
                      {project.tech.length} teknologi
                    </dd>
                  </div>
                  <div className="flex items-start justify-between gap-4">
                    <dt className="font-medium text-text-secondary">Repository</dt>
                    <dd className="text-right font-bold text-text-primary">
                      {project.is_private_repo ? "Private" : "Public"}
                    </dd>
                  </div>
                </dl>

                <div className="mt-6 flex flex-col gap-3 border-t border-text-secondary/15 pt-6">
                  {hasLiveDemo ? (
                    <a
                      href={project.live_demo_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center justify-center gap-2 rounded-xl bg-text-primary px-5 py-3 text-xs font-bold uppercase tracking-[0.16em] text-background transition-transform duration-300 hover:-translate-y-0.5"
                    >
                      Live Demo
                      <svg
                        className="h-3.5 w-3.5"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                        />
                      </svg>
                    </a>
                  ) : (
                    <span className="inline-flex cursor-not-allowed items-center justify-center rounded-xl border border-text-secondary/20 px-5 py-3 text-xs font-bold uppercase tracking-[0.16em] text-text-secondary opacity-60">
                      Live Demo Belum Tersedia
                    </span>
                  )}

                  {project.is_private_repo ? (
                    <span className="inline-flex cursor-not-allowed items-center justify-center gap-2 rounded-xl border border-text-secondary/20 px-5 py-3 text-xs font-bold uppercase tracking-[0.16em] text-text-secondary opacity-60">
                      <svg
                        className="h-3.5 w-3.5"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                        />
                      </svg>
                      Private Repo
                    </span>
                  ) : hasRepo ? (
                    <a
                      href={project.github_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center justify-center gap-2 rounded-xl border border-text-secondary/25 px-5 py-3 text-xs font-bold uppercase tracking-[0.16em] text-text-primary transition-colors duration-300 hover:border-text-primary"
                    >
                      Source Code
                      <svg
                        className="h-3.5 w-3.5"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                        />
                      </svg>
                    </a>
                  ) : null}
                </div>

                <Link
                  href="/#projects"
                  className="mt-4 inline-flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.16em] text-text-secondary transition-colors hover:text-text-primary"
                >
                  <svg
                    className="h-3.5 w-3.5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M15 19l-7-7 7-7"
                    />
                  </svg>
                  Semua Project
                </Link>
              </div>
            </FadeUp>
          </aside>
        </div>

        {/* Prev / Next navigation */}
        {(previous || next) && (
          <FadeUp delay={0.2}>
            <nav
              aria-label="Project lainnya"
              className="mt-16 grid gap-4 border-t border-text-secondary/15 pt-8 sm:grid-cols-2"
            >
              {previous ? (
                <Link
                  href={`/projects/${projectSlug(previous)}`}
                  className="group flex flex-col gap-1 rounded-2xl border border-text-secondary/15 bg-thirdary/20 p-5 transition-all duration-300 hover:-translate-y-0.5 hover:border-text-primary/40 hover:bg-thirdary/50"
                >
                  <span className="inline-flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.18em] text-text-secondary">
                    <svg
                      className="h-3 w-3"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M15 19l-7-7 7-7"
                      />
                    </svg>
                    Sebelumnya
                  </span>
                  <span className="text-base font-black tracking-tight text-text-primary">
                    {previous.title}
                  </span>
                </Link>
              ) : (
                <span aria-hidden="true" />
              )}

              {next && (
                <Link
                  href={`/projects/${projectSlug(next)}`}
                  className="group flex flex-col items-end gap-1 rounded-2xl border border-text-secondary/15 bg-thirdary/20 p-5 text-right transition-all duration-300 hover:-translate-y-0.5 hover:border-text-primary/40 hover:bg-thirdary/50"
                >
                  <span className="inline-flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.18em] text-text-secondary">
                    Berikutnya
                    <svg
                      className="h-3 w-3"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M9 5l7 7-7 7"
                      />
                    </svg>
                  </span>
                  <span className="text-base font-black tracking-tight text-text-primary">
                    {next.title}
                  </span>
                </Link>
              )}
            </nav>
          </FadeUp>
        )}
      </article>

      <Footer />
    </main>
  )
}
