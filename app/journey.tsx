"use client"

import React, { useState } from "react"
import Image from "next/image"
import { motion } from "framer-motion"
import FadeDown from "@/components/animations/FadeDown"
import type { ExperienceRow, EducationRow, OrganizationRow } from "@/lib/db"

interface JourneyProps {
  experiences: ExperienceRow[]
  organizations: OrganizationRow[]
  educations: EducationRow[]
}

type TabType = "all" | "experience" | "organization" | "education"

export default function Journey({
  experiences,
  organizations,
  educations,
}: JourneyProps) {
  const [activeTab, setActiveTab] = useState<TabType>("all")

  const hasOrganizations = organizations.length > 0
  const showExperience = activeTab === "all" || activeTab === "experience"
  const showEducation = activeTab === "all" || activeTab === "education"
  const showOrganization =
    hasOrganizations &&
    (activeTab === "all" || activeTab === "organization")
  const showJourneyColumns = activeTab !== "organization"

  return (
    <section
      id="experience"
      className="w-full max-w-[1440px] mx-auto py-16 md:py-24 cursor-default bg-background relative border-t border-text-secondary/10"
    >
      {/* Anchor for education shortcut link */}
      <div id="education" className="absolute top-0 pointer-events-none" />

      {/* Section Header */}
      <FadeDown>
        <div className="px-6 sm:px-10 lg:px-16 mb-10 md:mb-14 w-full">
          <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6">
            <div>
              <h2 className="text-sm font-bold tracking-[0.2em] text-text-secondary uppercase mb-3">
                Career & Academic Journey
              </h2>
              <h3 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-black text-text-primary tracking-tighter">
                Milestones &amp; Experience
              </h3>
            </div>

            {/* View Mode Switcher */}
            <div className="flex flex-wrap items-center gap-1.5 p-1.5 rounded-2xl border border-text-secondary/15 bg-thirdary/40 backdrop-blur-md self-start md:self-auto">
              <button
                type="button"
                onClick={() => setActiveTab("all")}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all duration-300 ${
                  activeTab === "all"
                    ? "bg-text-primary text-background shadow-md scale-[1.02]"
                    : "text-text-secondary hover:text-text-primary hover:bg-text-secondary/10"
                }`}
              >
                <span className="hidden sm:inline">Berdampingan</span>
                <span className="sm:hidden">Semua</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab("experience")}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all duration-300 ${
                  activeTab === "experience"
                    ? "bg-text-primary text-background shadow-md scale-[1.02]"
                    : "text-text-secondary hover:text-text-primary hover:bg-text-secondary/10"
                }`}
              >
                Pengalaman ({experiences.length})
              </button>

              {hasOrganizations && (
                <button
                  type="button"
                  onClick={() => setActiveTab("organization")}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all duration-300 ${
                    activeTab === "organization"
                      ? "bg-text-primary text-background shadow-md scale-[1.02]"
                      : "text-text-secondary hover:text-text-primary hover:bg-text-secondary/10"
                  }`}
                >
                  Organisasi ({organizations.length})
                </button>
              )}

              <button
                type="button"
                onClick={() => setActiveTab("education")}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all duration-300 ${
                  activeTab === "education"
                    ? "bg-text-primary text-background shadow-md scale-[1.02]"
                    : "text-text-secondary hover:text-text-primary hover:bg-text-secondary/10"
                }`}
              >
                Pendidikan ({educations.length})
              </button>
            </div>
          </div>
        </div>
      </FadeDown>

      {/* Main Content Grid (Side-by-Side on Desktop) */}
      <div className="px-6 sm:px-10 lg:px-16 w-full">
        {showJourneyColumns && (
        <div
          className={`grid gap-8 lg:gap-10 xl:gap-12 transition-all duration-500 ${
            activeTab === "all" ? "grid-cols-1 lg:grid-cols-2 items-start" : "grid-cols-1 max-w-5xl mx-auto"
          }`}
        >
          {/* ===================== Column 1: WORK EXPERIENCE ===================== */}
          {showExperience && (
            <div className="flex flex-col space-y-6">
              {/* Column Header */}
              <div className="flex items-center justify-between pb-4 border-b border-text-secondary/15">
                <div>
                  <h4 className="text-xl font-black text-text-primary tracking-tight">Work Experience</h4>
                  <p className="text-xs font-medium text-text-secondary">Jejak Karir &amp; Profesional</p>
                </div>
                <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-text-secondary/10 text-text-secondary">
                  {experiences.length} Posisi
                </span>
              </div>

              {/* Experience Timeline */}
              {experiences.length === 0 ? (
                <div className="rounded-2xl border border-text-secondary/15 bg-thirdary/20 p-8 text-center text-sm text-text-secondary">
                  Belum ada riwayat pengalaman kerja.
                </div>
              ) : (
                <div className="relative pl-6 sm:pl-8 space-y-6">
                  {/* Vertical Timeline Guide Line */}
                  <div
                    aria-hidden="true"
                    className="absolute left-3 sm:left-4 top-3 bottom-3 w-px bg-text-secondary/20"
                  />

                  {experiences.map((exp, index) => (
                    <motion.div
                      key={exp.id}
                      initial={{ opacity: 0, y: 25 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true, margin: "-50px" }}
                      transition={{ duration: 0.5, delay: index * 0.1 }}
                      className="group relative"
                    >
                      {/* Timeline Node Dot */}
                      <span
                        className={`absolute -left-6 sm:-left-8 top-5 z-10 flex h-6 w-6 sm:h-7 sm:w-7 items-center justify-center rounded-full border-2 text-[10px] font-black shadow-sm transition-transform duration-300 group-hover:scale-110 ${
                          index === 0
                            ? "border-text-primary bg-text-primary text-background ring-4 ring-text-primary/10"
                            : "border-text-secondary/30 bg-background text-text-secondary group-hover:border-text-primary group-hover:text-text-primary"
                        }`}
                      >
                        {String(index + 1).padStart(2, "0")}
                      </span>

                      {/* Card Content */}
                      <div className="rounded-2xl border border-text-secondary/15 bg-thirdary/30 p-5 sm:p-6 backdrop-blur-sm transition-all duration-300 hover:border-text-primary/40 hover:bg-thirdary/60 hover:shadow-xl hover:-translate-y-1">
                        <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
                          <span className="inline-flex items-center rounded-full border border-text-secondary/15 bg-background/80 px-2.5 py-0.5 text-[10px] sm:text-[11px] font-bold uppercase tracking-wider text-text-secondary">
                            {exp.date_range}
                          </span>

                          <span className="text-xs font-bold text-text-primary/80 uppercase tracking-widest">
                            {exp.company}
                          </span>
                        </div>

                        <h5 className="text-lg sm:text-xl font-black text-text-primary tracking-tight leading-snug group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r group-hover:from-text-primary group-hover:to-text-secondary transition-colors">
                          {exp.role}
                        </h5>

                        <p className="mt-2 text-xs sm:text-sm text-text-secondary leading-relaxed font-medium">
                          {exp.description}
                        </p>

                        {exp.skills && exp.skills.length > 0 && (
                          <div className="mt-4 flex flex-wrap gap-1.5 pt-3 border-t border-text-secondary/10">
                            {exp.skills.map((skill, i) => (
                              <span
                                key={i}
                                className="text-[10px] font-semibold bg-background/80 text-text-primary px-2 py-0.5 rounded-md border border-text-secondary/15 uppercase tracking-wide"
                              >
                                {skill}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* ===================== Column 2: EDUCATION ===================== */}
          {showEducation && (
            <div className="flex flex-col space-y-6">
              {/* Column Header */}
              <div className="flex items-center justify-between pb-4 border-b border-text-secondary/15">
                <div>
                  <h4 className="text-xl font-black text-text-primary tracking-tight">Academic Education</h4>
                  <p className="text-xs font-medium text-text-secondary">Latar Belakang Pendidikan &amp; Almamater</p>
                </div>
                <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-text-secondary/10 text-text-secondary">
                  {educations.length} Riwayat
                </span>
              </div>

              {/* Education Cards */}
              {educations.length === 0 ? (
                <div className="rounded-2xl border border-text-secondary/15 bg-thirdary/20 p-8 text-center text-sm text-text-secondary">
                  Belum ada riwayat pendidikan yang ditambahkan.
                </div>
              ) : (
                <div className="space-y-6">
                  {educations.map((edu, index) => (
                    <motion.div
                      key={edu.id}
                      initial={{ opacity: 0, y: 25 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true, margin: "-50px" }}
                      transition={{ duration: 0.5, delay: index * 0.1 }}
                      className="group rounded-2xl border border-text-secondary/15 bg-thirdary/30 p-5 sm:p-6 backdrop-blur-sm transition-all duration-300 hover:border-text-primary/40 hover:bg-thirdary/60 hover:shadow-xl hover:-translate-y-1 overflow-hidden"
                    >
                      {/* Photo preview if present */}
                      {edu.image_url && (
                        <div className="relative mb-4 w-full overflow-hidden rounded-xl border border-text-secondary/15 bg-background/50 aspect-[21/9]">
                          <Image
                            src={edu.image_url}
                            alt={edu.institution}
                            fill
                            className="object-cover transition-transform duration-700 group-hover:scale-105"
                            sizes="(max-width: 1024px) 100vw, 550px"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-background/80 via-transparent to-transparent opacity-60" />
                        </div>
                      )}

                      <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
                        <span className="inline-flex items-center rounded-full border border-text-secondary/15 bg-background/80 px-2.5 py-0.5 text-[10px] sm:text-[11px] font-bold uppercase tracking-wider text-text-secondary">
                          {edu.date_range}
                        </span>

                        {edu.grade && (
                          <span className="inline-flex items-center rounded-full border border-amber-500/30 bg-amber-500/10 px-2.5 py-0.5 text-[11px] font-bold text-amber-500">
                            {edu.grade}
                          </span>
                        )}
                      </div>

                      <h5 className="text-lg sm:text-xl font-black text-text-primary tracking-tight leading-snug">
                        {edu.degree}
                        {edu.field_of_study && (
                          <span className="font-semibold text-text-secondary"> &bull; {edu.field_of_study}</span>
                        )}
                      </h5>

                      <div className="mt-1 flex items-center gap-2">
                        <span className="h-1.5 w-1.5 rounded-full bg-text-primary/60" />
                        <span className="text-xs sm:text-sm font-bold uppercase tracking-wider text-text-primary">
                          {edu.institution}
                        </span>
                      </div>

                      {edu.description && (
                        <p className="mt-3 text-xs sm:text-sm text-text-secondary leading-relaxed font-medium">
                          {edu.description}
                        </p>
                      )}

                      {edu.skills && edu.skills.length > 0 && (
                        <div className="mt-4 flex flex-wrap gap-1.5 pt-3 border-t border-text-secondary/10">
                          {edu.skills.map((skill, i) => (
                            <span
                              key={i}
                              className="text-[10px] font-semibold bg-background/80 text-text-primary px-2 py-0.5 rounded-md border border-text-secondary/15 uppercase tracking-wide"
                            >
                              {skill}
                            </span>
                          ))}
                        </div>
                      )}
                    </motion.div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
        )}

        {/* ===================== Organizations ===================== */}
        {showOrganization && (
          <div
            className={
              activeTab === "all" ? "mt-12 lg:mt-16" : "max-w-5xl mx-auto"
            }
          >
            <div className="flex items-center justify-between pb-4 border-b border-text-secondary/15">
              <div>
                <h4 className="text-xl font-black text-text-primary tracking-tight">
                  Organizations &amp; Community
                </h4>
                <p className="text-xs font-medium text-text-secondary">
                  Pengalaman Organisasi, Komunitas &amp; Kepanitiaan
                </p>
              </div>
              <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-text-secondary/10 text-text-secondary">
                {organizations.length} Organisasi
              </span>
            </div>

            {organizations.length === 0 ? (
              <div className="mt-6 rounded-2xl border border-text-secondary/15 bg-thirdary/20 p-8 text-center text-sm text-text-secondary">
                Belum ada pengalaman organisasi yang ditambahkan.
              </div>
            ) : (
              <div className="mt-6 grid grid-cols-1 gap-6 sm:grid-cols-2 xl:grid-cols-3">
                {organizations.map((org, index) => (
                  <motion.div
                    key={org.id}
                    initial={{ opacity: 0, y: 25 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, margin: "-50px" }}
                    transition={{ duration: 0.5, delay: index * 0.08 }}
                    className="group flex flex-col rounded-2xl border border-text-secondary/15 bg-thirdary/30 p-5 sm:p-6 backdrop-blur-sm transition-all duration-300 hover:border-text-primary/40 hover:bg-thirdary/60 hover:shadow-xl hover:-translate-y-1"
                  >
                    <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
                      <span className="inline-flex items-center rounded-full border border-text-secondary/15 bg-background/80 px-2.5 py-0.5 text-[10px] sm:text-[11px] font-bold uppercase tracking-wider text-text-secondary">
                        {org.date_range}
                      </span>
                      <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-background/70 text-text-secondary transition-colors group-hover:text-text-primary">
                        <IconBuilding />
                      </span>
                    </div>

                    <h5 className="text-lg sm:text-xl font-black text-text-primary tracking-tight leading-snug">
                      {org.role}
                    </h5>

                    <div className="mt-1 flex items-center gap-2">
                      <span className="h-1.5 w-1.5 rounded-full bg-text-primary/60" />
                      <span className="text-xs sm:text-sm font-bold uppercase tracking-wider text-text-primary">
                        {org.name}
                      </span>
                    </div>

                    {org.description && (
                      <p className="mt-3 line-clamp-5 text-xs sm:text-sm text-text-secondary leading-relaxed font-medium">
                        {org.description}
                      </p>
                    )}

                    {org.skills && org.skills.length > 0 && (
                      <div className="mt-auto flex flex-wrap gap-1.5 pt-4">
                        {org.skills.map((skill, i) => (
                          <span
                            key={i}
                            className="text-[10px] font-semibold bg-background/80 text-text-primary px-2 py-0.5 rounded-md border border-text-secondary/15 uppercase tracking-wide"
                          >
                            {skill}
                          </span>
                        ))}
                      </div>
                    )}
                  </motion.div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </section>
  )
}

function IconBuilding() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.8}
      strokeLinecap="round"
      strokeLinejoin="round"
      className="h-4 w-4"
      aria-hidden="true"
    >
      <path d="M3 21h18" />
      <path d="M5 21V5a2 2 0 0 1 2-2h6a2 2 0 0 1 2 2v16" />
      <path d="M15 9h2a2 2 0 0 1 2 2v10" />
      <path d="M9 7h2" />
      <path d="M9 11h2" />
      <path d="M9 15h2" />
    </svg>
  )
}
