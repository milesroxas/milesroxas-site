import * as React from 'react'

export const Width: React.FC<{
  children: React.ReactNode
  className?: string
  width?: number | string
}> = ({ children, className }) => {
  // Don't apply width styles here as they're handled by the parent container
  return <div className={className}>{children}</div>
}
