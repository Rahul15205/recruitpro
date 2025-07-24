import { withAuth } from "next-auth/middleware"
import { NextRequest } from "next/server"

export default withAuth(
  function middleware(req: NextRequest) {
    // Additional middleware logic can go here
  },
  {
    callbacks: {
      authorized: ({ token, req }) => {
        // Check if user is trying to access admin routes
        if (req.nextUrl.pathname.startsWith('/admin')) {
          return token?.role === 'ADMIN'
        }
        
        // For other protected routes, just check if user is logged in
        return !!token
      },
    },
  }
)

export const config = {
  matcher: ['/admin/:path*', '/profile/:path*']
}
