import { cleanup, fireEvent, render, screen } from '@testing-library/react'
import { renderToStaticMarkup } from 'react-dom/server'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { ThemeToggle } from './ThemeToggle'

const { useThemeMock } = vi.hoisted(() => ({ useThemeMock: vi.fn() }))

vi.mock('@/providers/Theme', () => ({ useTheme: useThemeMock }))

vi.mock('@tabler/icons-react', () => ({
  IconMoon: (props: Record<string, unknown>) => <svg data-testid="icon-moon" {...props} />,
  IconSun: (props: Record<string, unknown>) => <svg data-testid="icon-sun" {...props} />,
}))

/** The toggle reads the live attribute, not the provider's context. */
const setDocumentTheme = (theme: 'dark' | 'light' | null) => {
  if (theme) document.documentElement.setAttribute('data-theme', theme)
  else document.documentElement.removeAttribute('data-theme')
}

describe('ThemeToggle', () => {
  afterEach(() => {
    cleanup()
    setDocumentTheme(null)
    useThemeMock.mockReset()
  })

  it('offers dark with a moon while the document is light', () => {
    setDocumentTheme('light')
    useThemeMock.mockReturnValue({ setTheme: vi.fn(), theme: 'light' })
    render(<ThemeToggle />)

    expect(screen.queryByTestId('icon-moon')).not.toBeNull()
    expect(screen.queryByTestId('icon-sun')).toBeNull()
    expect(screen.getByRole('button').getAttribute('aria-label')).toBe('Switch to the dark theme')
  })

  it('offers light with a sun while the document is dark', () => {
    setDocumentTheme('dark')
    useThemeMock.mockReturnValue({ setTheme: vi.fn(), theme: 'dark' })
    render(<ThemeToggle />)

    expect(screen.queryByTestId('icon-sun')).not.toBeNull()
    expect(screen.queryByTestId('icon-moon')).toBeNull()
    expect(screen.getByRole('button').getAttribute('aria-label')).toBe('Switch to the light theme')
  })

  it('reads an unstamped document as light, as the stylesheet does', () => {
    useThemeMock.mockReturnValue({ setTheme: vi.fn(), theme: undefined })
    render(<ThemeToggle />)

    expect(screen.queryByTestId('icon-moon')).not.toBeNull()
  })

  it('stores the opposite theme on click, from either side', () => {
    const setTheme = vi.fn()
    setDocumentTheme('dark')
    useThemeMock.mockReturnValue({ setTheme, theme: 'dark' })
    const { unmount } = render(<ThemeToggle />)
    fireEvent.click(screen.getByRole('button'))
    expect(setTheme).toHaveBeenCalledWith('light')
    unmount()

    setDocumentTheme('light')
    render(<ThemeToggle />)
    fireEvent.click(screen.getByRole('button'))
    expect(setTheme).toHaveBeenLastCalledWith('dark')
    expect(setTheme).toHaveBeenCalledTimes(2)
  })

  it('is a plain, non-submitting button', () => {
    setDocumentTheme('light')
    useThemeMock.mockReturnValue({ setTheme: vi.fn(), theme: 'light' })
    render(<ThemeToggle />)

    expect(screen.getByRole('button').getAttribute('type')).toBe('button')
  })

  it('renders the light markup on the server, whatever the client will resolve', () => {
    // `useSiteTheme`'s server snapshot is light, so the static render matches
    // the stylesheet's own default and hydration has nothing to reconcile.
    setDocumentTheme('dark')
    useThemeMock.mockReturnValue({ setTheme: vi.fn(), theme: 'dark' })
    const html = renderToStaticMarkup(<ThemeToggle />)

    expect(html).toContain('data-testid="icon-moon"')
    expect(html).not.toContain('data-testid="icon-sun"')
    expect(html).toContain('Switch to the dark theme')
  })
})
