/**
 * Force IPv4 DNS resolution
 * This file should be imported before any database connection is made
 */
import dns from 'dns'

// Prefer IPv4 addresses in DNS resolution
dns.setDefaultResultOrder('ipv4first')

export default {}
