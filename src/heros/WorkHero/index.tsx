import type { Capability, Client, Work } from '@/payload-types'
import { populatedDoc } from '@/utilities/relationshipId'
import {
  WorkHeroCapabilities,
  WorkHeroEyebrow,
  WorkHeroFact,
  WorkHeroFacts,
  WorkHeroHead,
  WorkHeroLockup,
  WorkHeroRoot,
  WorkHeroStage,
  WorkHeroTitle,
} from './parts'
import { WorkHeroMedia } from './WorkHeroMedia'

type Props = Pick<Work, 'capabilities' | 'client' | 'hero' | 'industry' | 'role' | 'slug' | 'title'>

/**
 * The case study opening, the one hero every work has (approved in Paper,
 * "Work Hero"): the client and title, the industry and role opposite, the
 * picture centered below, and the capabilities along the foot. Anything the
 * work leaves empty drops out, and without a picture the opening is only as
 * tall as its copy.
 */
export function WorkHero({ capabilities, client, hero, industry, role, slug, title }: Props) {
  const media = hero?.media && typeof hero.media === 'object' ? hero.media : null
  const clientName = populatedDoc<Client>(client)?.title
  const capabilityNames = (capabilities ?? []).flatMap(
    (capability) => populatedDoc<Capability>(capability)?.title ?? [],
  )
  const facts = [
    { label: 'Industry', value: industry },
    { label: 'Role', value: role },
  ].filter((fact): fact is { label: string; value: string } => Boolean(fact.value))

  return (
    <WorkHeroRoot>
      <WorkHeroHead>
        <WorkHeroLockup>
          <WorkHeroEyebrow>
            {clientName ? `${clientName} Case Study` : 'Case Study'}
          </WorkHeroEyebrow>
          <WorkHeroTitle>{title}</WorkHeroTitle>
        </WorkHeroLockup>
        {facts.length > 0 && (
          <WorkHeroFacts>
            {facts.map(({ label, value }, i) => (
              <WorkHeroFact index={i} key={label} label={label}>
                {value}
              </WorkHeroFact>
            ))}
          </WorkHeroFacts>
        )}
      </WorkHeroHead>
      {media && slug && (
        <WorkHeroStage>
          <WorkHeroMedia media={media} slug={slug} />
        </WorkHeroStage>
      )}
      {capabilityNames.length > 0 && <WorkHeroCapabilities items={capabilityNames} />}
    </WorkHeroRoot>
  )
}
