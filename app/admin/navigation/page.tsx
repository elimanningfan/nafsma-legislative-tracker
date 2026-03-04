'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import {
  Plus,
  Trash2,
  GripVertical,
  Save,
  Loader2,
  ExternalLink,
} from 'lucide-react';

interface NavItem {
  id: string;
  label: string;
  href: string;
  parentId: string | null;
  menuGroup: string;
  displayOrder: number;
  isExternal: boolean;
}

export default function NavigationEditorPage() {
  const [items, setItems] = useState<NavItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [adding, setAdding] = useState(false);

  const [newLabel, setNewLabel] = useState('');
  const [newHref, setNewHref] = useState('');
  const [newMenuGroup, setNewMenuGroup] = useState('main');
  const [newIsExternal, setNewIsExternal] = useState(false);
  const [newParentId, setNewParentId] = useState('');

  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<NavItem | null>(null);

  useEffect(() => {
    fetchNavigation();
  }, []);

  const fetchNavigation = async () => {
    try {
      const res = await fetch('/api/navigation');
      const data = await res.json();
      setItems(data);
    } catch (error) {
      console.error('Error fetching navigation:', error);
    } finally {
      setLoading(false);
    }
  };

  const menuGroups = [...new Set(items.map((i) => i.menuGroup))];
  if (!menuGroups.includes('main')) menuGroups.unshift('main');
  if (!menuGroups.includes('footer')) menuGroups.push('footer');

  const topLevelItems = items.filter((i) => !i.parentId);

  const handleAddItem = async () => {
    if (!newLabel || !newHref) {
      alert('Label and URL are required');
      return;
    }

    setAdding(true);
    try {
      const maxOrder = items
        .filter((i) => i.menuGroup === newMenuGroup)
        .reduce((max, i) => Math.max(max, i.displayOrder), -1);

      const res = await fetch('/api/navigation', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          label: newLabel,
          href: newHref,
          menuGroup: newMenuGroup,
          isExternal: newIsExternal,
          parentId: newParentId || null,
          displayOrder: maxOrder + 1,
        }),
      });

      if (!res.ok) throw new Error('Failed to create item');

      setNewLabel('');
      setNewHref('');
      setNewIsExternal(false);
      setNewParentId('');
      fetchNavigation();
    } catch (error) {
      console.error('Error adding item:', error);
      alert('Failed to add navigation item');
    } finally {
      setAdding(false);
    }
  };

  const handleSaveOrder = async () => {
    setSaving(true);
    try {
      const res = await fetch('/api/navigation', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ items }),
      });

      if (!res.ok) throw new Error('Failed to save');
      alert('Navigation saved successfully');
    } catch (error) {
      console.error('Error saving:', error);
      alert('Failed to save navigation');
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteClick = (item: NavItem) => {
    setItemToDelete(item);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!itemToDelete) return;
    try {
      const res = await fetch(`/api/navigation/${itemToDelete.id}`, { method: 'DELETE' });
      if (res.ok) {
        setItems((prev) => prev.filter((i) => i.id !== itemToDelete.id));
      }
    } catch (error) {
      console.error('Error deleting:', error);
    } finally {
      setDeleteDialogOpen(false);
      setItemToDelete(null);
    }
  };

  const updateItem = (id: string, field: string, value: any) => {
    setItems((prev) =>
      prev.map((i) => (i.id === id ? { ...i, [field]: value } : i))
    );
  };

  const moveItem = (id: string, direction: 'up' | 'down') => {
    setItems((prev) => {
      const sorted = [...prev].sort((a, b) => a.displayOrder - b.displayOrder);
      const index = sorted.findIndex((i) => i.id === id);
      if (index === -1) return prev;

      const swapIndex = direction === 'up' ? index - 1 : index + 1;
      if (swapIndex < 0 || swapIndex >= sorted.length) return prev;

      const tempOrder = sorted[index].displayOrder;
      sorted[index].displayOrder = sorted[swapIndex].displayOrder;
      sorted[swapIndex].displayOrder = tempOrder;

      return sorted;
    });
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
          <h1 className="text-2xl font-bold text-gray-900">Navigation Editor</h1>
          <p className="text-gray-500 mt-1">
            Manage your site navigation menus ({items.length} items)
          </p>
        </div>
        <Button onClick={handleSaveOrder} disabled={saving}>
          {saving ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Save className="h-4 w-4 mr-2" />}
          Save Changes
        </Button>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Add New Item */}
        <Card>
          <CardHeader>
            <CardTitle>Add Navigation Item</CardTitle>
            <CardDescription>Add a new link to your navigation menu</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="label">Label</Label>
              <Input
                id="label"
                value={newLabel}
                onChange={(e) => setNewLabel(e.target.value)}
                placeholder="About Us"
                className="mt-1"
              />
            </div>
            <div>
              <Label htmlFor="href">URL</Label>
              <Input
                id="href"
                value={newHref}
                onChange={(e) => setNewHref(e.target.value)}
                placeholder="/about"
                className="mt-1"
              />
            </div>
            <div>
              <Label htmlFor="menu-group">Menu Group</Label>
              <Select value={newMenuGroup} onValueChange={setNewMenuGroup}>
                <SelectTrigger className="mt-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="main">Main Navigation</SelectItem>
                  <SelectItem value="footer">Footer</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="parent">Parent Item (optional)</Label>
              <Select value={newParentId} onValueChange={setNewParentId}>
                <SelectTrigger className="mt-1">
                  <SelectValue placeholder="None (top level)" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">None (top level)</SelectItem>
                  {topLevelItems.map((item) => (
                    <SelectItem key={item.id} value={item.id}>
                      {item.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-center justify-between">
              <Label htmlFor="external">External Link</Label>
              <Switch
                id="external"
                checked={newIsExternal}
                onCheckedChange={setNewIsExternal}
              />
            </div>
            <Button onClick={handleAddItem} disabled={adding} className="w-full">
              {adding ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Plus className="h-4 w-4 mr-2" />}
              Add Item
            </Button>
          </CardContent>
        </Card>

        {/* Navigation Items */}
        <div className="lg:col-span-2 space-y-4">
          {['main', 'footer'].map((group) => {
            const groupItems = items
              .filter((i) => i.menuGroup === group && !i.parentId)
              .sort((a, b) => a.displayOrder - b.displayOrder);

            if (groupItems.length === 0 && group !== 'main') return null;

            return (
              <Card key={group}>
                <CardHeader>
                  <CardTitle className="capitalize">{group} Navigation</CardTitle>
                </CardHeader>
                <CardContent>
                  {groupItems.length === 0 ? (
                    <p className="text-gray-500 text-center py-4 text-sm">
                      No items in this menu. Add one using the form.
                    </p>
                  ) : (
                    <div className="space-y-2">
                      {groupItems.map((item) => {
                        const children = items
                          .filter((i) => i.parentId === item.id)
                          .sort((a, b) => a.displayOrder - b.displayOrder);

                        return (
                          <div key={item.id}>
                            <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg">
                              <GripVertical className="h-4 w-4 text-gray-400 cursor-grab flex-shrink-0" />
                              <Input
                                value={item.label}
                                onChange={(e) => updateItem(item.id, 'label', e.target.value)}
                                className="h-8 text-sm flex-1"
                              />
                              <Input
                                value={item.href}
                                onChange={(e) => updateItem(item.id, 'href', e.target.value)}
                                className="h-8 text-sm flex-1"
                              />
                              {item.isExternal && (
                                <ExternalLink className="h-4 w-4 text-gray-400 flex-shrink-0" />
                              )}
                              <div className="flex gap-1 flex-shrink-0">
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="h-8 w-8 p-0"
                                  onClick={() => moveItem(item.id, 'up')}
                                >
                                  ↑
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="h-8 w-8 p-0"
                                  onClick={() => moveItem(item.id, 'down')}
                                >
                                  ↓
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="h-8 w-8 p-0 text-red-600"
                                  onClick={() => handleDeleteClick(item)}
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </div>
                            </div>
                            {/* Children */}
                            {children.length > 0 && (
                              <div className="ml-8 mt-1 space-y-1">
                                {children.map((child) => (
                                  <div
                                    key={child.id}
                                    className="flex items-center gap-2 p-2 bg-white border rounded"
                                  >
                                    <GripVertical className="h-3 w-3 text-gray-300 flex-shrink-0" />
                                    <Input
                                      value={child.label}
                                      onChange={(e) => updateItem(child.id, 'label', e.target.value)}
                                      className="h-7 text-xs flex-1"
                                    />
                                    <Input
                                      value={child.href}
                                      onChange={(e) => updateItem(child.id, 'href', e.target.value)}
                                      className="h-7 text-xs flex-1"
                                    />
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      className="h-7 w-7 p-0 text-red-600"
                                      onClick={() => handleDeleteClick(child)}
                                    >
                                      <Trash2 className="h-3 w-3" />
                                    </Button>
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Navigation Item</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete &quot;{itemToDelete?.label}&quot;?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteConfirm} className="bg-red-600 hover:bg-red-700">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
