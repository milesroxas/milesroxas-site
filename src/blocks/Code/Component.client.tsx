'use client'
import { Highlight, themes } from 'prism-react-renderer'
import type React from 'react'
import { codeKeys } from '@/utilities/reactKeyDomains'
import { CopyButton } from './CopyButton'

type Props = {
  code: string
  language?: string
}

export const Code: React.FC<Props> = ({ code, language = '' }) => {
  if (!code) return null

  return (
    <Highlight code={code} language={language} theme={themes.vsDark}>
      {({ getLineProps, getTokenProps, tokens }) => (
        <pre className="mx-8 overflow-x-auto rounded border border-border bg-black p-4 text-xs md:mx-14 lg:mx-16">
          {tokens.map((line, i) => (
            <div
              key={codeKeys.fromLine(line, i)}
              {...getLineProps({ className: 'table-row', line })}
            >
              <span className="table-cell select-none text-right text-white/25">{i + 1}</span>
              <span className="table-cell pl-4">
                {line.map((token, tokenIndex) => (
                  <span
                    key={codeKeys.fromToken(token, tokenIndex, i)}
                    {...getTokenProps({ token })}
                  />
                ))}
              </span>
            </div>
          ))}
          <CopyButton code={code} />
        </pre>
      )}
    </Highlight>
  )
}
