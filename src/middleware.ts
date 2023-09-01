import { withClerkMiddleware, getAuth } from '@clerk/nextjs/server'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { getUserPrivMetadata, updateUserRole } from './lib/user'
import { ROLES } from './config/types'

const privatePaths = ['/profile', "/cc", "/vote", "/dashboard", "/results"]

const isPrivate = (path: string) => privatePaths.find(privatePath => path.includes(privatePath))

export default withClerkMiddleware(async (request: NextRequest) => {
  const path = request.nextUrl.pathname
  const { userId } = getAuth(request)

  if (!isPrivate(path) && !userId) return NextResponse.next()

  if (!userId) {
    const signInUrl = new URL('/sign-in', request.url)
    return NextResponse.redirect(signInUrl)
  }

  const metadata = await getUserPrivMetadata(userId)
  const { cc, role } = metadata

  if (role === undefined) {
    const updateRole = await updateUserRole(userId, ROLES.USER)
    if (updateRole.error) console.error(updateRole)
  }

  if (cc === undefined && path !== "/cc" && !path.includes("api")) {
    const ccUrl = new URL('/cc', request.url)
    return NextResponse.redirect(ccUrl)
  }

  return NextResponse.next()
})

export const config = { matcher: '/((?!_next/image|_next/static|favicon.ico).*)', };