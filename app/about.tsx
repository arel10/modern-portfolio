import ScrollVelocity from "@/components/ScrollVelocity"
import FadeDown from "@/components/animations/FadeDown"
import Fade from "@/components/animations/Fade"
import FadeUp from "@/components/animations/FadeUp"
import Image from "next/image"
import type { ProfileRow } from "@/lib/db"

interface AboutProps {
  profile: ProfileRow
}

export default function About({ profile }: AboutProps) {
  const velocity = 50

  const personalDetails = [
    { label: "Nama Lengkap", value: profile.full_name },
    { label: "Tempat Lahir", value: profile.place_of_birth },
    { label: "Pendidikan", value: profile.education },
    { label: "IPK / GPA", value: profile.gpa },
    { label: "Telepon / WA", value: profile.phone },
    {
      label: "Email",
      value: profile.email,
      isEmail: true,
    },
  ]

  return (
    <section
      id="about"
      className="w-full max-w-[1440px] mx-auto py-16 md:py-24 cursor-default bg-background overflow-hidden border-t border-text-secondary/10"
    >
      <FadeDown>
        <div className="px-6 sm:px-10 lg:px-16 mb-10 md:mb-14 w-full text-left">
          <h2 className="text-sm font-bold tracking-[0.2em] text-text-secondary uppercase mb-3">
            Discover
          </h2>
          <h3 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-black text-text-primary tracking-tighter">
            About Me
          </h3>
        </div>
      </FadeDown>

      {/* Modern Horizontal Bento Grid */}
      <div className="px-6 sm:px-10 lg:px-16 grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8">
        {/* Left Bento: Avatar & Quick Profile Card */}
        <div className="lg:col-span-4 flex flex-col">
          <Fade>
            <div className="relative group rounded-3xl border border-text-secondary/15 bg-thirdary/30 p-4 sm:p-5 backdrop-blur-sm transition-all duration-500 hover:border-text-primary/40 hover:bg-thirdary/50 hover:shadow-2xl h-full flex flex-col justify-between">
              <div className="relative w-full aspect-[4/5] rounded-2xl overflow-hidden border border-text-secondary/15 shadow-inner">
                <Image
                  src={profile.avatar_url || "/images/hero.jpg"}
                  alt={profile.full_name}
                  fill
                  className="object-cover transition-transform duration-700 group-hover:scale-105"
                  sizes="(max-width: 1024px) 100vw, 420px"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-background/90 via-transparent to-transparent opacity-70 group-hover:opacity-30 transition-opacity duration-500" />
              </div>

              <div className="mt-4 pt-3 border-t border-text-secondary/10 flex items-center justify-between">
                <div>
                  <h4 className="text-base font-bold text-text-primary">{profile.full_name}</h4>
                  <p className="text-xs text-text-secondary">{profile.location_city || "Indonesia"}</p>
                </div>
                {profile.cv_url && (
                  <a
                    href={profile.cv_url}
                    download
                    className="inline-flex items-center px-3.5 py-1.5 rounded-xl text-xs font-bold bg-text-primary text-background hover:opacity-90 transition-opacity"
                  >
                    Download CV
                  </a>
                )}
              </div>
            </div>
          </Fade>
        </div>

        {/* Right Bento: Bio Cards + Personal Details Grid */}
        <div className="lg:col-span-8 flex flex-col gap-6">
          {/* Top Row: Who Am I & My Approach Side-by-Side */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <FadeUp delay={0.1}>
              <div className="rounded-3xl border border-text-secondary/15 bg-thirdary/30 p-6 sm:p-7 backdrop-blur-sm h-full flex flex-col justify-start transition-all duration-300 hover:border-text-primary/40 hover:bg-thirdary/50 hover:shadow-lg">
                <h4 className="text-lg font-black text-text-primary tracking-tight mb-3">Who Am I</h4>
                <p className="text-xs sm:text-sm text-text-secondary leading-relaxed font-medium">
                  {profile.who_am_i}
                </p>
              </div>
            </FadeUp>

            <FadeUp delay={0.15}>
              <div className="rounded-3xl border border-text-secondary/15 bg-thirdary/30 p-6 sm:p-7 backdrop-blur-sm h-full flex flex-col justify-start transition-all duration-300 hover:border-text-primary/40 hover:bg-thirdary/50 hover:shadow-lg">
                <h4 className="text-lg font-black text-text-primary tracking-tight mb-3">My Approach</h4>
                <p className="text-xs sm:text-sm text-text-secondary leading-relaxed font-medium">
                  {profile.my_approach}
                </p>
              </div>
            </FadeUp>
          </div>

          {/* Bottom Row: Personal Details Bento Chips (Horizontal 3-column Grid) */}
          <FadeUp delay={0.2}>
            <div className="rounded-3xl border border-text-secondary/15 bg-thirdary/30 p-6 sm:p-7 backdrop-blur-sm transition-all duration-300 hover:border-text-primary/40 hover:bg-thirdary/50 hover:shadow-lg">
              <div className="flex items-center justify-between mb-5 pb-3 border-b border-text-secondary/15">
                <h4 className="text-sm font-black text-text-primary tracking-wider uppercase">
                  Personal Details &amp; Quick Info
                </h4>
                <span className="text-[11px] font-bold text-text-secondary">Verified Profile</span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 sm:gap-4">
                {personalDetails.map((detail, idx) => (
                  <div
                    key={idx}
                    className="p-3.5 rounded-2xl border border-text-secondary/10 bg-background/70 hover:border-text-primary/30 hover:bg-background transition-all duration-300 flex flex-col justify-between"
                  >
                    <div className="flex items-center justify-between text-xs text-text-secondary mb-1">
                      <span className="font-semibold uppercase tracking-wider text-[10px]">
                        {detail.label}
                      </span>
                    </div>
                    {detail.isEmail ? (
                      <a
                        href={`mailto:${detail.value || ''}`}
                        className="text-xs sm:text-sm font-bold text-text-primary hover:underline truncate"
                        title={detail.value ?? undefined}
                      >
                        {detail.value || "—"}
                      </a>
                    ) : (
                      <span className="text-xs sm:text-sm font-bold text-text-primary truncate" title={detail.value ?? undefined}>
                        {detail.value || "—"}
                      </span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </FadeUp>
        </div>
      </div>

      {/* Infinite Scroll Velocity text at bottom */}
      <Fade>
        <div className="mt-14 md:mt-18 pb-2">
          <ScrollVelocity
            texts={["Welcome to My Portfolio", "Fullstack Web & Mobile Developer"]}
            velocity={velocity}
            className="font-black tracking-tighter text-thirdary dark:text-button-hover opacity-50"
          />
        </div>
      </Fade>
    </section>
  )
}
