'use client'
import { useRouter } from 'next/navigation'
import type React from 'react'
import {
  Pagination as PaginationComponent,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from '@/components/ui/pagination'
import { cn } from '@/utilities/ui'

function PageLink({
  page,
  isActive,
  onClick,
}: {
  page: number
  isActive?: boolean
  onClick: () => void
}) {
  return (
    <PaginationItem>
      <PaginationLink isActive={isActive} onClick={onClick}>
        {page}
      </PaginationLink>
    </PaginationItem>
  )
}

function Gap() {
  return (
    <PaginationItem>
      <PaginationEllipsis />
    </PaginationItem>
  )
}

export const Pagination: React.FC<{
  className?: string
  page: number
  totalPages: number
}> = (props) => {
  const router = useRouter()

  const { className, page, totalPages } = props
  const hasNextPage = page < totalPages
  const hasPrevPage = page > 1

  const hasExtraPrevPages = page - 1 > 1
  const hasExtraNextPages = page + 1 < totalPages

  const goTo = (target: number) => () => {
    router.push(`/posts/page/${target}`)
  }

  return (
    <div className={cn('my-12', className)}>
      <PaginationComponent>
        <PaginationContent>
          <PaginationItem>
            <PaginationPrevious disabled={!hasPrevPage} onClick={goTo(page - 1)} />
          </PaginationItem>

          {hasExtraPrevPages && <Gap />}
          {hasPrevPage && <PageLink onClick={goTo(page - 1)} page={page - 1} />}
          <PageLink isActive onClick={goTo(page)} page={page} />
          {hasNextPage && <PageLink onClick={goTo(page + 1)} page={page + 1} />}
          {hasExtraNextPages && <Gap />}

          <PaginationItem>
            <PaginationNext disabled={!hasNextPage} onClick={goTo(page + 1)} />
          </PaginationItem>
        </PaginationContent>
      </PaginationComponent>
    </div>
  )
}
