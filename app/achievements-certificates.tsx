"use client"

import React, { useState } from "react"
import Image from "next/image"
import { motion, AnimatePresence } from "framer-motion"
import FadeDown from "@/components/animations/FadeDown"
import type { AchievementRow, CertificateRow } from "@/lib/db"

interface AchievementsCertificatesProps {
  achievements: AchievementRow[]
  certificates: CertificateRow[]
}

type TabType = "all" | "achievements" | "certificates"

export default function AchievementsCertificates({
  achievements,
  certificates,
}: AchievementsCertificatesProps) {
  const [activeTab, setActiveTab] = useState<TabType>("all")
  const [previewImage, setPreviewImage] = useState<{ src: string; title: string } | null>(null)

  const showAchievements = activeTab === "all" || activeTab === "achievements"
  const showCertificates = activeTab === "all" || activeTab === "certificates"

  const getCategoryBadge = (category: string) => {
    switch (category) {
      case "jurnal":
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-blue-500/10 text-blue-500 border border-blue-500/20">
            Jurnal Ilmiah
          </span>
        )
      case "prestasi":
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-amber-500/10 text-amber-500 border border-amber-500/20">
            Juara &amp; Prestasi
          </span>
        )
      case "penghargaan":
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-emerald-500/10 text-emerald-500 border border-emerald-500/20">
            Penghargaan
          </span>
        )
      default:
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-text-secondary/10 text-text-secondary border border-text-secondary/20">
            Pencapaian
          </span>
        )
    }
  }

  return (
    <>
      <section
        id="achievements"
        className="w-full max-w-[1440px] mx-auto py-16 md:py-24 cursor-default bg-background relative border-t border-text-secondary/10 overflow-hidden"
      >
        {/* Anchor for certificates shortcut */}
        <div id="certificates" className="absolute top-0 pointer-events-none" />

        {/* Section Header */}
        <FadeDown>
          <div className="px-6 sm:px-10 lg:px-16 mb-10 md:mb-14 w-full">
            <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6">
              <div>
                <h2 className="text-sm font-bold tracking-[0.2em] text-text-secondary uppercase mb-3">
                  Honors &amp; Credentials
                </h2>
                <h3 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-black text-text-primary tracking-tighter">
                  Achievements &amp; Certificates
                </h3>
              </div>

              {/* View Mode Switcher */}
              <div className="flex items-center gap-1.5 p-1.5 rounded-2xl border border-text-secondary/15 bg-thirdary/40 backdrop-blur-md self-start md:self-auto">
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
                  onClick={() => setActiveTab("achievements")}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all duration-300 ${
                    activeTab === "achievements"
                      ? "bg-text-primary text-background shadow-md scale-[1.02]"
                      : "text-text-secondary hover:text-text-primary hover:bg-text-secondary/10"
                  }`}
                >
                  Pencapaian ({achievements.length})
                </button>

                <button
                  type="button"
                  onClick={() => setActiveTab("certificates")}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all duration-300 ${
                    activeTab === "certificates"
                      ? "bg-text-primary text-background shadow-md scale-[1.02]"
                      : "text-text-secondary hover:text-text-primary hover:bg-text-secondary/10"
                  }`}
                >
                  Sertifikat ({certificates.length})
                </button>
              </div>
            </div>
          </div>
        </FadeDown>

        {/* Main Content Grid (Side-by-Side on Desktop) */}
        <div className="px-6 sm:px-10 lg:px-16 w-full">
          <div
            className={`grid gap-8 lg:gap-10 xl:gap-12 transition-all duration-500 ${
              activeTab === "all" ? "grid-cols-1 lg:grid-cols-2 items-start" : "grid-cols-1 max-w-5xl mx-auto"
            }`}
          >
            {/* ===================== Column 1: ACHIEVEMENTS & JOURNALS ===================== */}
            {showAchievements && (
              <div className="flex flex-col space-y-6">
                {/* Column Header */}
                <div className="flex items-center justify-between pb-4 border-b border-text-secondary/15">
                  <div>
                    <h4 className="text-xl font-black text-text-primary tracking-tight">Pencapaian &amp; Jurnal</h4>
                    <p className="text-xs font-medium text-text-secondary">Publikasi Riset &amp; Prestasi Kejuaraan</p>
                  </div>
                  <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-text-secondary/10 text-text-secondary">
                    {achievements.length} Item
                  </span>
                </div>

                {achievements.length === 0 ? (
                  <div className="rounded-2xl border border-text-secondary/15 bg-thirdary/20 p-8 text-center text-sm text-text-secondary">
                    Belum ada pencapaian atau publikasi jurnal yang ditambahkan.
                  </div>
                ) : (
                  <div className="space-y-6">
                    {achievements.map((item, index) => (
                      <motion.div
                        key={item.id}
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true, margin: "-40px" }}
                        transition={{ duration: 0.5, delay: index * 0.1 }}
                        className="group rounded-2xl border border-text-secondary/15 bg-thirdary/30 p-5 sm:p-6 backdrop-blur-sm transition-all duration-300 hover:border-text-primary/40 hover:bg-thirdary/60 hover:shadow-xl hover:-translate-y-1 overflow-hidden"
                      >
                        {/* Proof photo or cover preview if present */}
                        {item.image_url && (
                          <div
                            onClick={() => setPreviewImage({ src: item.image_url!, title: item.title })}
                            className="relative mb-4 w-full overflow-hidden rounded-xl border border-text-secondary/15 bg-background/50 aspect-[21/9] cursor-pointer group/img"
                            title="Klik untuk memperbesar bukti foto"
                          >
                            <Image
                              src={item.image_url}
                              alt={item.title}
                              fill
                              className="object-cover transition-transform duration-700 group-hover/img:scale-105"
                              sizes="(max-width: 1024px) 100vw, 550px"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-background/80 via-transparent to-transparent opacity-60" />
                            <div className="absolute bottom-2 right-2 px-2.5 py-1 rounded-lg bg-background/90 text-text-primary text-[10px] font-bold backdrop-blur-md opacity-0 group-hover/img:opacity-100 transition-opacity">
                              Lihat Foto
                            </div>
                          </div>
                        )}

                        <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
                          <div className="flex items-center gap-2">
                            {getCategoryBadge(item.category)}
                            <span className="text-xs font-semibold text-text-secondary">
                              {item.date}
                            </span>
                          </div>
                        </div>

                        <h5 className="text-lg sm:text-xl font-black text-text-primary tracking-tight leading-snug">
                          {item.title}
                        </h5>

                        <div className="mt-1 flex items-center gap-2">
                          <span className="h-1.5 w-1.5 rounded-full bg-text-primary/60" />
                          <span className="text-xs sm:text-sm font-bold uppercase tracking-wider text-text-primary">
                            {item.issuer}
                          </span>
                        </div>

                        {item.description && (
                          <p className="mt-2.5 text-xs sm:text-sm text-text-secondary leading-relaxed font-medium">
                            {item.description}
                          </p>
                        )}

                        {item.skills && item.skills.length > 0 && (
                          <div className="mt-4 flex flex-wrap gap-1.5 pt-3 border-t border-text-secondary/10">
                            {item.skills.map((skill, i) => (
                              <span
                                key={i}
                                className="text-[10px] font-semibold bg-background/80 text-text-primary px-2 py-0.5 rounded-md border border-text-secondary/15 uppercase tracking-wide"
                              >
                                {skill}
                              </span>
                            ))}
                          </div>
                        )}

                        {item.link_url && (
                          <div className="mt-4 pt-3 border-t border-text-secondary/10">
                            <a
                              href={item.link_url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-1.5 text-xs font-bold text-text-primary hover:underline group/link"
                            >
                              <span>
                                {item.category === "jurnal"
                                  ? "Baca Publikasi Ilmiah / DOI"
                                  : "Lihat Bukti Kredensial Online"}
                              </span>
                              <svg className="w-3.5 h-3.5 transition-transform group-hover/link:translate-x-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                              </svg>
                            </a>
                          </div>
                        )}
                      </motion.div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* ===================== Column 2: CERTIFICATES & LICENSES ===================== */}
            {showCertificates && (
              <div className="flex flex-col space-y-6">
                {/* Column Header */}
                <div className="flex items-center justify-between pb-4 border-b border-text-secondary/15">
                  <div>
                    <h4 className="text-xl font-black text-text-primary tracking-tight">Sertifikat &amp; Lisensi</h4>
                    <p className="text-xs font-medium text-text-secondary">Sertifikasi Industri Terakreditasi</p>
                  </div>
                  <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-text-secondary/10 text-text-secondary">
                    {certificates.length} Sertifikat
                  </span>
                </div>

                {certificates.length === 0 ? (
                  <div className="rounded-2xl border border-text-secondary/15 bg-thirdary/20 p-8 text-center text-sm text-text-secondary">
                    Belum ada sertifikasi yang ditambahkan.
                  </div>
                ) : (
                  <div className="space-y-6">
                    {certificates.map((cert, index) => (
                      <motion.div
                        key={cert.id}
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true, margin: "-40px" }}
                        transition={{ duration: 0.5, delay: index * 0.1 }}
                        className="group rounded-2xl border border-text-secondary/15 bg-thirdary/30 p-5 sm:p-6 backdrop-blur-sm transition-all duration-300 hover:border-text-primary/40 hover:bg-thirdary/60 hover:shadow-xl hover:-translate-y-1 overflow-hidden"
                      >
                        {/* Certificate photo preview if present */}
                        {cert.image_url && (
                          <div
                            onClick={() => setPreviewImage({ src: cert.image_url!, title: cert.title })}
                            className="relative mb-4 w-full overflow-hidden rounded-xl border border-text-secondary/15 bg-background/50 aspect-[21/9] cursor-pointer group/img"
                            title="Klik untuk memperbesar scan sertifikat"
                          >
                            <Image
                              src={cert.image_url}
                              alt={cert.title}
                              fill
                              className="object-cover transition-transform duration-700 group-hover/img:scale-105"
                              sizes="(max-width: 1024px) 100vw, 550px"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-background/80 via-transparent to-transparent opacity-60" />
                            <div className="absolute bottom-2 right-2 px-2.5 py-1 rounded-lg bg-background/90 text-text-primary text-[10px] font-bold backdrop-blur-md opacity-0 group-hover/img:opacity-100 transition-opacity">
                              Lihat Scan
                            </div>
                          </div>
                        )}

                        <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-emerald-500/10 text-emerald-500 border border-emerald-500/20">
                            Terverifikasi
                          </span>

                          <span className="text-xs font-semibold text-text-secondary">
                            Terbit: {cert.issue_date}
                          </span>
                        </div>

                        <h5 className="text-lg sm:text-xl font-black text-text-primary tracking-tight leading-snug">
                          {cert.title}
                        </h5>

                        <div className="mt-1 flex items-center gap-2">
                          <span className="h-1.5 w-1.5 rounded-full bg-text-primary/60" />
                          <span className="text-xs sm:text-sm font-bold uppercase tracking-wider text-text-primary">
                            {cert.issuer}
                          </span>
                        </div>

                        {cert.credential_id && (
                          <div className="mt-2 flex items-center gap-1.5 text-xs text-text-secondary font-mono">
                            <span className="text-[10px] uppercase font-bold text-text-secondary/80">ID:</span>
                            <span className="bg-background/80 px-2 py-0.5 rounded border border-text-secondary/15 text-text-primary font-semibold">
                              {cert.credential_id}
                            </span>
                          </div>
                        )}

                        {cert.skills && cert.skills.length > 0 && (
                          <div className="mt-4 flex flex-wrap gap-1.5 pt-3 border-t border-text-secondary/10">
                            {cert.skills.map((skill, i) => (
                              <span
                                key={i}
                                className="text-[10px] font-semibold bg-background/80 text-text-primary px-2 py-0.5 rounded-md border border-text-secondary/15 uppercase tracking-wide"
                              >
                                {skill}
                              </span>
                            ))}
                          </div>
                        )}

                        {cert.credential_url && (
                          <div className="mt-4 pt-3 border-t border-text-secondary/10">
                            <a
                              href={cert.credential_url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-1.5 text-xs font-bold text-text-primary hover:underline group/link"
                            >
                              <span>Verifikasi Kredensial Resmi</span>
                              <svg className="w-3.5 h-3.5 transition-transform group-hover/link:translate-x-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                              </svg>
                            </a>
                          </div>
                        )}
                      </motion.div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Lightbox Modal for Photo Preview */}
        <AnimatePresence>
          {previewImage && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="absolute inset-0 bg-background/90 backdrop-blur-md"
                onClick={() => setPreviewImage(null)}
              />

              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="relative z-10 max-w-4xl max-h-[90vh] overflow-hidden rounded-3xl border border-text-secondary/20 bg-background p-4 shadow-2xl flex flex-col items-center"
              >
                <div className="flex w-full items-center justify-between pb-3 border-b border-text-secondary/10">
                  <h4 className="text-sm font-bold text-text-primary truncate pr-4">
                    {previewImage.title}
                  </h4>
                  <button
                    type="button"
                    onClick={() => setPreviewImage(null)}
                    className="p-1.5 rounded-full hover:bg-text-secondary/10 text-text-secondary hover:text-text-primary transition-colors"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>

                <div className="relative mt-3 w-full max-h-[75vh] flex items-center justify-center overflow-hidden rounded-2xl">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={previewImage.src}
                    alt={previewImage.title}
                    className="max-h-[75vh] w-auto object-contain rounded-xl"
                  />
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>
      </section>
    </>
  )
}
