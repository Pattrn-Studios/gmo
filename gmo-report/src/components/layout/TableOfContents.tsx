'use client'

interface Section {
  _type: string
  title?: string
  heading?: string
}

interface TableOfContentsProps {
  sections: Section[]
  activeSection: number
  isExpanded?: boolean
}

export function TableOfContents({ sections, activeSection, isExpanded = true }: TableOfContentsProps) {
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
    <nav>
      {/* Header - hidden when collapsed */}
      <h2
        className={`
          text-xs font-bold text-text-secondary uppercase tracking-wider
          transition-all duration-300 whitespace-nowrap
          ${isExpanded ? 'opacity-100 mb-6' : 'opacity-0 h-0 mb-0 overflow-hidden'}
        `}
      >
        In This Report
      </h2>
      <div className="space-y-1">
        {tocItems.map((item, i) => (
          <button
            key={item.index}
            onClick={() => scrollToSection(item.index)}
            title={!isExpanded ? item.title : undefined}
            className={`
              w-full text-left rounded-lg text-sm transition-all duration-200
              flex items-center group
              ${isExpanded ? 'px-4 py-3 gap-3' : 'justify-center py-2'}
              ${activeSection === item.index
                ? 'bg-brand text-white font-medium shadow-md'
                : 'text-text-secondary hover:bg-bg-secondary hover:text-text-primary'
              }
            `}
          >
            <span
              className={`
                w-6 h-6 rounded-full flex items-center justify-center text-xs font-semibold flex-shrink-0
                ${activeSection === item.index
                  ? 'bg-white/20 text-white'
                  : 'bg-bg-tertiary text-text-secondary group-hover:bg-brand/10 group-hover:text-brand'
                }
              `}
            >
              {String(i + 1).padStart(2, '0')}
            </span>
            {isExpanded && <span className="truncate">{item.title}</span>}
          </button>
        ))}
      </div>

      {/* Quick Links - hidden when collapsed */}
      {isExpanded && (
        <div className="mt-8 pt-6 border-t border-line-default">
          <h4 className="text-xs font-semibold text-text-secondary uppercase tracking-wide mb-3">
            Quick Links
          </h4>
          <div className="space-y-2">
            <button
              onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
              className="block text-sm text-text-secondary hover:text-brand transition-colors"
            >
              Back to Top
            </button>
            <button
              onClick={() => window.print()}
              className="block text-sm text-text-secondary hover:text-brand transition-colors"
            >
              Print Report
            </button>
          </div>
        </div>
      )}
    </nav>
  )
}
