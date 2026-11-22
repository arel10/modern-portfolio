import React from "react"

const GITHUB_URL = process.env.NEXT_PUBLIC_GITHUB_URL || "https://github.com/afcha"
const LINKEDIN_URL = "https://www.linkedin.com/in/afcha-arel-pratama-472721310/"
const INSTAGRAM_URL = "https://instagram.com"

export default function Footer() {
  const currentYear = new Date().getFullYear()

  return (
    <footer className="w-full border-t border-text-secondary/10 bg-background py-8">
      <div className="max-w-7xl mx-auto px-6 md:px-12 flex flex-col md:flex-row justify-between items-center gap-6">
        <div className="text-center md:text-left">
          <p className="text-sm font-medium text-text-secondary">
            &copy; {currentYear} Afcha Arel Pratama Portfolio. All rights reserved.
          </p>
          <p className="text-xs font-medium text-text-secondary/70 mt-1">
            Built with Next.js &amp; Tailwind CSS
          </p>
        </div>
        <div className="flex flex-wrap justify-center items-center gap-6">
          <a href={GITHUB_URL} target="_blank" rel="noopener noreferrer" className="text-text-secondary hover:text-text-primary transition-colors text-xs font-bold uppercase tracking-widest">
            GitHub
          </a>
          <a href={LINKEDIN_URL} target="_blank" rel="noopener noreferrer" className="text-text-secondary hover:text-text-primary transition-colors text-xs font-bold uppercase tracking-widest">
            LinkedIn
          </a>
          <a href={INSTAGRAM_URL} target="_blank" rel="noopener noreferrer" className="text-text-secondary hover:text-text-primary transition-colors text-xs font-bold uppercase tracking-widest">
            Instagram
          </a>
        </div>
      </div>
    </footer>
  )
}
