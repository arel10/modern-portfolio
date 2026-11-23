"use client"

import Image from "next/image"
import { motion } from "framer-motion"
import FadeDown from "@/components/animations/FadeDown"
import type { EducationRow } from "@/lib/db"

interface EducationProps {
  educations: EducationRow[]
}

export default function Education({ educations }: EducationProps) {
  if (!educations || educations.length === 0) {
    return null
  }

  return (
    <section
      id="education"
      className="w-full max-w-7xl mx-auto py-24 md:py-32 cursor-default bg-background relative border-t border-text-secondary/10"
    >
      <FadeDown>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-12 mb-12 sm:mb-16 md:mb-20 w-full text-left">
          <h2 className="text-sm font-bold tracking-[0.2em] text-text-secondary uppercase mb-4">
            Academic Background
          </h2>
          <h3 className="text-4xl md:text-5xl lg:text-6xl font-black text-text-primary tracking-tighter">
            Education
          </h3>
        </div>
      </FadeDown>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-12">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 md:gap-10">
          {educations.map((edu, index) => (
            <motion.div
              key={edu.id}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ duration: 0.6, delay: index * 0.15 }}
              className="group relative flex flex-col rounded-3xl border border-text-secondary/15 bg-thirdary/30 p-6 sm:p-8 backdrop-blur-sm transition-all duration-500 hover:-translate-y-1.5 hover:border-text-primary/40 hover:bg-thirdary/50 hover:shadow-2xl"
            >
              {/* Optional Photo / Campus Image */}
              {edu.image_url ? (
                <div className="relative mb-6 w-full overflow-hidden rounded-2xl border border-text-secondary/15 bg-background/50 aspect-[16/9]">
                  <Image
                    src={edu.image_url}
                    alt={edu.institution}
                    fill
                    className="object-cover transition-transform duration-700 ease-out group-hover:scale-105"
                    sizes="(max-width: 1024px) 100vw, 600px"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-background/70 via-transparent to-transparent opacity-60" />
                  <div className="absolute bottom-3 left-4 right-4 flex items-center justify-between">
                    <span className="inline-flex items-center gap-1.5 rounded-full border border-text-secondary/20 bg-background/90 px-3 py-1 text-[11px] font-bold uppercase tracking-wider text-text-primary backdrop-blur-md shadow-sm">
                      <svg
                        className="h-3.5 w-3.5 text-text-secondary"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                        aria-hidden="true"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                        />
                      </svg>
                      {edu.date_range}
                    </span>

                    {edu.grade && (
                      <span className="inline-flex items-center gap-1.5 rounded-full border border-text-secondary/20 bg-background/90 px-3 py-1 text-[11px] font-bold text-text-primary backdrop-blur-md shadow-sm">
                        <svg
                          className="h-3.5 w-3.5 text-amber-500"
                          fill="currentColor"
                          viewBox="0 0 24 24"
                          aria-hidden="true"
                        >
                          <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" />
                        </svg>
                        {edu.grade}
                      </span>
                    )}
                  </div>
                </div>
              ) : (
                <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
                  <span className="inline-flex items-center gap-1.5 rounded-full border border-text-secondary/15 bg-background px-3 py-1 text-[11px] font-bold uppercase tracking-wider text-text-secondary">
                    <svg
                      className="h-3.5 w-3.5"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                      aria-hidden="true"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                      />
                    </svg>
                    {edu.date_range}
                  </span>

                  {edu.grade && (
                    <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-500/20 bg-emerald-500/10 px-3 py-1 text-[11px] font-bold text-emerald-600 dark:text-emerald-400">
                      <svg
                        className="h-3.5 w-3.5 text-emerald-500"
                        fill="currentColor"
                        viewBox="0 0 24 24"
                        aria-hidden="true"
                      >
                        <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" />
                      </svg>
                      {edu.grade}
                    </span>
                  )}
                </div>
              )}

              {/* Institution Title & Degree */}
              <div className="flex-1">
                <div className="flex items-start justify-between gap-3 mb-2">
                  <h4 className="text-2xl sm:text-3xl font-black tracking-tight text-text-primary leading-tight">
                    {edu.institution}
                  </h4>
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl border border-text-secondary/15 bg-background text-text-primary shadow-sm">
                    <svg
                      className="h-5 w-5"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                      aria-hidden="true"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M12 14l9-5-9-5-9 5 9 5z"
                      />
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z"
                      />
                    </svg>
                  </span>
                </div>

                <div className="mb-4 flex flex-wrap items-center gap-2">
                  <span className="text-sm sm:text-base font-bold text-text-primary/90">
                    {edu.degree}
                  </span>
                  {edu.field_of_study && (
                    <>
                      <span className="text-text-secondary/40">•</span>
                      <span className="text-sm sm:text-base font-semibold text-text-secondary">
                        {edu.field_of_study}
                      </span>
                    </>
                  )}
                </div>

                {edu.description && (
                  <p className="mb-6 text-sm sm:text-base font-medium leading-relaxed text-text-secondary whitespace-pre-line">
                    {edu.description}
                  </p>
                )}

                {edu.skills && edu.skills.length > 0 && (
                  <div className="mt-auto pt-4 border-t border-text-secondary/10">
                    <span className="text-[10px] uppercase font-bold tracking-widest text-text-secondary block mb-2.5">
                      Fokus &amp; Kompetensi
                    </span>
                    <div className="flex flex-wrap gap-2">
                      {edu.skills.map((skill, sIdx) => (
                        <span
                          key={sIdx}
                          className="rounded-lg border border-text-secondary/15 bg-background px-2.5 py-1 text-xs font-semibold text-text-primary transition-colors hover:border-text-primary/40"
                        >
                          {skill}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
