"use client"
import Image from "next/image"
import Link from "next/link"
import { useState, useEffect, useRef } from "react"
import FadeDown from "@/components/animations/FadeDown"
import FadeUp from "@/components/animations/FadeUp"
import GlareHover from "@/components/GlareHover"
import { projectSlug } from "@/lib/project-slug"
import type { ProjectRow, SocialRow } from "@/lib/db"

interface ProjectProps {
  projects: ProjectRow[]
  socials: SocialRow[]
}

type ViewMode = "carousel" | "grid"

export default function Project({ projects, socials }: ProjectProps) {
  const [viewMode, setViewMode] = useState<ViewMode>("carousel")
  const sliderRef = useRef<HTMLDivElement>(null)
  const [canScrollLeft, setCanScrollLeft] = useState(false)
  const [canScrollRight, setCanScrollRight] = useState(true)

  const githubUrl = socials.find((s) => s.platform === "github")?.url ?? "#"

  const checkScroll = () => {
    if (sliderRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = sliderRef.current
      setCanScrollLeft(scrollLeft > 10)
      setCanScrollRight(scrollLeft + clientWidth < scrollWidth - 10)
    }
  }

  useEffect(() => {
    checkScroll()
    const current = sliderRef.current
    if (current) {
      current.addEventListener("scroll", checkScroll)
      window.addEventListener("resize", checkScroll)
    }
    return () => {
      if (current) current.removeEventListener("scroll", checkScroll)
      window.removeEventListener("resize", checkScroll)
    }
  }, [projects, viewMode])

  const scroll = (direction: "left" | "right") => {
    if (sliderRef.current) {
      const cardWidth = 420
      const scrollAmount = direction === "left" ? -cardWidth : cardWidth
      sliderRef.current.scrollBy({ left: scrollAmount, behavior: "smooth" })
    }
  }

  return (
    <>
      <section
        id="projects"
        className="w-full max-w-[1440px] mx-auto py-16 md:py-24 cursor-default bg-background relative border-t border-text-secondary/10 overflow-hidden"
      >
        {/* Header with Title & Horizontal Navigation Controls */}
        <FadeDown>
          <div className="px-6 sm:px-10 lg:px-16 mb-8 md:mb-12 w-full">
            <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6">
              <div>
                <h2 className="text-sm font-bold tracking-[0.2em] text-text-secondary uppercase mb-3">
                  Featured Portfolio
                </h2>
                <h3 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-black text-text-primary tracking-tighter">
                  Selected Works
                </h3>
              </div>

              {/* View Switcher & Carousel Controls */}
              <div className="flex flex-wrap items-center gap-3">
                {/* Mode toggle */}
                <div className="flex items-center gap-1 p-1 rounded-2xl border border-text-secondary/15 bg-thirdary/40 backdrop-blur-md">
                  <button
                    type="button"
                    onClick={() => setViewMode("carousel")}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all duration-300 ${
                      viewMode === "carousel"
                        ? "bg-text-primary text-background shadow-md"
                        : "text-text-secondary hover:text-text-primary hover:bg-text-secondary/10"
                    }`}
                  >
                    Geser Horizontal
                  </button>

                  <button
                    type="button"
                    onClick={() => setViewMode("grid")}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all duration-300 ${
                      viewMode === "grid"
                        ? "bg-text-primary text-background shadow-md"
                        : "text-text-secondary hover:text-text-primary hover:bg-text-secondary/10"
                    }`}
                  >
                    Grid View
                  </button>
                </div>

                {/* Arrow navigation buttons (Carousel mode only) */}
                {viewMode === "carousel" && (
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => scroll("left")}
                      disabled={!canScrollLeft}
                      aria-label="Previous project"
                      className="p-2.5 rounded-xl border border-text-secondary/20 bg-background hover:bg-text-secondary/10 text-text-primary disabled:opacity-30 disabled:cursor-not-allowed transition-all shadow-sm hover:scale-105 active:scale-95"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
                      </svg>
                    </button>
                    <button
                      type="button"
                      onClick={() => scroll("right")}
                      disabled={!canScrollRight}
                      aria-label="Next project"
                      className="p-2.5 rounded-xl border border-text-secondary/20 bg-background hover:bg-text-secondary/10 text-text-primary disabled:opacity-30 disabled:cursor-not-allowed transition-all shadow-sm hover:scale-105 active:scale-95"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                      </svg>
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </FadeDown>

        {/* Content: Carousel Mode (Horizontal Scroll with Snap) */}
        {viewMode === "carousel" ? (
          <div className="relative w-full px-6 sm:px-10 lg:px-16">
            <div
              ref={sliderRef}
              className="flex gap-6 overflow-x-auto scroll-smooth snap-x snap-mandatory py-4 no-scrollbar -mx-2 px-2"
              style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
            >
              {projects.map((project, index) => (
                <div
                  key={`carousel-${project.id || index}`}
                  className="w-[88vw] sm:w-[380px] lg:w-[420px] shrink-0 snap-start"
                >
                  <GlareHover className="group flex flex-col h-full bg-background border border-text-secondary/20 hover:border-text-primary/50 rounded-2xl overflow-hidden transition-all duration-500 shadow-sm hover:shadow-2xl hover:-translate-y-1.5">
                    {/* Image Preview */}
                    <div className="relative overflow-hidden aspect-[16/10] bg-text-secondary/5 border-b border-text-secondary/10">
                      <Image
                        src={project.image_path || "/images/hero.jpg"}
                        alt={project.title}
                        fill
                        className="object-cover transition-all duration-700 group-hover:scale-105"
                        sizes="(max-width: 768px) 90vw, 420px"
                      />
                      <div className="absolute top-4 right-4 flex flex-wrap gap-1.5 justify-end z-10 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                        {project.tech.slice(0, 3).map((tech, i) => (
                          <span
                            key={i}
                            className="text-[10px] font-bold bg-background/90 text-text-primary px-2 py-0.5 rounded-md backdrop-blur-md border border-text-secondary/20 uppercase tracking-wider shadow-sm"
                          >
                            {tech}
                          </span>
                        ))}
                        {project.tech.length > 3 && (
                          <span className="text-[10px] font-bold bg-background/90 text-text-primary px-2 py-0.5 rounded-md backdrop-blur-md border border-text-secondary/20 uppercase tracking-wider shadow-sm">
                            +{project.tech.length - 3}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Card Body */}
                    <div className="p-6 flex flex-col flex-grow relative">
                      <div className="absolute top-0 right-6 -translate-y-1/2 bg-background border border-text-secondary/20 px-3 py-0.5 rounded-full text-[10px] font-bold tracking-widest text-text-secondary shadow-sm">
                        {String(index + 1).padStart(2, "0")}
                      </div>

                      <div className="flex justify-between items-start mb-3">
                        <h4 className="text-xl font-black text-text-primary tracking-tight leading-tight group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r group-hover:from-text-primary group-hover:to-text-secondary transition-all duration-300">
                          {project.title}
                        </h4>
                      </div>

                      <p className="text-xs sm:text-sm text-text-secondary font-medium leading-relaxed mb-6 flex-grow line-clamp-3">
                        {project.short_description}
                      </p>

                      <div className="flex items-center justify-between mt-auto pt-4 border-t border-text-secondary/10">
                        <Link
                          href={`/projects/${projectSlug(project)}`}
                          className="text-xs font-bold tracking-[0.2em] uppercase text-text-primary flex items-center gap-2 group/btn cursor-pointer"
                        >
                          View Details
                          <span className="w-6 h-[2px] bg-text-primary group-hover/btn:w-10 transition-all duration-300"></span>
                        </Link>
                        <a
                          href={project.live_demo_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="p-2 border border-text-secondary/20 rounded-full text-text-secondary hover:text-background hover:bg-text-primary hover:border-text-primary transition-all duration-300"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                          </svg>
                        </a>
                      </div>
                    </div>
                  </GlareHover>
                </div>
              ))}
            </div>

            {/* Subtle Horizontal Drag / Scroll Hint */}
            <div className="flex items-center justify-between mt-3 text-xs text-text-secondary font-medium px-1">
              <span className="inline-flex items-center gap-1">
                Geser ke samping untuk melihat karya lainnya &rarr;
              </span>
              <span className="font-mono text-[11px] font-bold">
                Total: {projects.length} Proyek
              </span>
            </div>
          </div>
        ) : (
          /* Content: Grid Mode */
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8 px-6 sm:px-10 lg:px-16">
            {projects.map((project, index) => (
              <FadeUp key={`grid-${project.id || index}`}>
                <GlareHover className="group flex flex-col h-full bg-background border border-text-secondary/20 hover:border-text-primary/50 rounded-2xl overflow-hidden transition-all duration-500 shadow-sm hover:shadow-2xl hover:-translate-y-1.5">
                  <div className="relative overflow-hidden aspect-[16/10] bg-text-secondary/5 border-b border-text-secondary/10">
                    <Image
                      src={project.image_path || "/images/hero.jpg"}
                      alt={project.title}
                      fill
                      className="object-cover transition-all duration-700 group-hover:scale-105"
                      sizes="(max-width: 1024px) 100vw, 450px"
                    />
                    <div className="absolute top-4 right-4 flex flex-wrap gap-1.5 justify-end z-10 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                      {project.tech.slice(0, 3).map((tech, i) => (
                        <span
                          key={i}
                          className="text-[10px] font-bold bg-background/90 text-text-primary px-2 py-0.5 rounded-md backdrop-blur-md border border-text-secondary/20 uppercase tracking-wider shadow-sm"
                        >
                          {tech}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="p-6 flex flex-col flex-grow relative">
                    <div className="absolute top-0 right-6 -translate-y-1/2 bg-background border border-text-secondary/20 px-3 py-0.5 rounded-full text-[10px] font-bold tracking-widest text-text-secondary shadow-sm">
                      {String(index + 1).padStart(2, "0")}
                    </div>

                    <div className="flex justify-between items-start mb-3">
                      <h4 className="text-xl font-black text-text-primary tracking-tight leading-tight group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r group-hover:from-text-primary group-hover:to-text-secondary transition-all duration-300">
                        {project.title}
                      </h4>
                    </div>

                    <p className="text-xs sm:text-sm text-text-secondary font-medium leading-relaxed mb-6 flex-grow line-clamp-3">
                      {project.short_description}
                    </p>

                    <div className="flex items-center justify-between mt-auto pt-4 border-t border-text-secondary/10">
                      <Link
                        href={`/projects/${projectSlug(project)}`}
                        className="text-xs font-bold tracking-[0.2em] uppercase text-text-primary flex items-center gap-2 group/btn cursor-pointer"
                      >
                        View Details
                        <span className="w-6 h-[2px] bg-text-primary group-hover/btn:w-10 transition-all duration-300"></span>
                      </Link>
                      <a
                        href={project.live_demo_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-2 border border-text-secondary/20 rounded-full text-text-secondary hover:text-background hover:bg-text-primary hover:border-text-primary transition-all duration-300"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                        </svg>
                      </a>
                    </div>
                  </div>
                </GlareHover>
              </FadeUp>
            ))}
          </div>
        )}

        {/* View More on GitHub Footer CTA */}
        <FadeUp>
          <div className="mt-12 flex justify-center w-full px-6">
            <a
              href={githubUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-3 px-8 py-3.5 bg-background border border-text-secondary/20 text-text-primary hover:border-text-primary hover:bg-text-primary hover:text-background rounded-xl font-bold tracking-widest text-xs uppercase transition-all duration-300 ease-out group hover:-translate-y-1 hover:scale-[1.02] shadow-sm hover:shadow-xl"
            >
              <span>Explore All Projects on GitHub</span>
              <svg className="w-4 h-4 transition-transform duration-300 group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
              </svg>
            </a>
          </div>
        </FadeUp>

      </section>
    </>
  )
}
