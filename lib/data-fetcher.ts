// ============================================================
// Utility: fetch portfolio data with DB → fallback chain
// Server-side only (digunakan di server components / API routes)
// ============================================================

import {
  getProfile,
  getRoles,
  getQuickStats,
  getSocials,
  getExperiences,
  getEducations,
  getAchievements,
  getCertificates,
  getProjects,
  getTechCategoriesWithItems,
} from './db'

import { cache } from 'react'

import {
  FALLBACK_PROFILE,
  FALLBACK_ROLES,
  FALLBACK_QUICK_STATS,
  FALLBACK_SOCIALS,
  FALLBACK_EXPERIENCES,
  FALLBACK_EDUCATIONS,
  FALLBACK_ACHIEVEMENTS,
  FALLBACK_CERTIFICATES,
  FALLBACK_PROJECTS,
} from './fallback-data'

import type {
  ProfileRow,
  RoleRow,
  QuickStatRow,
  SocialRow,
  ExperienceRow,
  EducationRow,
  AchievementRow,
  CertificateRow,
  ProjectRow,
  TechCategoryRow,
  TechItemRow,
} from './db'

// ─── Helpers ─────────────────────────────────────────────────────────────────

type WithTech = TechCategoryRow & { technologies: TechItemRow[] }

const FALLBACK_TECH: WithTech[] = [
  {
    id: 1, title: 'Frontend', description: 'Framework dan library frontend.', sort_order: 1,
    technologies: [
      { id: 1, category_id: 1, name: 'React.js',    svg_path: './icons/react.svg',      sort_order: 1 },
      { id: 2, category_id: 1, name: 'Next.js',     svg_path: './icons/nextjs.svg',     sort_order: 2 },
      { id: 3, category_id: 1, name: 'Tailwind CSS',svg_path: './icons/tailwindcss.svg',sort_order: 3 },
      { id: 4, category_id: 1, name: 'TypeScript',  svg_path: './icons/typescript.svg', sort_order: 4 },
    ],
  },
  {
    id: 2, title: 'Backend', description: 'Teknologi server-side.', sort_order: 2,
    technologies: [
      { id: 5, category_id: 2, name: 'Node.js',     svg_path: './icons/nodejs.svg',   sort_order: 1 },
      { id: 6, category_id: 2, name: 'Express.js',  svg_path: './icons/express.svg',  sort_order: 2 },
      { id: 7, category_id: 2, name: 'Laravel',     svg_path: './icons/laravel.svg',  sort_order: 3 },
    ],
  },
  {
    id: 3, title: 'Databases', description: 'Sistem basis data.', sort_order: 3,
    technologies: [
      { id: 8, category_id: 3, name: 'PostgreSQL',  svg_path: './icons/postgresql.svg', sort_order: 1 },
      { id: 9, category_id: 3, name: 'MySQL',       svg_path: './icons/mysql.svg',      sort_order: 2 },
    ],
  },
  {
    id: 4, title: 'Tools', description: 'Alat pengembangan & deployment.', sort_order: 4,
    technologies: [
      { id: 10, category_id: 4, name: 'Git',    svg_path: './icons/git.svg',    sort_order: 1 },
      { id: 11, category_id: 4, name: 'GitHub', svg_path: './icons/github.svg', sort_order: 2 },
      { id: 12, category_id: 4, name: 'Docker', svg_path: './icons/docker.svg', sort_order: 3 },
    ],
  },
]

async function safe<T>(fn: () => Promise<T>, fallback: T): Promise<T> {
  try {
    const result = await fn()
    return result ?? fallback
  } catch {
    return fallback
  }
}

// ─── Exports ─────────────────────────────────────────────────────────────────

export const fetchProfile   = (): Promise<ProfileRow>       => safe(getProfile, FALLBACK_PROFILE) as Promise<ProfileRow>
export const fetchRoles     = (): Promise<RoleRow[]>        => safe(getRoles, FALLBACK_ROLES)
export const fetchStats     = (): Promise<QuickStatRow[]>   => safe(getQuickStats, FALLBACK_QUICK_STATS)
export const fetchSocials   = (): Promise<SocialRow[]>      => safe(getSocials, FALLBACK_SOCIALS)
export const fetchExperiences = (): Promise<ExperienceRow[]>=> safe(getExperiences, FALLBACK_EXPERIENCES)
export const fetchEducations = (): Promise<EducationRow[]>  => safe(getEducations, FALLBACK_EDUCATIONS)
export const fetchAchievements = (): Promise<AchievementRow[]> => safe(getAchievements, FALLBACK_ACHIEVEMENTS)
export const fetchCertificates = (): Promise<CertificateRow[]> => safe(getCertificates, FALLBACK_CERTIFICATES)
export const fetchProjects  = cache(
  (): Promise<ProjectRow[]> => safe(getProjects, FALLBACK_PROJECTS)
)
export const fetchTechStack = (): Promise<WithTech[]>       => safe(getTechCategoriesWithItems, FALLBACK_TECH)
