'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { Save, Loader2 } from 'lucide-react';

interface SiteSettingsData {
  siteName: string;
  tagline: string;
  contactEmail: string;
  contactPhone: string;
  address: string;
  socialMedia: {
    twitter?: string;
    linkedin?: string;
    facebook?: string;
    youtube?: string;
  };
  featureFlags: {
    memberPortal?: boolean;
    aiContentGeneration?: boolean;
    blogComments?: boolean;
    eventRegistration?: boolean;
  };
}

export default function SiteSettingsPage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [settings, setSettings] = useState<SiteSettingsData>({
    siteName: 'NAFSMA',
    tagline: 'Driving flood and stormwater policy that benefits our communities',
    contactEmail: 'info@nafsma.org',
    contactPhone: '',
    address: '',
    socialMedia: {},
    featureFlags: {
      memberPortal: true,
      aiContentGeneration: true,
      blogComments: false,
      eventRegistration: true,
    },
  });

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const res = await fetch('/api/settings');
      const data = await res.json();
      setSettings({
        siteName: data.siteName || 'NAFSMA',
        tagline: data.tagline || '',
        contactEmail: data.contactEmail || '',
        contactPhone: data.contactPhone || '',
        address: data.address || '',
        socialMedia: data.socialMedia || {},
        featureFlags: data.featureFlags || {
          memberPortal: true,
          aiContentGeneration: true,
          blogComments: false,
          eventRegistration: true,
        },
      });
    } catch (error) {
      console.error('Error fetching settings:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const res = await fetch('/api/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(settings),
      });

      if (!res.ok) throw new Error('Failed to save settings');
      alert('Settings saved successfully');
    } catch (error) {
      console.error('Error saving settings:', error);
      alert('Failed to save settings');
    } finally {
      setSaving(false);
    }
  };

  const updateSocial = (key: string, value: string) => {
    setSettings((prev) => ({
      ...prev,
      socialMedia: { ...prev.socialMedia, [key]: value },
    }));
  };

  const updateFeatureFlag = (key: string, value: boolean) => {
    setSettings((prev) => ({
      ...prev,
      featureFlags: { ...prev.featureFlags, [key]: value },
    }));
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Site Settings</h1>
          <p className="text-gray-500 mt-1">Configure your website settings</p>
        </div>
        <Button onClick={handleSave} disabled={saving}>
          {saving ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Save className="h-4 w-4 mr-2" />}
          Save Settings
        </Button>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* General Settings */}
        <Card>
          <CardHeader>
            <CardTitle>General</CardTitle>
            <CardDescription>Basic site information</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="siteName">Site Name</Label>
              <Input
                id="siteName"
                value={settings.siteName}
                onChange={(e) => setSettings((s) => ({ ...s, siteName: e.target.value }))}
                className="mt-1"
              />
            </div>
            <div>
              <Label htmlFor="tagline">Tagline</Label>
              <Textarea
                id="tagline"
                value={settings.tagline}
                onChange={(e) => setSettings((s) => ({ ...s, tagline: e.target.value }))}
                rows={2}
                className="mt-1"
              />
            </div>
          </CardContent>
        </Card>

        {/* Contact Info */}
        <Card>
          <CardHeader>
            <CardTitle>Contact Information</CardTitle>
            <CardDescription>Organization contact details</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="contactEmail">Email</Label>
              <Input
                id="contactEmail"
                type="email"
                value={settings.contactEmail}
                onChange={(e) => setSettings((s) => ({ ...s, contactEmail: e.target.value }))}
                className="mt-1"
              />
            </div>
            <div>
              <Label htmlFor="contactPhone">Phone</Label>
              <Input
                id="contactPhone"
                value={settings.contactPhone}
                onChange={(e) => setSettings((s) => ({ ...s, contactPhone: e.target.value }))}
                placeholder="(555) 123-4567"
                className="mt-1"
              />
            </div>
            <div>
              <Label htmlFor="address">Address</Label>
              <Textarea
                id="address"
                value={settings.address}
                onChange={(e) => setSettings((s) => ({ ...s, address: e.target.value }))}
                placeholder="Street address, city, state, zip"
                rows={3}
                className="mt-1"
              />
            </div>
          </CardContent>
        </Card>

        {/* Social Media */}
        <Card>
          <CardHeader>
            <CardTitle>Social Media</CardTitle>
            <CardDescription>Social media profile URLs</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="twitter">Twitter / X</Label>
              <Input
                id="twitter"
                value={settings.socialMedia.twitter || ''}
                onChange={(e) => updateSocial('twitter', e.target.value)}
                placeholder="https://twitter.com/nafsma"
                className="mt-1"
              />
            </div>
            <div>
              <Label htmlFor="linkedin">LinkedIn</Label>
              <Input
                id="linkedin"
                value={settings.socialMedia.linkedin || ''}
                onChange={(e) => updateSocial('linkedin', e.target.value)}
                placeholder="https://linkedin.com/company/nafsma"
                className="mt-1"
              />
            </div>
            <div>
              <Label htmlFor="facebook">Facebook</Label>
              <Input
                id="facebook"
                value={settings.socialMedia.facebook || ''}
                onChange={(e) => updateSocial('facebook', e.target.value)}
                placeholder="https://facebook.com/nafsma"
                className="mt-1"
              />
            </div>
            <div>
              <Label htmlFor="youtube">YouTube</Label>
              <Input
                id="youtube"
                value={settings.socialMedia.youtube || ''}
                onChange={(e) => updateSocial('youtube', e.target.value)}
                placeholder="https://youtube.com/@nafsma"
                className="mt-1"
              />
            </div>
          </CardContent>
        </Card>

        {/* Feature Flags */}
        <Card>
          <CardHeader>
            <CardTitle>Feature Flags</CardTitle>
            <CardDescription>Enable or disable site features</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-sm">Member Portal</p>
                <p className="text-xs text-gray-500">Allow members to log in and access gated resources</p>
              </div>
              <Switch
                checked={settings.featureFlags.memberPortal ?? true}
                onCheckedChange={(v) => updateFeatureFlag('memberPortal', v)}
              />
            </div>
            <Separator />
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-sm">AI Content Generation</p>
                <p className="text-xs text-gray-500">Enable AI-powered content creation tools</p>
              </div>
              <Switch
                checked={settings.featureFlags.aiContentGeneration ?? true}
                onCheckedChange={(v) => updateFeatureFlag('aiContentGeneration', v)}
              />
            </div>
            <Separator />
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-sm">Blog Comments</p>
                <p className="text-xs text-gray-500">Allow comments on blog posts</p>
              </div>
              <Switch
                checked={settings.featureFlags.blogComments ?? false}
                onCheckedChange={(v) => updateFeatureFlag('blogComments', v)}
              />
            </div>
            <Separator />
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-sm">Event Registration</p>
                <p className="text-xs text-gray-500">Enable event registration links</p>
              </div>
              <Switch
                checked={settings.featureFlags.eventRegistration ?? true}
                onCheckedChange={(v) => updateFeatureFlag('eventRegistration', v)}
              />
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
