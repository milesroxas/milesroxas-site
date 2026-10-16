import type { Payload } from 'payload'

/**
 * The two inquiry emails, as plain HTML and text through Payload's email
 * adapter (Resend). sas-site renders them with react-email templates in its
 * brand; this site sends the same words without a template system
 * (docs/archive/composer-roadmap.md, Phase 5).
 */

const escapeHtml = (value: string) =>
  value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')

const paragraphs = (lines: string[]) =>
  lines.map((line) => `<p style="margin:0 0 16px">${line}</p>`).join('')

const wrap = (body: string) =>
  `<div style="font-family:system-ui,-apple-system,sans-serif;font-size:15px;line-height:1.5;color:#111;max-width:560px">${body}</div>`

export async function sendInquiryNotificationEmail({
  payload,
  to,
  adminUrl,
  company,
  excerpt,
  reference,
  senderEmail,
  senderName,
  summary,
  typeLabel,
}: {
  payload: Payload
  to: string[]
  adminUrl: string
  company?: string
  excerpt: string
  reference: string
  senderEmail: string
  senderName: string
  summary: { label: string; value: string }[]
  typeLabel: string
}) {
  const from = `${senderName}${company ? ` (${company})` : ''}`
  const rows = summary.map(({ label, value }) => `${label}: ${value}`)
  const text = [
    `${typeLabel} from ${from}, ${senderEmail}`,
    ...rows,
    '',
    excerpt,
    '',
    `Open in the admin: ${adminUrl}`,
    `Reference: ${reference}`,
  ].join('\n')
  const html = wrap(
    paragraphs([
      `<strong>${escapeHtml(typeLabel)}</strong> from ${escapeHtml(from)}, <a href="mailto:${escapeHtml(senderEmail)}">${escapeHtml(senderEmail)}</a>`,
      ...rows.map(escapeHtml),
      escapeHtml(excerpt).replaceAll('\n', '<br>'),
      `<a href="${escapeHtml(adminUrl)}">Open in the admin</a> · ${escapeHtml(reference)}`,
    ]),
  )
  return payload.sendEmail({
    to,
    subject: `${typeLabel} — ${from} · ${reference}`,
    html,
    text,
  })
}

export async function sendInquiryReceivedEmail({
  payload,
  to,
  reference,
  responseTime,
  scheduleUrl,
  senderName,
}: {
  payload: Payload
  to: string
  reference: string
  responseTime: string
  scheduleUrl?: string
  senderName: string
}) {
  const lines = [
    `Hi ${senderName},`,
    `Thanks for getting in touch. Miles has your message and will reply ${responseTime}.`,
    ...(scheduleUrl ? [`If you would rather talk sooner, schedule a call: ${scheduleUrl}`] : []),
    `Your reference is ${reference}.`,
  ]
  const html = wrap(
    paragraphs(
      lines.map((line) =>
        scheduleUrl && line.includes(scheduleUrl)
          ? `If you would rather talk sooner, <a href="${escapeHtml(scheduleUrl)}">schedule a call</a>.`
          : escapeHtml(line),
      ),
    ),
  )
  return payload.sendEmail({
    to,
    subject: `Miles has your message (${reference})`,
    html,
    text: lines.join('\n\n'),
  })
}
