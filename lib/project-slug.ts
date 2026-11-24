import type { ProjectRow } from './db'

// Slug dipakai untuk URL halaman detail project.
// Format: /projects/{id}-{judul}
// ID di depan membuat URL tetap unik walau ada dua judul yang sama.

export function slugifyProjectTitle(title: string): string {
  return title
    .toLowerCase()
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/&/g, ' and ')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 60)
}

export function projectSlug(
  project: Pick<ProjectRow, 'id' | 'title'>
): string {
  const title = slugifyProjectTitle(project.title)
  return title ? `${project.id}-${title}` : String(project.id)
}

export function findProjectBySlug(
  projects: ProjectRow[],
  slug: string
): ProjectRow | null {
  let decoded = slug
  try {
    decoded = decodeURIComponent(slug)
  } catch {
    // biarkan slug apa adanya kalau decoding gagal
  }
  decoded = decoded.toLowerCase().replace(/\/+$/, '')

  // Cocokkan berdasarkan ID di awal slug (paling tahan terhadap judul yang berubah).
  const idMatch = decoded.match(/^(\d+)/)
  if (idMatch) {
    const id = Number(idMatch[1])
    const byId = projects.find((project) => project.id === id)
    if (byId) return byId
  }

  // Fallback: cocokkan langsung dari judul saja.
  return (
    projects.find(
      (project) => slugifyProjectTitle(project.title) === decoded
    ) ?? null
  )
}
