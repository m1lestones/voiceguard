import { useEffect } from 'react'

function clamp01(value: number): number {
  if (Number.isNaN(value)) return 0
  return Math.min(1, Math.max(0, value))
}

export function useScrollTheme() {
  useEffect(() => {
    const root = document.documentElement

    const prefersReducedMotion =
      typeof window !== 'undefined' &&
      window.matchMedia &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches

    if (prefersReducedMotion) {
      root.style.setProperty('--scroll-t', '0')
      return
    }

    let raf = 0

    const update = () => {
      raf = 0
      const doc = document.documentElement
      const max = Math.max(1, doc.scrollHeight - window.innerHeight)
      const scrollY = window.scrollY || 0
      const t = clamp01(scrollY / max)
      root.style.setProperty('--scroll-t', t.toFixed(4))

      if (scrollY > 48) root.dataset.scrolled = '1'
      else delete root.dataset.scrolled
    }

    const onScroll = () => {
      if (raf) return
      raf = window.requestAnimationFrame(update)
    }

    update()
    window.addEventListener('scroll', onScroll, { passive: true })
    window.addEventListener('resize', onScroll)

    return () => {
      window.removeEventListener('scroll', onScroll)
      window.removeEventListener('resize', onScroll)
      if (raf) window.cancelAnimationFrame(raf)
    }
  }, [])
}
