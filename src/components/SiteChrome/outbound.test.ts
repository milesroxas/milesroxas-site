import { describe, expect, it } from 'vitest'
import { outboundLink, validateOutboundUrl } from './outbound'

describe('outboundLink', () => {
  it('names the host without www', () => {
    expect(outboundLink({ url: 'https://www.nextstreet.com/' })).toEqual({
      href: 'https://www.nextstreet.com/',
      label: 'Visit nextstreet.com',
    })
  })

  it('falls back to a generic label for a host too long for a phone', () => {
    expect(outboundLink({ url: 'https://www.suitsandsandals.com' })?.label).toBe('Visit site')
    expect(outboundLink({ url: 'https://shop.the-long-brand-name-company.co.uk' })?.label).toBe(
      'Visit site',
    )
  })

  it('prefers the authored label', () => {
    expect(outboundLink({ url: 'https://nextstreet.com', label: ' Open the shop ' })?.label).toBe(
      'Open the shop',
    )
  })

  it('is null without a usable URL', () => {
    expect(outboundLink(null)).toBeNull()
    expect(outboundLink({ url: '' })).toBeNull()
    expect(outboundLink({ url: 'nextstreet.com' })).toBeNull()
    expect(outboundLink({ url: 'javascript:alert(1)' })).toBeNull()
  })
})

describe('validateOutboundUrl', () => {
  it('accepts empty and absolute http(s)', () => {
    expect(validateOutboundUrl(undefined)).toBe(true)
    expect(validateOutboundUrl('')).toBe(true)
    expect(validateOutboundUrl('https://nextstreet.com')).toBe(true)
  })

  it('refuses a bare host', () => {
    expect(validateOutboundUrl('nextstreet.com')).toMatch(/https:\/\//)
  })
})
