'use client'

interface Section {
  _type: string
  title?: string
  heading?: string
}

interface TableOfContentsProps {
  sections: Section[]
  activeSection: number
}

export function TableOfContents({ sections, activeSection }: TableOfContentsProps) {
  const tocItems = sections
    .map((section, index) => ({
      index,
      title: section.title || section.heading || `Section ${index + 1}`,
      type: section._type,
    }))
    .filter((item) => item.type !== 'titleSection') // Exclude title from TOC

  const scrollToSection = (index: number) => {
    const element = document.querySelector(`[data-section-index="${index}"]`)
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }
  }

  return (
    <nav className="space-y-1">
      <h2 className="text-sm font-semibold text-text-secondary uppercase tracking-wider mb-4">
        Contents
      </h2>
      {tocItems.map((item) => (
        <button
          key={item.index}
          onClick={() => scrollToSection(item.index)}
          className={`
            w-full text-left px-3 py-2 rounded-lg text-sm transition-colors
            ${activeSection === item.index
              ? 'bg-brand/10 text-brand font-medium'
              : 'text-text-secondary hover:bg-bg-secondary hover:text-text-primary'
            }
          `}
        >
          {item.title}
        </button>
      ))}
    </nav>
  )
}
