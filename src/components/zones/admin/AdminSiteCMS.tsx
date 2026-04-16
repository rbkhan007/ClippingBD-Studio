'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Settings, Database, Users, BarChart3, Palette, Globe, Bell,
  Plus, Edit, Trash2, Save, X, ChevronDown, Search, RefreshCw,
  Image, Video, Bot, Layers, DollarSign, Star, MessageSquare
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useAppStore } from '@/store/app-store';

// Data types for CMS
type DataType = 'statistics' | 'services' | 'pricing' | 'testimonials' | 'features' | 'settings';

interface CMSItem {
  id: string;
  [key: string]: string | number | boolean | string[] | object;
}

const dataCategories: { type: DataType; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
  { type: 'statistics', label: 'Statistics', icon: BarChart3 },
  { type: 'services', label: 'Services', icon: Layers },
  { type: 'pricing', label: 'Pricing', icon: DollarSign },
  { type: 'testimonials', label: 'Testimonials', icon: Star },
  { type: 'features', label: 'Features & FAQs', icon: Settings },
  { type: 'settings', label: 'Site Settings', icon: Globe },
];

export function AdminSiteCMS() {
  const { user } = useAppStore();
  const [activeTab, setActiveTab] = useState<DataType>('statistics');
  const [searchQuery, setSearchQuery] = useState('');
  const [data, setData] = useState<CMSItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [editingItem, setEditingItem] = useState<CMSItem | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isCreating, setIsCreating] = useState(false);

  const isDev = user?.role === 'DEVELOPER';
  const isAdmin = user?.role === 'ADMIN' || isDev;

  // Fetch data based on active tab
  useEffect(() => {
    fetchData();
  }, [activeTab]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/${activeTab}`);
      const result = await res.json();
      if (result.success) {
        setData(Array.isArray(result.data) ? result.data : Object.entries(result.data).map(([key, value]) => ({ id: key, ...value as object })));
      }
    } catch (error) {
      console.error('Failed to fetch data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (item: CMSItem) => {
    try {
      const res = await fetch(`/api/admin/${activeTab}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: item.id, updates: item }),
      });
      const result = await res.json();
      if (result.success) {
        setIsDialogOpen(false);
        setEditingItem(null);
        fetchData();
      }
    } catch (error) {
      console.error('Failed to save:', error);
    }
  };

  const handleCreate = async (item: CMSItem) => {
    try {
      const res = await fetch(`/api/admin/${activeTab}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(item),
      });
      const result = await res.json();
      if (result.success) {
        setIsDialogOpen(false);
        setIsCreating(false);
        fetchData();
      }
    } catch (error) {
      console.error('Failed to create:', error);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this item?')) return;
    
    try {
      const res = await fetch(`/api/admin/${activeTab}?id=${id}`, {
        method: 'DELETE',
      });
      const result = await res.json();
      if (result.success) {
        fetchData();
      }
    } catch (error) {
      console.error('Failed to delete:', error);
    }
  };

  const filteredData = data.filter(item => 
    Object.values(item).some(val => 
      String(val).toLowerCase().includes(searchQuery.toLowerCase())
    )
  );

  const renderEditDialog = () => {
    if (!editingItem && !isCreating) return null;

    const item = editingItem || { id: '' };

    return (
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto glass-card">
          <DialogHeader>
            <DialogTitle>{isCreating ? 'Create New' : 'Edit'} {activeTab.slice(0, -1)}</DialogTitle>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            {Object.entries(item).map(([key, value]) => {
              if (key === 'id' && !isCreating) return null;
              
              return (
                <div key={key} className="grid gap-2">
                  <Label htmlFor={key} className="capitalize">{key.replace(/_/g, ' ')}</Label>
                  {typeof value === 'boolean' ? (
                    <Switch
                      id={key}
                      checked={value}
                      onCheckedChange={(checked) => {
                        if (isCreating) {
                          setEditingItem(prev => ({ ...prev!, [key]: checked }));
                        } else {
                          setEditingItem(prev => ({ ...prev!, [key]: checked }));
                        }
                      }}
                    />
                  ) : typeof value === 'number' ? (
                    <Input
                      id={key}
                      type="number"
                      value={value}
                      onChange={(e) => {
                        const val = parseFloat(e.target.value);
                        if (isCreating) {
                          setEditingItem(prev => ({ ...prev!, [key]: val }));
                        } else {
                          setEditingItem(prev => ({ ...prev!, [key]: val }));
                        }
                      }}
                    />
                  ) : Array.isArray(value) ? (
                    <Textarea
                      id={key}
                      value={value.join('\n')}
                      onChange={(e) => {
                        const val = e.target.value.split('\n').filter(Boolean);
                        if (isCreating) {
                          setEditingItem(prev => ({ ...prev!, [key]: val }));
                        } else {
                          setEditingItem(prev => ({ ...prev!, [key]: val }));
                        }
                      }}
                    />
                  ) : (
                    <Input
                      id={key}
                      value={String(value)}
                      onChange={(e) => {
                        if (isCreating) {
                          setEditingItem(prev => ({ ...prev!, [key]: e.target.value }));
                        } else {
                          setEditingItem(prev => ({ ...prev!, [key]: e.target.value }));
                        }
                      }}
                    />
                  )}
                </div>
              );
            })}
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={() => isCreating ? handleCreate(item) : handleSave(item)}>
              <Save className="w-4 h-4 mr-2" />
              {isCreating ? 'Create' : 'Save'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
        <div>
          <h1 className="text-2xl font-bold">Site CMS</h1>
          <p className="text-muted-foreground">Manage all site content and configurations</p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" onClick={fetchData}>
            <RefreshCw className="w-4 h-4 mr-2" />
            Refresh
          </Button>
          {isDev && (
            <Button onClick={() => { setIsCreating(true); setEditingItem({ id: '', title: '', content: '', active: true } as CMSItem); setIsDialogOpen(true); }}>
              <Plus className="w-4 h-4 mr-2" />
              Add New
            </Button>
          )}
        </div>
      </div>

      {/* Category Tabs */}
      <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as DataType)}>
        <TabsList className="grid grid-cols-3 lg:grid-cols-6 gap-2">
          {dataCategories.map(({ type, label, icon: Icon }) => (
            <TabsTrigger key={type} value={type} className="flex items-center gap-2">
              <Icon className="w-4 h-4" />
              <span className="hidden sm:inline">{label}</span>
            </TabsTrigger>
          ))}
        </TabsList>

        {dataCategories.map(({ type }) => (
          <TabsContent key={type} value={type} className="mt-6">
            {/* Search */}
            <div className="mb-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Search..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            {/* Data Grid */}
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <RefreshCw className="w-8 h-8 animate-spin text-emerald-400" />
              </div>
            ) : (
              <ScrollArea className="h-[calc(100vh-400px)]">
                <div className="grid gap-4">
                  {filteredData.map((item, index) => (
                    <motion.div
                      key={item.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.05 }}
                    >
                      <Card className="glass-card hover:border-emerald-500 transition-all">
                        <CardContent className="p-4">
                          <div className="flex items-start justify-between gap-4">
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 mb-2">
                                <h3 className="font-semibold truncate">
                                  {String(item.label || item.title || item.name || item.key || item.id)}
                                </h3>
                                {item.isVisible === false && (
                                  <Badge variant="outline" className="text-xs">Hidden</Badge>
                                )}
                                {item.isFeatured && (
                                  <Badge className="bg-amber-500/20 text-amber-400 text-xs">Featured</Badge>
                                )}
                                {item.isPopular && (
                                  <Badge className="bg-emerald-500/30 dark:bg-emerald-500/20 text-emerald-400 text-xs">Popular</Badge>
                                )}
                              </div>
<p className="text-sm text-muted-foreground line-clamp-2">
                                  {String(item.description || item.content || item.value || 'No description')}
                                </p>
                            </div>
                            <div className="flex items-center gap-2">
                              {isAdmin && (
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  onClick={() => { setIsCreating(false); setEditingItem(item); setIsDialogOpen(true); }}
                                >
                                  <Edit className="w-4 h-4" />
                                </Button>
                              )}
                              {isDev && (
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="text-red-400 hover:text-red-300"
                                  onClick={() => handleDelete(item.id)}
                                >
                                  <Trash2 className="w-4 h-4" />
                                </Button>
                              )}
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </motion.div>
                  ))}

                  {filteredData.length === 0 && (
                    <div className="text-center py-12 text-muted-foreground">
                      No items found
                    </div>
                  )}
                </div>
              </ScrollArea>
            )}
          </TabsContent>
        ))}
      </Tabs>

      {renderEditDialog()}
    </div>
  );
}
