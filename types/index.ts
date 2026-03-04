import type { User, Organization } from '@prisma/client'

// Extended session user type with role and membership
export interface SessionUser {
  id: string
  name: string
  email: string
  role: 'ADMIN' | 'EDITOR' | 'MEMBER'
  membershipStatus: string | null
}

// User with organization included
export type UserWithOrganization = User & {
  organization: Organization | null
}

// NextAuth module augmentation
declare module 'next-auth' {
  interface Session {
    user: SessionUser
  }

  interface JWT {
    id: string
    role: string
    membershipStatus: string | null
  }
}
