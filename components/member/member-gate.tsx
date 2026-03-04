'use client';

import { useSession } from 'next-auth/react';
import { LoginPrompt } from './login-prompt';

interface MemberGateProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

export function MemberGate({ children, fallback }: MemberGateProps) {
  const { data: session, status } = useSession();

  if (status === 'loading') {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-nafsma-blue border-t-transparent" />
      </div>
    );
  }

  if (!session) {
    return fallback || <LoginPrompt variant="not-logged-in" />;
  }

  const user = session.user as { role?: string; membershipStatus?: string | null };

  if (user.role !== 'MEMBER' && user.role !== 'ADMIN' && user.role !== 'EDITOR') {
    return fallback || <LoginPrompt variant="not-logged-in" />;
  }

  if (user.role === 'MEMBER' && user.membershipStatus === 'EXPIRED') {
    return fallback || <LoginPrompt variant="expired" />;
  }

  if (user.role === 'MEMBER' && user.membershipStatus !== 'ACTIVE') {
    return fallback || <LoginPrompt variant="pending" />;
  }

  return <>{children}</>;
}
