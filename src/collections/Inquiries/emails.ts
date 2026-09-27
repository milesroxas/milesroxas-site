import type { Payload } from 'payload'

/**
 * The two inquiry emails, as plain HTML and text through Payload's email
 * adapter (Resend). sas-site renders them with react-email templates in its
 * brand; this site sends the same words without a template system
 * (docs/composer-roadmap.md, Phase 5).
 */

const escape = (value: string) =>
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
      `<strong>${escape(typeLabel)}</strong> from ${escape(from)}, <a href="mailto:${escape(senderEmail)}">${escape(senderEmail)}</a>`,
      ...rows.map(escape),
      escape(excerpt).replaceAll('\n', '<br>'),
      `<a href="${escape(adminUrl)}">Open in the admin</a> · ${escape(reference)}`,
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
    `Thanks for getting in touch. We have your note and you will hear back ${responseTime}.`,
    ...(scheduleUrl ? [`If you would rather talk sooner, schedule a call: ${scheduleUrl}`] : []),
    `Your reference is ${reference}.`,
  ]
  const html = wrap(
    paragraphs(
      lines.map((line) =>
        scheduleUrl && line.includes(scheduleUrl)
          ? `If you would rather talk sooner, <a href="${escape(scheduleUrl)}">schedule a call</a>.`
          : escape(line),
      ),
    ),
  )
  return payload.sendEmail({
    to,
    subject: `We have your note (${reference})`,
    html,
    text: lines.join('\n\n'),
  })
}
