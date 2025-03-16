import type { Metadata } from 'next/types'
import type { Media } from '@/payload-types'
import configPromise from '@payload-config'
import { getPayload } from 'payload'
import React from 'react'
import PageClient from './page.client'
import Link from 'next/link'

export const revalidate = 600

export default async function Page() {
  const payload = await getPayload({ config: configPromise })

  const works = await payload.find({
    collection: 'works',
    depth: 1,
    limit: 100,
    where: {
      _status: {
        equals: 'published',
      },
    },
  })

  return (
    <div className="pt-24 pb-24">
      <PageClient />
      <div className="container mb-16">
        <div className="prose dark:prose-invert max-w-none">
          <h1>Works</h1>
        </div>
      </div>

      <div className="container">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {works.docs.map((work) => (
            <Link
              href={`/works/${typeof work.slug === 'string' ? work.slug : ''}`}
              key={work.id}
              className="group block"
            >
              <div className="work-card bg-white dark:bg-black rounded-lg overflow-hidden shadow-lg transition-transform duration-200 group-hover:transform group-hover:-translate-y-1">
                {work.heroImage && typeof work.heroImage !== 'string' && (
                  <div className="aspect-video w-full overflow-hidden">
                    <img
                      src={(work.heroImage as Media).url || ''}
                      alt={(work.heroImage as Media).alt || work.title}
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}
                <div className="p-6">
                  <h2 className="text-xl font-bold mb-2">{work.title}</h2>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  )
}

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: 'Works | Portfolio',
    description: 'Explore my collection of works and projects',
  }
}
