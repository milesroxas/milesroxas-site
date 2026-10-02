import type { Payload, PayloadRequest } from 'payload'
import type { Inquiry, SiteInfo } from '@/payload-types'
import {
  INQUIRY_BUDGETS,
  INQUIRY_TIMELINES,
  INQUIRY_TYPES,
  inquiryOptionLabel,
} from '@/shared/content/inquiry'
import { getServerSideURL } from '@/utilities/getURL'
import { sendInquiryNotificationEmail, sendInquiryReceivedEmail } from './emails'

/** How much of the brief travels in the notification before it is cut. */
const EXCERPT_MAX_LENGTH = 400

const inquiryAdminUrl = (id: number | string) =>
  `${getServerSideURL()}/admin/collections/inquiries/${id}`

const excerpt = (message: string) =>
  message.length > EXCERPT_MAX_LENGTH
    ? `${message.slice(0, EXCERPT_MAX_LENGTH).trimEnd()}…`
    : message

/**
 * The structured answers, as label/value lines. Only what was actually
 * answered — an empty row in a notification is noise, not information.
 */
const inquirySummary = (inquiry: Inquiry): { label: string; value: string }[] => {
  const rows: { label: string; value: string }[] = []

  const budget = inquiryOptionLabel(INQUIRY_BUDGETS, inquiry.budget)
  if (budget) rows.push({ label: 'Budget', value: budget })

  const timeline = inquiryOptionLabel(INQUIRY_TIMELINES, inquiry.timeline)
  if (timeline) rows.push({ label: 'Timeline', value: timeline })

  if (inquiry.website) rows.push({ label: 'Current site', value: inquiry.website })

  return rows
}

/**
 * Who hears about this inquiry: its owner, when one is set. sas-site also
 * reads an opt-in on each user; this site has one inbox, the Site Info
 * contact address, which the caller falls back to.
 */
function inquiryRecipients(inquiry: Pick<Inquiry, 'assignedTo'>): string[] {
  const owner = inquiry.assignedTo
  return owner && typeof owner === 'object' && owner.email ? [owner.email] : []
}

/**
 * No owner yet (the usual case for a new inquiry): the Site Info contact
 * address catches it, so a lead never lands silently.
 */
function withContactFallback(
  payload: Payload,
  subscribed: string[],
  siteInfo: SiteInfo | null,
): string[] {
  if (subscribed.length > 0) return subscribed
  if (siteInfo?.contactEmail) {
    payload.logger.info('Inquiry: notifying the Site Info contact email.')
    return [siteInfo.contactEmail]
  }
  payload.logger.error(
    'An inquiry arrived with no notification recipients and no site contact email.',
  )
  return subscribed
}

/** The studio's notification. Never rejects: a failed send is logged. */
function notifyTeam(payload: Payload, inquiry: Inquiry, recipients: string[]) {
  if (recipients.length === 0) return Promise.resolve()
  return sendInquiryNotificationEmail({
    payload,
    to: recipients,
    adminUrl: inquiryAdminUrl(inquiry.id),
    company: inquiry.company ?? undefined,
    excerpt: excerpt(inquiry.message),
    reference: inquiry.reference ?? '',
    senderEmail: inquiry.email,
    senderName: inquiry.name,
    summary: inquirySummary(inquiry),
    typeLabel: inquiryOptionLabel(INQUIRY_TYPES, inquiry.type) ?? 'Inquiry',
  }).catch((err: unknown) => {
    payload.logger.error({
      msg: `Inquiry ${inquiry.reference}: team notification failed`,
      err,
    })
  })
}

/** The visitor's receipt. Never rejects: a failed send is logged. */
function notifySender(payload: Payload, inquiry: Inquiry, siteInfo: SiteInfo | null) {
  return sendInquiryReceivedEmail({
    payload,
    to: inquiry.email,
    reference: inquiry.reference ?? '',
    responseTime: siteInfo?.inquiries?.responseTime ?? 'within 2 business days',
    scheduleUrl: siteInfo?.inquiries?.scheduleUrl ?? undefined,
    // First name only: the receipt should read like a person replying.
    senderName: inquiry.name.split(' ')[0] ?? inquiry.name,
  }).catch((err: unknown) => {
    payload.logger.error({ msg: `Inquiry ${inquiry.reference}: receipt to sender failed`, err })
  })
}

/**
 * Fan out the two emails a new inquiry produces: the studio's notification and
 * the visitor's receipt.
 *
 * Everything that can overlap does. This runs on the visitor's own request, so
 * a serial chain of two reads and two sends is time they spend watching a
 * spinner: the reads go together, then both sends go together.
 *
 * Neither send is allowed to fail the request. The inquiry is committed by the
 * time this runs, and a Resend outage must not turn a captured lead into a 500
 * on the form.
 */
export async function deliverInquiryEmails(req: PayloadRequest, inquiry: Inquiry) {
  const { payload } = req

  const [siteInfo, subscribed] = await Promise.all([
    payload.findGlobal({ slug: 'site-info', depth: 0, req }).catch((err: unknown) => {
      payload.logger.error({ msg: 'Inquiry: site info unreadable, falling back to defaults', err })
      return null
    }),
    Promise.resolve(inquiryRecipients(inquiry)),
  ])

  const recipients = withContactFallback(payload, subscribed, siteInfo)

  await Promise.all([
    notifyTeam(payload, inquiry, recipients),
    notifySender(payload, inquiry, siteInfo),
  ])
}
