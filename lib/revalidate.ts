import { revalidatePath } from 'next/cache'

/**
 * Revalidates public pages so any database update in admin panel
 * is instantly reflected on the public website.
 */
export function revalidatePublicPages() {
  try {
    revalidatePath('/', 'page')
    revalidatePath('/', 'layout')
    revalidatePath('/')
  } catch (error) {
    console.error('Error revalidating public pages:', error)
  }
}
