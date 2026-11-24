"use client"
import FadeDown from "@/components/animations/FadeDown"
import FadeUp from "@/components/animations/FadeUp"
import type { TechCategoryRow, TechItemRow } from "@/lib/db"

type TechWithItems = TechCategoryRow & { technologies: TechItemRow[] }

interface TechStackProps {
  techStack: TechWithItems[]
}

export default function TechStack({ techStack }: TechStackProps) {
  return (
    <section
      id="techstack"
      className="w-full max-w-[1440px] mx-auto py-16 md:py-24 cursor-default bg-background relative border-t border-text-secondary/10 overflow-hidden"
    >
      <FadeDown>
        <div className="px-6 sm:px-10 lg:px-16 mb-10 md:mb-14 w-full text-left">
          <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4">
            <div>
              <h2 className="text-sm font-bold tracking-[0.2em] text-text-secondary uppercase mb-3">
                Skills &amp; Ecosystem
              </h2>
              <h3 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-black text-text-primary tracking-tighter">
                My Tech Stack
              </h3>
            </div>
            <p className="text-xs sm:text-sm text-text-secondary font-medium max-w-md">
              Kumpulan alat, bahasa pemrograman, dan framework yang saya gunakan secara profesional untuk membangun produk digital berkinerja tinggi.
            </p>
          </div>
        </div>
      </FadeDown>

      {/* Multi-Column Bento Category Grid (Spreads Horizontally across screen) */}
      <div className="px-6 sm:px-10 lg:px-16 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8 w-full">
        {techStack.map((category, idx) => (
          <FadeUp key={category.id || idx} delay={idx * 0.08}>
            <div className="group flex flex-col h-full rounded-3xl border border-text-secondary/15 bg-thirdary/30 p-6 sm:p-7 backdrop-blur-sm transition-all duration-300 hover:border-text-primary/40 hover:bg-thirdary/60 hover:shadow-xl hover:-translate-y-1">
              {/* Category Header */}
              <div className="mb-6 pb-4 border-b border-text-secondary/15">
                <div className="flex items-center justify-between gap-2">
                  <h4 className="text-xl font-black text-text-primary tracking-tight">
                    {category.title}
                  </h4>
                  <span className="shrink-0 whitespace-nowrap text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-background border border-text-secondary/15 text-text-secondary">
                    {category.technologies.length} {category.technologies.length === 1 ? 'Tool' : 'Tools'}
                  </span>
                </div>
                {category.description && (
                  <p className="mt-1.5 text-xs text-text-secondary font-medium leading-relaxed">
                    {category.description}
                  </p>
                )}
              </div>

              {/* Technologies Badges Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 content-start">
                {category.technologies.map((tech, techIdx) => (
                  <div
                    key={tech.id || techIdx}
                    className="flex flex-col items-center justify-center p-3 sm:p-3.5 rounded-xl border border-text-secondary/15 bg-background/80 hover:border-text-primary/40 hover:bg-background transition-all duration-300 hover:-translate-y-1 group/item shadow-xs"
                  >
                    <div className="w-8 h-8 mb-2 flex items-center justify-center pointer-events-none group-hover/item:scale-110 transition-transform">
                      {tech.svg_path ? (
                        tech.svg_path.startsWith("<") ? (
                          <div className="w-full h-full" dangerouslySetInnerHTML={{ __html: tech.svg_path }} />
                        ) : (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img src={tech.svg_path} alt={tech.name} className="w-full h-full object-contain tech-icon-img" />
                        )
                      ) : (
                        <div className="w-full h-full flex items-center justify-center font-bold text-sm bg-text-secondary/10 rounded-lg text-text-primary">
                          {tech.name.charAt(0)}
                        </div>
                      )}
                    </div>
                    <span className="text-xs font-bold text-text-primary text-center truncate max-w-full">
                      {tech.name}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </FadeUp>
        ))}
      </div>
    </section>
  )
}
