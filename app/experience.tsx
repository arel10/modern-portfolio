"use client"
import { useRef } from "react"
import { motion, useScroll, useSpring } from "framer-motion"
import FadeDown from "@/components/animations/FadeDown"
import type { ExperienceRow } from "@/lib/db"

interface ExperienceProps {
  experiences: ExperienceRow[]
}

export default function Experience({ experiences }: ExperienceProps) {
  const timelineRef = useRef<HTMLDivElement>(null)

  const { scrollYProgress } = useScroll({
    target: timelineRef,
    offset: ["start center", "end center"],
  })

  const scaleY = useSpring(scrollYProgress, {
    stiffness: 100,
    damping: 30,
    restDelta: 0.001,
  })

  return (
    <section id="experience" className="w-full max-w-7xl mx-auto py-24 md:py-32 cursor-default bg-background relative border-t border-text-secondary/10">
      <FadeDown>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-12 mb-12 sm:mb-16 md:mb-24 w-full text-left">
          <h2 className="text-sm font-bold tracking-[0.2em] text-text-secondary uppercase mb-4">Career Path</h2>
          <h3 className="text-4xl md:text-5xl lg:text-6xl font-black text-text-primary tracking-tighter">Work Experience</h3>
        </div>
      </FadeDown>

      <div className="max-w-5xl ml-0 mr-auto px-4 sm:px-6 md:px-12">
        <div ref={timelineRef} className="relative">
          {/* Timeline rail */}
          <div aria-hidden="true" className="absolute left-[18px] md:left-6 top-[18px] md:top-6 bottom-3 w-px bg-text-secondary/15" />
          {/* Animated scroll progress */}
          <motion.div
            aria-hidden="true"
            style={{ scaleY }}
            className="absolute left-[18px] md:left-6 top-[18px] md:top-6 bottom-3 w-px origin-top bg-text-primary"
          />

          {experiences.length === 0 ? (
            <p className="pl-12 md:pl-28 text-sm font-medium text-text-secondary">No work experience added yet.</p>
          ) : (
            <ol className="flex flex-col gap-6 md:gap-12">
              {experiences.map((exp, index) => (
                <motion.li
                  key={exp.id}
                  initial={{ opacity: 0, y: 40, filter: "blur(5px)" }}
                  whileInView={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                  viewport={{ once: true, margin: "-100px" }}
                  transition={{ duration: 0.8, delay: index * 0.1 }}
                  className="group relative pl-12 md:pl-28"
                >
                  {/* Connector from node to card */}
                  <span
                    aria-hidden="true"
                    className="absolute left-9 md:left-12 top-[18px] md:top-6 h-px w-3 md:w-16 bg-text-secondary/15 transition-colors duration-500 group-hover:bg-text-secondary/40"
                  />

                  {/* Timeline node */}
                  <span
                    className={`absolute left-0 top-0 z-10 flex h-9 w-9 md:h-12 md:w-12 items-center justify-center rounded-full border-2 text-[9px] md:text-[11px] font-black tracking-widest shadow-sm transition-all duration-500 group-hover:scale-110 ${
                      index === 0
                        ? "border-text-primary bg-text-primary text-background ring-4 ring-text-primary/10"
                        : "border-text-secondary/20 bg-background text-text-secondary group-hover:border-text-primary group-hover:text-text-primary"
                    }`}
                  >
                    {String(index + 1).padStart(2, "0")}
                  </span>

                  {/* Card */}
                  <div className="relative rounded-2xl border border-text-secondary/10 bg-thirdary/40 p-5 sm:p-6 md:p-8 shadow-sm transition-all duration-500 hover:-translate-y-1 hover:border-text-secondary/25 hover:bg-thirdary/70 hover:shadow-xl active:scale-[0.995]">
                    <span className="inline-flex items-center gap-2 rounded-full border border-text-secondary/15 bg-background px-2.5 py-1 md:px-3 text-[10px] md:text-[11px] font-bold uppercase tracking-[0.18em] text-text-secondary">
                      <svg className="h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                      {exp.date_range}
                    </span>

                    <h4 className="mt-3 md:mt-4 text-xl sm:text-2xl md:text-3xl font-black leading-tight tracking-tighter text-text-primary">{exp.role}</h4>

                    <div className="mt-1.5 md:mt-2 mb-4 md:mb-5 flex items-center gap-2.5 md:gap-3">
                      <span aria-hidden="true" className="h-px w-4 md:w-5 bg-text-secondary/40" />
                      <h5 className="text-[11px] md:text-sm font-bold uppercase tracking-[0.18em] md:tracking-[0.2em] text-text-secondary">{exp.company}</h5>
                    </div>

                    <p className="text-sm md:text-base text-text-secondary font-medium leading-relaxed mb-5 md:mb-6">{exp.description}</p>

                    <div className="flex flex-wrap gap-1.5 md:gap-2">
                      {exp.skills.map((skill, i) => (
                        <span
                          key={i}
                          className="text-[10px] md:text-xs font-bold bg-background text-text-primary px-2.5 py-1 md:px-3 md:py-1.5 rounded-lg border border-text-secondary/10 uppercase tracking-wider transition-colors duration-300 group-hover:border-text-secondary/25"
                        >
                          {skill}
                        </span>
                      ))}
                    </div>
                  </div>
                </motion.li>
              ))}
            </ol>
          )}

          {experiences.length > 0 && (
            <div className="relative mt-7 md:mt-12 flex h-6 items-center pl-12 md:pl-28">
              <span aria-hidden="true" className="absolute left-[18px] md:left-6 top-1/2 h-2.5 w-2.5 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-text-secondary/40 bg-background" />
              <p className="text-[10px] md:text-xs font-bold uppercase tracking-[0.25em] text-text-secondary">The journey continues</p>
            </div>
          )}
        </div>
      </div>
    </section>
  )
}
