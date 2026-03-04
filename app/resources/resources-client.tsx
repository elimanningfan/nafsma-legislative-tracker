'use client';

import { useState } from 'react';
import { FileText, Download, Film, BookOpen, FileCheck, Newspaper } from 'lucide-react';

interface Resource {
  id: string;
  title: string;
  description: string | null;
  fileUrl: string | null;
  fileSize: number | null;
  fileMimeType: string | null;
  category: string;
  publishedAt: Date | null;
}

const categoryLabels: Record<string, string> = {
  NEWSLETTER: 'Newsletters',
  WEBINAR_RECORDING: 'Webinar Recordings',
  COMMITTEE_DOC: 'Committee Documents',
  GUIDE: 'Guides',
  POSITION_PAPER: 'Position Papers',
};

const categoryIcons: Record<string, React.ElementType> = {
  NEWSLETTER: Newspaper,
  WEBINAR_RECORDING: Film,
  COMMITTEE_DOC: FileCheck,
  GUIDE: BookOpen,
  POSITION_PAPER: FileText,
};

function formatFileSize(bytes: number | null): string {
  if (!bytes) return '';
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1048576) return `${(bytes / 1024).toFixed(0)} KB`;
  return `${(bytes / 1048576).toFixed(1)} MB`;
}

function formatDate(date: Date | null): string {
  if (!date) return '';
  return new Date(date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

export function ResourcesClient({ resources }: { resources: Resource[] }) {
  const [activeCategory, setActiveCategory] = useState<string | null>(null);

  const categories = Array.from(new Set(resources.map((r) => r.category)));

  const filtered = activeCategory
    ? resources.filter((r) => r.category === activeCategory)
    : resources;

  if (resources.length === 0) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <p className="text-nafsma-warm-gray">
          Resources are being prepared. Check back soon.
        </p>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-10">
      {/* Category filter */}
      <div className="flex flex-wrap gap-2 mb-8">
        <button
          onClick={() => setActiveCategory(null)}
          className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
            activeCategory === null
              ? 'bg-nafsma-blue text-white'
              : 'bg-white text-nafsma-warm-gray hover:bg-gray-100 border'
          }`}
        >
          All ({resources.length})
        </button>
        {categories.map((cat) => {
          const count = resources.filter((r) => r.category === cat).length;
          return (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                activeCategory === cat
                  ? 'bg-nafsma-blue text-white'
                  : 'bg-white text-nafsma-warm-gray hover:bg-gray-100 border'
              }`}
            >
              {categoryLabels[cat] || cat} ({count})
            </button>
          );
        })}
      </div>

      {/* Resources grid */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filtered.map((resource) => {
          const Icon = categoryIcons[resource.category] || FileText;
          return (
            <div
              key={resource.id}
              className="bg-white rounded-lg shadow-sm border p-6 flex flex-col"
            >
              <div className="flex items-start gap-3 mb-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-nafsma-light-blue flex-shrink-0">
                  <Icon className="h-5 w-5 text-nafsma-blue" />
                </div>
                <div>
                  <span className="text-xs font-medium text-nafsma-teal uppercase tracking-wider">
                    {categoryLabels[resource.category] || resource.category}
                  </span>
                  <h3 className="text-sm font-semibold text-nafsma-blue mt-0.5 leading-snug">
                    {resource.title}
                  </h3>
                </div>
              </div>

              {resource.description && (
                <p className="text-sm text-nafsma-warm-gray mb-4 leading-relaxed flex-1">
                  {resource.description}
                </p>
              )}

              <div className="flex items-center justify-between mt-auto pt-3 border-t">
                <span className="text-xs text-gray-400">
                  {formatDate(resource.publishedAt)}
                  {resource.fileSize
                    ? ` · ${formatFileSize(resource.fileSize)}`
                    : ''}
                </span>
                {resource.fileUrl && (
                  <a
                    href={resource.fileUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 text-sm font-medium text-nafsma-teal hover:text-nafsma-blue transition-colors"
                  >
                    <Download className="h-4 w-4" />
                    Download
                  </a>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {filtered.length === 0 && (
        <p className="text-center text-nafsma-warm-gray py-10">
          No resources found in this category.
        </p>
      )}
    </div>
  );
}
