'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Header } from '@/components/header';
import { Footer } from '@/components/footer';
import { CheckCircle2 } from 'lucide-react';

const orgTypes = [
  { value: 'FLOOD_DISTRICT', label: 'Flood Control District' },
  { value: 'STORMWATER_UTILITY', label: 'Stormwater Utility' },
  { value: 'STATE_AGENCY', label: 'State Agency' },
  { value: 'MUNICIPALITY', label: 'Municipality / County' },
  { value: 'ASSOCIATE', label: 'Associate (Private Firm / Consultant)' },
  { value: 'OTHER', label: 'Other' },
];

const stateOptions = [
  'AL','AK','AZ','AR','CA','CO','CT','DE','FL','GA','HI','ID','IL','IN','IA',
  'KS','KY','LA','ME','MD','MA','MI','MN','MS','MO','MT','NE','NV','NH','NJ',
  'NM','NY','NC','ND','OH','OK','OR','PA','RI','SC','SD','TN','TX','UT','VT',
  'VA','WA','WV','WI','WY','DC',
];

const referralOptions = [
  'Current NAFSMA Member',
  'NAFSMA Website',
  'Conference / Event',
  'Trade Publication',
  'Search Engine',
  'Social Media',
  'Other',
];

export default function MembershipJoinPage() {
  const [formData, setFormData] = useState({
    organizationName: '',
    organizationType: '',
    contactName: '',
    contactEmail: '',
    contactTitle: '',
    contactPhone: '',
    address: '',
    city: '',
    state: '',
    zip: '',
    website: '',
    populationServed: '',
    employeeCount: '',
    federalProjects: '',
    referralSource: '',
    comments: '',
  });
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');

  const isAssociate = formData.organizationType === 'ASSOCIATE';

  function handleChange(
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setSubmitting(true);

    try {
      const res = await fetch('/api/membership', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Failed to submit application');
      }

      setSubmitted(true);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  }

  if (submitted) {
    return (
      <>
        <Header />
        <main className="min-h-[60vh] flex items-center justify-center py-16 px-4">
          <div className="max-w-lg text-center">
            <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
              <CheckCircle2 className="h-8 w-8 text-green-600" />
            </div>
            <h1 className="text-h2 text-nafsma-blue mb-4">
              Application Received
            </h1>
            <p className="text-nafsma-warm-gray mb-3 leading-relaxed">
              Thank you for your interest in NAFSMA membership. We have received
              your application and will review it promptly.
            </p>
            <p className="text-nafsma-warm-gray mb-8 leading-relaxed">
              A confirmation email has been sent to{' '}
              <strong>{formData.contactEmail}</strong>. If you have questions,
              contact{' '}
              <a
                href="mailto:jennifer@nafsma.org"
                className="text-nafsma-teal hover:text-nafsma-blue font-medium"
              >
                jennifer@nafsma.org
              </a>
              .
            </p>
            <Link
              href="/"
              className="inline-flex items-center px-6 py-3 bg-nafsma-blue text-white font-medium rounded-md hover:bg-nafsma-dark-navy transition-colors"
            >
              Return to Homepage
            </Link>
          </div>
        </main>
        <Footer />
      </>
    );
  }

  return (
    <>
      <Header />
      <main className="bg-nafsma-light-blue min-h-screen">
        {/* Header */}
        <section className="bg-nafsma-blue text-white py-12">
          <div className="container mx-auto px-4 text-center max-w-2xl">
            <h1 className="text-h2-mobile md:text-h2 text-white mb-3">
              Membership Application
            </h1>
            <p className="text-blue-100">
              Complete the form below to apply for NAFSMA membership. Our team
              will review your application and follow up within 5 business days.
            </p>
          </div>
        </section>

        {/* Form */}
        <div className="container mx-auto px-4 py-10 max-w-3xl">
          <form
            onSubmit={handleSubmit}
            className="bg-white rounded-lg shadow-sm border p-6 md:p-8 space-y-8"
          >
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-md p-3">
                {error}
              </div>
            )}

            {/* Organization Info */}
            <fieldset>
              <legend className="text-lg font-semibold text-nafsma-blue mb-4 pb-2 border-b w-full">
                Organization Information
              </legend>
              <div className="grid md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                  <label htmlFor="organizationName" className="block text-sm font-medium text-nafsma-warm-gray mb-1">
                    Organization Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    id="organizationName"
                    name="organizationName"
                    type="text"
                    required
                    value={formData.organizationName}
                    onChange={handleChange}
                    className="w-full rounded-md border border-gray-300 px-3 py-2.5 text-sm focus:border-nafsma-blue focus:ring-1 focus:ring-nafsma-blue focus:outline-none"
                  />
                </div>
                <div>
                  <label htmlFor="organizationType" className="block text-sm font-medium text-nafsma-warm-gray mb-1">
                    Organization Type <span className="text-red-500">*</span>
                  </label>
                  <select
                    id="organizationType"
                    name="organizationType"
                    required
                    value={formData.organizationType}
                    onChange={handleChange}
                    className="w-full rounded-md border border-gray-300 px-3 py-2.5 text-sm focus:border-nafsma-blue focus:ring-1 focus:ring-nafsma-blue focus:outline-none bg-white"
                  >
                    <option value="">Select type...</option>
                    {orgTypes.map((t) => (
                      <option key={t.value} value={t.value}>
                        {t.label}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label htmlFor="website" className="block text-sm font-medium text-nafsma-warm-gray mb-1">
                    Website
                  </label>
                  <input
                    id="website"
                    name="website"
                    type="url"
                    value={formData.website}
                    onChange={handleChange}
                    placeholder="https://"
                    className="w-full rounded-md border border-gray-300 px-3 py-2.5 text-sm focus:border-nafsma-blue focus:ring-1 focus:ring-nafsma-blue focus:outline-none"
                  />
                </div>
              </div>
            </fieldset>

            {/* Contact Info */}
            <fieldset>
              <legend className="text-lg font-semibold text-nafsma-blue mb-4 pb-2 border-b w-full">
                Primary Contact
              </legend>
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="contactName" className="block text-sm font-medium text-nafsma-warm-gray mb-1">
                    Full Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    id="contactName"
                    name="contactName"
                    type="text"
                    required
                    value={formData.contactName}
                    onChange={handleChange}
                    className="w-full rounded-md border border-gray-300 px-3 py-2.5 text-sm focus:border-nafsma-blue focus:ring-1 focus:ring-nafsma-blue focus:outline-none"
                  />
                </div>
                <div>
                  <label htmlFor="contactEmail" className="block text-sm font-medium text-nafsma-warm-gray mb-1">
                    Email <span className="text-red-500">*</span>
                  </label>
                  <input
                    id="contactEmail"
                    name="contactEmail"
                    type="email"
                    required
                    value={formData.contactEmail}
                    onChange={handleChange}
                    className="w-full rounded-md border border-gray-300 px-3 py-2.5 text-sm focus:border-nafsma-blue focus:ring-1 focus:ring-nafsma-blue focus:outline-none"
                  />
                </div>
                <div>
                  <label htmlFor="contactTitle" className="block text-sm font-medium text-nafsma-warm-gray mb-1">
                    Title / Position
                  </label>
                  <input
                    id="contactTitle"
                    name="contactTitle"
                    type="text"
                    value={formData.contactTitle}
                    onChange={handleChange}
                    className="w-full rounded-md border border-gray-300 px-3 py-2.5 text-sm focus:border-nafsma-blue focus:ring-1 focus:ring-nafsma-blue focus:outline-none"
                  />
                </div>
                <div>
                  <label htmlFor="contactPhone" className="block text-sm font-medium text-nafsma-warm-gray mb-1">
                    Phone
                  </label>
                  <input
                    id="contactPhone"
                    name="contactPhone"
                    type="tel"
                    value={formData.contactPhone}
                    onChange={handleChange}
                    className="w-full rounded-md border border-gray-300 px-3 py-2.5 text-sm focus:border-nafsma-blue focus:ring-1 focus:ring-nafsma-blue focus:outline-none"
                  />
                </div>
              </div>
            </fieldset>

            {/* Address */}
            <fieldset>
              <legend className="text-lg font-semibold text-nafsma-blue mb-4 pb-2 border-b w-full">
                Mailing Address
              </legend>
              <div className="grid md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                  <label htmlFor="address" className="block text-sm font-medium text-nafsma-warm-gray mb-1">
                    Street Address
                  </label>
                  <input
                    id="address"
                    name="address"
                    type="text"
                    value={formData.address}
                    onChange={handleChange}
                    className="w-full rounded-md border border-gray-300 px-3 py-2.5 text-sm focus:border-nafsma-blue focus:ring-1 focus:ring-nafsma-blue focus:outline-none"
                  />
                </div>
                <div>
                  <label htmlFor="city" className="block text-sm font-medium text-nafsma-warm-gray mb-1">
                    City
                  </label>
                  <input
                    id="city"
                    name="city"
                    type="text"
                    value={formData.city}
                    onChange={handleChange}
                    className="w-full rounded-md border border-gray-300 px-3 py-2.5 text-sm focus:border-nafsma-blue focus:ring-1 focus:ring-nafsma-blue focus:outline-none"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="state" className="block text-sm font-medium text-nafsma-warm-gray mb-1">
                      State
                    </label>
                    <select
                      id="state"
                      name="state"
                      value={formData.state}
                      onChange={handleChange}
                      className="w-full rounded-md border border-gray-300 px-3 py-2.5 text-sm focus:border-nafsma-blue focus:ring-1 focus:ring-nafsma-blue focus:outline-none bg-white"
                    >
                      <option value="">--</option>
                      {stateOptions.map((s) => (
                        <option key={s} value={s}>
                          {s}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label htmlFor="zip" className="block text-sm font-medium text-nafsma-warm-gray mb-1">
                      ZIP
                    </label>
                    <input
                      id="zip"
                      name="zip"
                      type="text"
                      value={formData.zip}
                      onChange={handleChange}
                      className="w-full rounded-md border border-gray-300 px-3 py-2.5 text-sm focus:border-nafsma-blue focus:ring-1 focus:ring-nafsma-blue focus:outline-none"
                    />
                  </div>
                </div>
              </div>
            </fieldset>

            {/* Conditional: Population or Employees */}
            {formData.organizationType && (
              <fieldset>
                <legend className="text-lg font-semibold text-nafsma-blue mb-4 pb-2 border-b w-full">
                  {isAssociate ? 'Firm Details' : 'Agency Details'}
                </legend>
                <div className="space-y-4">
                  {isAssociate ? (
                    <div>
                      <label htmlFor="employeeCount" className="block text-sm font-medium text-nafsma-warm-gray mb-1">
                        Number of Employees <span className="text-red-500">*</span>
                      </label>
                      <select
                        id="employeeCount"
                        name="employeeCount"
                        required
                        value={formData.employeeCount}
                        onChange={handleChange}
                        className="w-full rounded-md border border-gray-300 px-3 py-2.5 text-sm focus:border-nafsma-blue focus:ring-1 focus:ring-nafsma-blue focus:outline-none bg-white"
                      >
                        <option value="">Select range...</option>
                        <option value="1-30">1 - 30</option>
                        <option value="31-100">31 - 100</option>
                        <option value="100+">100+</option>
                      </select>
                    </div>
                  ) : (
                    <div>
                      <label htmlFor="populationServed" className="block text-sm font-medium text-nafsma-warm-gray mb-1">
                        Population Served <span className="text-red-500">*</span>
                      </label>
                      <select
                        id="populationServed"
                        name="populationServed"
                        required
                        value={formData.populationServed}
                        onChange={handleChange}
                        className="w-full rounded-md border border-gray-300 px-3 py-2.5 text-sm focus:border-nafsma-blue focus:ring-1 focus:ring-nafsma-blue focus:outline-none bg-white"
                      >
                        <option value="">Select range...</option>
                        <option value="100000-or-fewer">100,000 or fewer</option>
                        <option value="100001-300000">100,001 - 300,000</option>
                        <option value="300001-500000">300,001 - 500,000</option>
                        <option value="500001-1000000">500,001 - 1,000,000</option>
                        <option value="1000001-2000000">1,000,001 - 2,000,000</option>
                        <option value="2000001+">2,000,001+</option>
                      </select>
                    </div>
                  )}

                  <div>
                    <label htmlFor="federalProjects" className="block text-sm font-medium text-nafsma-warm-gray mb-1">
                      Federal Flood/Stormwater Projects
                    </label>
                    <textarea
                      id="federalProjects"
                      name="federalProjects"
                      rows={3}
                      value={formData.federalProjects}
                      onChange={handleChange}
                      placeholder="Briefly describe any current or past federal flood or stormwater projects..."
                      className="w-full rounded-md border border-gray-300 px-3 py-2.5 text-sm focus:border-nafsma-blue focus:ring-1 focus:ring-nafsma-blue focus:outline-none resize-y"
                    />
                  </div>
                </div>
              </fieldset>
            )}

            {/* Additional Info */}
            <fieldset>
              <legend className="text-lg font-semibold text-nafsma-blue mb-4 pb-2 border-b w-full">
                Additional Information
              </legend>
              <div className="space-y-4">
                <div>
                  <label htmlFor="referralSource" className="block text-sm font-medium text-nafsma-warm-gray mb-1">
                    How did you hear about NAFSMA?
                  </label>
                  <select
                    id="referralSource"
                    name="referralSource"
                    value={formData.referralSource}
                    onChange={handleChange}
                    className="w-full rounded-md border border-gray-300 px-3 py-2.5 text-sm focus:border-nafsma-blue focus:ring-1 focus:ring-nafsma-blue focus:outline-none bg-white"
                  >
                    <option value="">Select...</option>
                    {referralOptions.map((opt) => (
                      <option key={opt} value={opt}>
                        {opt}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label htmlFor="comments" className="block text-sm font-medium text-nafsma-warm-gray mb-1">
                    Comments or Questions
                  </label>
                  <textarea
                    id="comments"
                    name="comments"
                    rows={3}
                    value={formData.comments}
                    onChange={handleChange}
                    className="w-full rounded-md border border-gray-300 px-3 py-2.5 text-sm focus:border-nafsma-blue focus:ring-1 focus:ring-nafsma-blue focus:outline-none resize-y"
                  />
                </div>
              </div>
            </fieldset>

            {/* Submit */}
            <div className="pt-4 border-t flex flex-col sm:flex-row items-center justify-between gap-4">
              <p className="text-xs text-gray-400 max-w-sm">
                By submitting this application, you agree to be contacted by
                NAFSMA regarding membership.
              </p>
              <button
                type="submit"
                disabled={submitting}
                className="w-full sm:w-auto px-8 py-3 bg-nafsma-blue text-white font-semibold rounded-md hover:bg-nafsma-dark-navy transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {submitting ? 'Submitting...' : 'Submit Application'}
              </button>
            </div>
          </form>

          {/* Already a member? */}
          <div className="text-center mt-6">
            <p className="text-sm text-nafsma-warm-gray">
              Already a member?{' '}
              <Link
                href="/login"
                className="text-nafsma-teal hover:text-nafsma-blue font-medium"
              >
                Log in here
              </Link>
            </p>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
