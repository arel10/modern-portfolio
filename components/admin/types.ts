export interface Profile {
  id: number
  full_name: string
  short_name: string
  bio: string
  avatar_url: string
  cv_url: string
  place_of_birth: string | null
  phone: string | null
  email: string | null
  gpa: string | null
  education: string | null
  location_name: string | null
  location_city: string | null
  maps_embed_url: string | null
  who_am_i: string | null
  my_approach: string | null
  is_active?: boolean
  created_at?: string
  updated_at?: string
}

export interface Experience {
  id: number
  company: string
  role: string
  date_range: string
  description: string
  skills: string[]
  sort_order: number
  is_active: boolean
  updated_at?: string
}

export interface Education {
  id: number
  institution: string
  degree: string
  field_of_study: string | null
  date_range: string
  grade: string | null
  description: string | null
  image_url: string | null
  skills: string[]
  sort_order: number
  is_active: boolean
  updated_at?: string
}

export interface Achievement {
  id: number
  title: string
  category: string
  issuer: string
  date: string
  description: string | null
  link_url: string | null
  image_url: string | null
  skills: string[]
  sort_order: number
  is_active: boolean
  created_at?: string
  updated_at?: string
}

export interface Certificate {
  id: number
  title: string
  issuer: string
  issue_date: string
  expiration_date: string | null
  credential_id: string | null
  credential_url: string | null
  image_url: string | null
  skills: string[]
  sort_order: number
  is_active: boolean
  created_at?: string
  updated_at?: string
}

export interface Project {
  id: number
  title: string
  short_description: string
  full_description: string | null
  image_path: string
  created_at_label: string | null
  tech: string[]
  features: string[]
  github_url: string
  live_demo_url: string
  is_private_repo: boolean
  sort_order: number
  is_active: boolean
  updated_at?: string
}

export interface TechCategory {
  id: number
  title: string
  description: string
  sort_order: number
  is_active: boolean
}

export interface TechItem {
  id: number
  category_id: number
  name: string
  svg_path: string
  sort_order: number
  is_active: boolean
}

export interface TechStackData {
  categories: TechCategory[]
  items: TechItem[]
}

export interface Social {
  id: number
  platform: string
  url: string
  username: string | null
  sort_order: number
  is_active: boolean
}

export interface Role {
  id: number
  label: string
  sort_order: number
  is_active: boolean
}

export interface QuickStat {
  id: number
  label: string
  value: string
  message: string
  sort_order: number
  is_active: boolean
}

export interface DashboardStats {
  experiences: number
  educations: number
  achievements: number
  certificates: number
  projects: number
  roles: number
  socials: number
  techCategories: number
  techItems: number
  quickStats: number
}
