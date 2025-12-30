import configPromise from '@payload-config'
import { type NextRequest, NextResponse } from 'next/server'
import { getPayload } from 'payload'

interface VerifyPasswordRequest {
  workId: number
  password: string
}

interface VerifyPasswordResponse {
  verified: boolean
  error?: string
}

export async function POST(request: NextRequest): Promise<NextResponse<VerifyPasswordResponse>> {
  try {
    const body = (await request.json()) as Partial<VerifyPasswordRequest>
    const { workId, password } = body

    if (!workId || !password) {
      return NextResponse.json(
        { verified: false, error: 'Work ID and password are required' },
        { status: 400 },
      )
    }

    const payload = await getPayload({ config: configPromise })

    // Fetch the work with overrideAccess to get password field
    const work = await payload.findByID({
      collection: 'works',
      id: workId,
      overrideAccess: true,
    })

    if (!work) {
      return NextResponse.json({ verified: false, error: 'Work not found' }, { status: 404 })
    }

    // If work is not password protected, allow access
    if (!work.isPasswordProtected) {
      return NextResponse.json({ verified: true })
    }

    // Verify password matches
    const isCorrect = work.password === password

    return NextResponse.json({ verified: isCorrect })
  } catch (error) {
    console.error('Password verification error:', error)
    return NextResponse.json({ verified: false, error: 'Verification failed' }, { status: 500 })
  }
}
