import { useEffect, useRef, useState } from 'react'

/**
 * Wraps children in a fade/slide-in animation that plays whenever the
 * element scrolls into view. Unlike a "once" reveal, this keeps observing
 * forever, so scrolling back up past the element and back down again
 * replays the animation every time.
 *
 * Usage:
 *   <Reveal><div className="step-card">...</div></Reveal>
 *   <Reveal as="span" delay={120}>...</Reveal>
 */
export default function Reveal({ children, as = 'div', delay = 0, className = '', threshold = 0.15, ...rest }) {
  const ref = useRef(null)
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const el = ref.current
    if (!el) return

    // Respect reduced-motion users: show content immediately, no observer.
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      setVisible(true)
      return
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        // No "once" flag here on purpose: toggling both ways is what makes
        // the fade replay every time you scroll up or down past a section.
        setVisible(entry.isIntersecting)
      },
      { threshold, rootMargin: '0px 0px -60px 0px' }
    )

    observer.observe(el)
    return () => observer.disconnect()
  }, [threshold])

  const Tag = as

  return (
    <Tag
      ref={ref}
      className={`reveal ${visible ? 'reveal-visible' : ''} ${className}`.trim()}
      style={delay ? { transitionDelay: `${delay}ms` } : undefined}
      {...rest}
    >
      {children}
    </Tag>
  )
}
