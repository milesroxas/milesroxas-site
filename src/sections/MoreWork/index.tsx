import type { Work } from '@/payload-types'
import { MoreWorkIndex } from './MoreWork.client'
import { getMoreWork } from './query'

/** The close of every case study: other works to open next. Renders nothing when there are none. */
export async function MoreWork({
  work,
}: {
  work: Pick<Work, 'id' | 'relatedWorks' | 'categories'>
}) {
  const items = await getMoreWork(work)
  return items.length > 0 ? <MoreWorkIndex items={items} /> : null
}
