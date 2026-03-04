export const dynamic = 'force-dynamic';

import { prisma } from '@/lib/prisma';
import Link from 'next/link';
import {
  Mail,
  Users,
  FileText,
  Calendar,
  Plus,
  Eye,
  ArrowRight,
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

export default async function AdminDashboard() {
  // Fetch dashboard metrics
  const [
    unreadContacts,
    pendingApplications,
    postsThisMonth,
    upcomingEvents,
    recentContacts,
    recentPosts,
    totalPages,
    totalMedia,
  ] = await Promise.all([
    prisma.contactSubmission.count({ where: { status: 'NEW' } }),
    prisma.membershipApplication.count({ where: { status: 'PENDING' } }),
    prisma.blogPost.count({
      where: {
        status: 'PUBLISHED',
        publishedAt: {
          gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1),
        },
      },
    }),
    prisma.event.count({
      where: {
        status: 'PUBLISHED',
        date: { gte: new Date() },
      },
    }),
    prisma.contactSubmission.findMany({
      where: { status: 'NEW' },
      orderBy: { createdAt: 'desc' },
      take: 5,
    }),
    prisma.blogPost.findMany({
      orderBy: { updatedAt: 'desc' },
      take: 5,
      include: { author: { select: { name: true } } },
    }),
    prisma.page.count(),
    prisma.media.count(),
  ]);

  const statsCards = [
    {
      title: 'Unread Contacts',
      value: unreadContacts,
      subtitle: 'messages pending',
      icon: Mail,
      color: 'text-orange-600',
      bgColor: 'bg-orange-50',
      link: '/admin/contacts',
    },
    {
      title: 'Pending Applications',
      value: pendingApplications,
      subtitle: 'awaiting review',
      icon: Users,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
      link: '/admin/members',
    },
    {
      title: 'Posts This Month',
      value: postsThisMonth,
      subtitle: 'published articles',
      icon: FileText,
      color: 'text-green-600',
      bgColor: 'bg-green-50',
      link: '/admin/blog',
    },
    {
      title: 'Upcoming Events',
      value: upcomingEvents,
      subtitle: 'scheduled',
      icon: Calendar,
      color: 'text-purple-600',
      bgColor: 'bg-purple-50',
      link: '/admin/events',
    },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-500 mt-1">
          Welcome to the NAFSMA content management system.
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {statsCards.map((stat) => (
          <Link key={stat.title} href={stat.link}>
            <Card className="hover:shadow-md transition-shadow cursor-pointer">
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">{stat.title}</p>
                    <p className="text-3xl font-bold text-gray-900">{stat.value}</p>
                    <p className="text-sm text-gray-500 mt-1">{stat.subtitle}</p>
                  </div>
                  <div className={`p-3 rounded-full ${stat.bgColor}`}>
                    <stat.icon className={`h-6 w-6 ${stat.color}`} />
                  </div>
                </div>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
          <CardDescription>Common tasks and shortcuts</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <Link href="/admin/pages/new">
              <Button variant="outline" className="w-full justify-start">
                <Plus className="h-4 w-4 mr-2" />
                New Page
              </Button>
            </Link>
            <Link href="/admin/blog/new">
              <Button variant="outline" className="w-full justify-start">
                <FileText className="h-4 w-4 mr-2" />
                New Blog Post
              </Button>
            </Link>
            <Link href="/admin/media">
              <Button variant="outline" className="w-full justify-start">
                <Eye className="h-4 w-4 mr-2" />
                Media Library ({totalMedia})
              </Button>
            </Link>
            <Link href="/admin/pages">
              <Button variant="outline" className="w-full justify-start">
                <FileText className="h-4 w-4 mr-2" />
                Manage Pages ({totalPages})
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Recent Contacts */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Recent Contacts</CardTitle>
                <CardDescription>Latest contact form submissions</CardDescription>
              </div>
              <Link href="/admin/contacts">
                <Button variant="outline" size="sm">
                  View All
                  <ArrowRight className="h-4 w-4 ml-1" />
                </Button>
              </Link>
            </div>
          </CardHeader>
          <CardContent>
            {recentContacts.length > 0 ? (
              <div className="space-y-3">
                {recentContacts.map((contact) => (
                  <div
                    key={contact.id}
                    className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                  >
                    <div>
                      <p className="font-medium text-sm">{contact.name}</p>
                      <p className="text-xs text-gray-500">
                        {contact.subject} &middot; {contact.email}
                      </p>
                    </div>
                    <span className="px-2 py-1 text-xs font-medium rounded-full bg-orange-100 text-orange-700">
                      {contact.status}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-center text-gray-500 py-6 text-sm">
                No new contact submissions
              </p>
            )}
          </CardContent>
        </Card>

        {/* Recent Posts */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Recent Blog Activity</CardTitle>
                <CardDescription>Latest blog posts updated</CardDescription>
              </div>
              <Link href="/admin/blog">
                <Button variant="outline" size="sm">
                  View All
                  <ArrowRight className="h-4 w-4 ml-1" />
                </Button>
              </Link>
            </div>
          </CardHeader>
          <CardContent>
            {recentPosts.length > 0 ? (
              <div className="space-y-3">
                {recentPosts.map((post) => (
                  <div
                    key={post.id}
                    className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                  >
                    <div className="min-w-0 flex-1">
                      <p className="font-medium text-sm truncate">{post.title}</p>
                      <p className="text-xs text-gray-500">
                        {post.author.name} &middot;{' '}
                        {post.updatedAt.toLocaleDateString()}
                      </p>
                    </div>
                    <span
                      className={`px-2 py-1 text-xs font-medium rounded-full ml-2 ${
                        post.status === 'PUBLISHED'
                          ? 'bg-green-100 text-green-700'
                          : 'bg-gray-100 text-gray-700'
                      }`}
                    >
                      {post.status}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-center text-gray-500 py-6 text-sm">
                No blog posts yet. Create your first post!
              </p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
