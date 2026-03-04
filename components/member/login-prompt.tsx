'use client';

import Link from 'next/link';
import { Lock, AlertCircle, Clock } from 'lucide-react';

interface LoginPromptProps {
  variant: 'not-logged-in' | 'expired' | 'pending';
}

export function LoginPrompt({ variant }: LoginPromptProps) {
  if (variant === 'expired') {
    return (
      <div className="max-w-lg mx-auto text-center py-16 px-6">
        <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-amber-100">
          <AlertCircle className="h-8 w-8 text-amber-600" />
        </div>
        <h2 className="text-h3 text-nafsma-blue mb-3">Membership Expired</h2>
        <p className="text-nafsma-warm-gray mb-8 leading-relaxed">
          Your NAFSMA membership has expired. Renew your membership to regain
          access to member resources, webinar recordings, and committee documents.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link
            href="/contact"
            className="inline-flex items-center justify-center px-6 py-3 bg-nafsma-blue text-white font-medium rounded-md hover:bg-nafsma-dark-navy transition-colors"
          >
            Contact Us to Renew
          </Link>
          <Link
            href="/membership"
            className="inline-flex items-center justify-center px-6 py-3 border border-nafsma-blue text-nafsma-blue font-medium rounded-md hover:bg-nafsma-light-blue transition-colors"
          >
            View Membership Details
          </Link>
        </div>
      </div>
    );
  }

  if (variant === 'pending') {
    return (
      <div className="max-w-lg mx-auto text-center py-16 px-6">
        <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-blue-100">
          <Clock className="h-8 w-8 text-nafsma-blue" />
        </div>
        <h2 className="text-h3 text-nafsma-blue mb-3">Membership Pending</h2>
        <p className="text-nafsma-warm-gray mb-8 leading-relaxed">
          Your NAFSMA membership application is being reviewed. You will receive
          an email once your membership has been approved.
        </p>
        <Link
          href="/contact"
          className="inline-flex items-center justify-center px-6 py-3 border border-nafsma-blue text-nafsma-blue font-medium rounded-md hover:bg-nafsma-light-blue transition-colors"
        >
          Contact Us With Questions
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-lg mx-auto text-center py-16 px-6">
      <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-nafsma-light-blue">
        <Lock className="h-8 w-8 text-nafsma-blue" />
      </div>
      <h2 className="text-h3 text-nafsma-blue mb-3">Member Resource</h2>
      <p className="text-nafsma-warm-gray mb-8 leading-relaxed">
        This resource is available to NAFSMA members. Log in to your account or
        join NAFSMA to access newsletters, webinar recordings, committee documents,
        and more.
      </p>
      <div className="flex flex-col sm:flex-row gap-3 justify-center">
        <Link
          href="/login"
          className="inline-flex items-center justify-center px-6 py-3 bg-nafsma-blue text-white font-medium rounded-md hover:bg-nafsma-dark-navy transition-colors"
        >
          Log In
        </Link>
        <Link
          href="/membership/join"
          className="inline-flex items-center justify-center px-6 py-3 border border-nafsma-blue text-nafsma-blue font-medium rounded-md hover:bg-nafsma-light-blue transition-colors"
        >
          Join NAFSMA
        </Link>
      </div>
    </div>
  );
}
