/**
 * Per-block exceptions to the Phase 6 rules (docs/composer-roadmap.md, D15),
 * keyed by the legacy block's id. `keep` leaves the legacy block in place at
 * the top level. To change a mapping, edit this file and run the script
 * again; nothing is changed in admin.
 *
 * Empty: the dry run of 2026-09-27 read right without exceptions.
 */
export type Override = 'keep'

export const OVERRIDES: Record<string, Override> = {}
