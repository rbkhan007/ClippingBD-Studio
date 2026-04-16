'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FileText, Plus, Edit, Trash2, Eye, EyeOff, Search, Filter,
  Save, X, Upload, Globe, Clock, User, Tag, Image as ImageIcon,
  ChevronRight, ArrowUp, ArrowDown, Check, AlertCircle, RefreshCw
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { useAppStore } from '@/store/app-store';

// Types
interface CMSPage {
  id: string;
  slug: string;
  title: string;
  content: string;
  excerpt?: string;
  metaTitle?: string;
  metaDescription?: string;
  featuredImage?: string;
  isPublished: boolean;
  isHomePage: boolean;
  authorId?: string;
  createdAt: string;
  updatedAt: string;
  publishedAt?: string;
}

interface BlogPost {
  id: string;
  slug: string;
  title: string;
  content: string;
  excerpt?: string;
  category: string;
  tags?: string;
  featuredImage?: string;
  authorName?: string;
  isPublished: boolean;
  isFeatured: boolean;
  viewCount: number;
  createdAt: string;
  updatedAt: string;
  publishedAt?: string;
}

interface FAQItem {
  id: string;
  question: string;
  answer: string;
  category: string;
  sortOrder: number;
  isPublished: boolean;
  createdAt: string;
  updatedAt: string;
}

// Role Access Indicator
function RoleAccessIndicator({ requiredRole, currentRole }: { requiredRole: string; currentRole: string }) {
  const roleHierarchy: Record<string, number> = {
    GUEST: 0, CLIENT: 1, EDITOR: 2, QA: 3, ADMIN: 4, DEVELOPER: 5
  };
  
  const hasAccess = roleHierarchy[currentRole] >= roleHierarchy[requiredRole];
  
  return (
    <div className={`flex items-center gap-1 text-xs px-2 py-1 rounded ${hasAccess ? 'bg-emerald-500/30 dark:bg-emerald-500/20 text-emerald-400' : 'bg-red-500/20 text-red-400'}`}>
      {hasAccess ? 'Admin Access' : 'Restricted'}
    </div>
  );
}

// CMS Pages Tab
function PagesTab() {
  const [pages, setPages] = useState<CMSPage[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [editingPage, setEditingPage] = useState<CMSPage | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  useEffect(() => {
    fetchPages();
  }, []);

  const fetchPages = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/admin/cms/pages', { credentials: 'include' });
      if (response.ok) {
        const data = await response.json();
        setPages(data.pages || []);
      }
    } catch (error) {
      console.error('Failed to fetch pages:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSavePage = async (page: Partial<CMSPage>) => {
    try {
      const method = editingPage?.id ? 'PUT' : 'POST';
      const body = editingPage?.id ? { ...page, id: editingPage.id } : page;
      
      const response = await fetch('/api/admin/cms/pages', {
        method,
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(body),
      });

      if (response.ok) {
        await fetchPages();
        setIsDialogOpen(false);
        setEditingPage(null);
      }
    } catch (error) {
      console.error('Failed to save page:', error);
    }
  };

  const handleDeletePage = async (id: string) => {
    if (!confirm('Are you sure you want to delete this page?')) return;
    
    try {
      const response = await fetch(`/api/admin/cms/pages?id=${id}`, {
        method: 'DELETE',
        credentials: 'include',
      });
      
      if (response.ok) {
        await fetchPages();
      }
    } catch (error) {
      console.error('Failed to delete page:', error);
    }
  };

  const filteredPages = pages.filter(p => 
    p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.slug.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-4">
      <div className="flex gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search pages..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 bg-muted/30 dark:bg-white/5 border-border"
          />
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-gradient-to-r from-emerald-500 to-teal-600" onClick={() => setEditingPage(null)}>
              <Plus className="w-4 h-4 mr-2" />
              New Page
            </Button>
          </DialogTrigger>
          <DialogContent className="glass-card max-w-2xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{editingPage?.id ? 'Edit Page' : 'Create New Page'}</DialogTitle>
              <DialogDescription>Configure page content and settings</DialogDescription>
            </DialogHeader>
            <PageForm page={editingPage} onSave={handleSavePage} onCancel={() => { setIsDialogOpen(false); setEditingPage(null); }} />
          </DialogContent>
        </Dialog>
      </div>

      {loading ? (
        <div className="text-center py-8 text-muted-foreground">Loading pages...</div>
      ) : (
        <div className="space-y-2">
          {filteredPages.map((page) => (
            <motion.div
              key={page.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex items-center justify-between p-4 rounded-lg bg-muted/30 dark:bg-white/5 hover:bg-muted/50 transition-colors"
            >
              <div className="flex items-center gap-4">
                <FileText className="w-5 h-5 text-muted-foreground" />
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-medium">{page.title}</h3>
                    {page.isHomePage && <Badge className="bg-amber-500/20 text-amber-400">Homepage</Badge>}
                    {page.isPublished ? (
                      <Badge className="bg-emerald-500/30 dark:bg-emerald-500/20 text-emerald-400">Published</Badge>
                    ) : (
                      <Badge className="bg-slate-500/20 text-slate-400">Draft</Badge>
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground">/{page.slug}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Button variant="ghost" size="sm" onClick={() => { setEditingPage(page); setIsDialogOpen(true); }}>
                  <Edit className="w-4 h-4" />
                </Button>
                <Button variant="ghost" size="sm" className="text-red-400" onClick={() => handleDeletePage(page.id)}>
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </motion.div>
          ))}
          {filteredPages.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">No pages found</div>
          )}
        </div>
      )}
    </div>
  );
}

// Page Form Component
function PageForm({ page, onSave, onCancel }: { page: CMSPage | null; onSave: (data: Partial<CMSPage>) => void; onCancel: () => void }) {
  const [formData, setFormData] = useState<Partial<CMSPage>>({
    title: page?.title || '',
    slug: page?.slug || '',
    content: page?.content || '',
    excerpt: page?.excerpt || '',
    metaTitle: page?.metaTitle || '',
    metaDescription: page?.metaDescription || '',
    featuredImage: page?.featuredImage || '',
    isPublished: page?.isPublished || false,
    isHomePage: page?.isHomePage || false,
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
  };

  const generateSlug = (title: string) => {
    return title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid sm:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>Title</Label>
          <Input
            value={formData.title}
            onChange={(e) => {
              setFormData(prev => ({ ...prev, title: e.target.value, slug: prev.slug || generateSlug(e.target.value) }));
            }}
            className="bg-muted/30 dark:bg-white/5 border-border"
            required
          />
        </div>
        <div className="space-y-2">
          <Label>Slug</Label>
          <Input
            value={formData.slug}
            onChange={(e) => setFormData(prev => ({ ...prev, slug: e.target.value }))}
            className="bg-muted/30 dark:bg-white/5 border-border"
            required
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label>Content</Label>
        <Textarea
          value={formData.content}
          onChange={(e) => setFormData(prev => ({ ...prev, content: e.target.value }))}
          className="bg-muted/30 dark:bg-white/5 border-border min-h-[200px]"
          required
        />
      </div>

      <div className="space-y-2">
        <Label>Excerpt</Label>
        <Textarea
          value={formData.excerpt}
          onChange={(e) => setFormData(prev => ({ ...prev, excerpt: e.target.value }))}
          className="bg-muted/30 dark:bg-white/5 border-border"
          rows={2}
        />
      </div>

      <Separator />

      <div className="grid sm:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>Meta Title (SEO)</Label>
          <Input
            value={formData.metaTitle}
            onChange={(e) => setFormData(prev => ({ ...prev, metaTitle: e.target.value }))}
            className="bg-muted/30 dark:bg-white/5 border-border"
          />
        </div>
        <div className="space-y-2">
          <Label>Featured Image URL</Label>
          <Input
            value={formData.featuredImage}
            onChange={(e) => setFormData(prev => ({ ...prev, featuredImage: e.target.value }))}
            className="bg-muted/30 dark:bg-white/5 border-border"
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label>Meta Description (SEO)</Label>
        <Textarea
          value={formData.metaDescription}
          onChange={(e) => setFormData(prev => ({ ...prev, metaDescription: e.target.value }))}
          className="bg-muted/30 dark:bg-white/5 border-border"
          rows={2}
        />
      </div>

      <div className="flex items-center gap-4">
        <label className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={formData.isPublished}
            onChange={(e) => setFormData(prev => ({ ...prev, isPublished: e.target.checked }))}
            className="rounded border-border"
          />
          <span className="text-sm">Published</span>
        </label>
        <label className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={formData.isHomePage}
            onChange={(e) => setFormData(prev => ({ ...prev, isHomePage: e.target.checked }))}
            className="rounded border-border"
          />
          <span className="text-sm">Set as Homepage</span>
        </label>
      </div>

      <DialogFooter>
        <Button type="button" variant="outline" onClick={onCancel}>Cancel</Button>
        <Button type="submit" className="bg-gradient-to-r from-emerald-500 to-teal-600">
          <Save className="w-4 h-4 mr-2" />
          Save Page
        </Button>
      </DialogFooter>
    </form>
  );
}

// Blog Posts Tab
function BlogTab() {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterCategory, setFilterCategory] = useState('all');

  useEffect(() => {
    fetchPosts();
  }, []);

  const fetchPosts = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/admin/cms/blog', { credentials: 'include' });
      if (response.ok) {
        const data = await response.json();
        setPosts(data.posts || []);
      }
    } catch (error) {
      console.error('Failed to fetch posts:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDeletePost = async (id: string) => {
    if (!confirm('Are you sure you want to delete this post?')) return;
    
    try {
      const response = await fetch(`/api/admin/cms/blog?id=${id}`, {
        method: 'DELETE',
        credentials: 'include',
      });
      
      if (response.ok) {
        await fetchPosts();
      }
    } catch (error) {
      console.error('Failed to delete post:', error);
    }
  };

  const getCategoryBadge = (category: string) => {
    const styles: Record<string, string> = {
      TUTORIAL: 'bg-blue-500/20 text-blue-400',
      NEWS: 'bg-emerald-500/30 dark:bg-emerald-500/20 text-emerald-400',
      UPDATE: 'bg-amber-500/20 text-amber-400',
      CASE_STUDY: 'bg-purple-500/20 text-purple-400',
    };
    return <Badge className={styles[category] || 'bg-slate-500/20'}>{category}</Badge>;
  };

  const filteredPosts = posts.filter(p => {
    const matchesSearch = p.title.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = filterCategory === 'all' || p.category === filterCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="space-y-4">
      <div className="flex gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search posts..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 bg-muted/30 dark:bg-white/5 border-border"
          />
        </div>
        <Select value={filterCategory} onValueChange={setFilterCategory}>
          <SelectTrigger className="w-40 bg-muted/30 dark:bg-white/5 border-border">
            <SelectValue placeholder="Category" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Categories</SelectItem>
            <SelectItem value="TUTORIAL">Tutorial</SelectItem>
            <SelectItem value="NEWS">News</SelectItem>
            <SelectItem value="UPDATE">Update</SelectItem>
            <SelectItem value="CASE_STUDY">Case Study</SelectItem>
          </SelectContent>
        </Select>
        <Button className="bg-gradient-to-r from-emerald-500 to-teal-600">
          <Plus className="w-4 h-4 mr-2" />
          New Post
        </Button>
      </div>

      {loading ? (
        <div className="text-center py-8 text-muted-foreground">Loading posts...</div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredPosts.map((post) => (
            <motion.div
              key={post.id}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
            >
              <Card className="glass-card h-full">
                {post.featuredImage && (
                  <div className="aspect-video bg-muted/30 rounded-t-lg overflow-hidden">
                    <img src={post.featuredImage} alt={post.title} className="w-full h-full object-cover" />
                  </div>
                )}
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    {getCategoryBadge(post.category)}
                    {post.isFeatured && <Badge className="bg-amber-500/20 text-amber-400">Featured</Badge>}
                  </div>
                  <CardTitle className="text-lg">{post.title}</CardTitle>
                  <CardDescription className="line-clamp-2">{post.excerpt}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between text-sm text-muted-foreground">
                    <div className="flex items-center gap-2">
                      <Eye className="w-4 h-4" />
                      {post.viewCount} views
                    </div>
                    <div className="flex items-center gap-2">
                      {post.isPublished ? (
                        <Badge className="bg-emerald-500/30 dark:bg-emerald-500/20 text-emerald-400">Published</Badge>
                      ) : (
                        <Badge className="bg-slate-500/20">Draft</Badge>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-2 mt-4">
                    <Button variant="outline" size="sm" className="flex-1 border-border">
                      <Edit className="w-4 h-4 mr-1" />
                      Edit
                    </Button>
                    <Button variant="ghost" size="sm" className="text-red-400" onClick={() => handleDeletePost(post.id)}>
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
          {filteredPosts.length === 0 && (
            <div className="col-span-full text-center py-8 text-muted-foreground">No posts found</div>
          )}
        </div>
      )}
    </div>
  );
}

// FAQ Tab
function FAQTab() {
  const [items, setItems] = useState<FAQItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterCategory, setFilterCategory] = useState('all');
  const [editingItem, setEditingItem] = useState<FAQItem | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  useEffect(() => {
    fetchItems();
  }, []);

  const fetchItems = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/admin/cms/faq', { credentials: 'include' });
      if (response.ok) {
        const data = await response.json();
        setItems(data.items || []);
      }
    } catch (error) {
      console.error('Failed to fetch FAQ items:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveItem = async (item: Partial<FAQItem>) => {
    try {
      const method = editingItem?.id ? 'PUT' : 'POST';
      const body = editingItem?.id ? { ...item, id: editingItem.id } : item;
      
      const response = await fetch('/api/admin/cms/faq', {
        method,
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(body),
      });

      if (response.ok) {
        await fetchItems();
        setIsDialogOpen(false);
        setEditingItem(null);
      }
    } catch (error) {
      console.error('Failed to save FAQ item:', error);
    }
  };

  const handleDeleteItem = async (id: string) => {
    if (!confirm('Are you sure you want to delete this FAQ item?')) return;
    
    try {
      const response = await fetch(`/api/admin/cms/faq?id=${id}`, {
        method: 'DELETE',
        credentials: 'include',
      });
      
      if (response.ok) {
        await fetchItems();
      }
    } catch (error) {
      console.error('Failed to delete FAQ item:', error);
    }
  };

  const handleTogglePublish = async (item: FAQItem) => {
    await handleSaveItem({ ...item, isPublished: !item.isPublished });
  };

  const filteredItems = items.filter(i => filterCategory === 'all' || i.category === filterCategory);

  const getCategoryBadge = (category: string) => {
    const styles: Record<string, string> = {
      GENERAL: 'bg-slate-500/20 text-slate-400',
      PRICING: 'bg-emerald-500/30 dark:bg-emerald-500/20 text-emerald-400',
      SERVICES: 'bg-blue-500/20 text-blue-400',
      SUPPORT: 'bg-amber-500/20 text-amber-400',
      TECHNICAL: 'bg-purple-500/20 text-purple-400',
    };
    return <Badge className={styles[category] || 'bg-slate-500/20'}>{category}</Badge>;
  };

  return (
    <div className="space-y-4">
      <div className="flex gap-4">
        <Select value={filterCategory} onValueChange={setFilterCategory}>
          <SelectTrigger className="w-40 bg-muted/30 dark:bg-white/5 border-border">
            <SelectValue placeholder="Category" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Categories</SelectItem>
            <SelectItem value="GENERAL">General</SelectItem>
            <SelectItem value="PRICING">Pricing</SelectItem>
            <SelectItem value="SERVICES">Services</SelectItem>
            <SelectItem value="SUPPORT">Support</SelectItem>
            <SelectItem value="TECHNICAL">Technical</SelectItem>
          </SelectContent>
        </Select>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-gradient-to-r from-emerald-500 to-teal-600" onClick={() => setEditingItem(null)}>
              <Plus className="w-4 h-4 mr-2" />
              New FAQ
            </Button>
          </DialogTrigger>
          <DialogContent className="glass-card">
            <DialogHeader>
              <DialogTitle>{editingItem?.id ? 'Edit FAQ' : 'Create FAQ Item'}</DialogTitle>
              <DialogDescription>Add frequently asked questions</DialogDescription>
            </DialogHeader>
            <FAQForm item={editingItem} onSave={handleSaveItem} onCancel={() => { setIsDialogOpen(false); setEditingItem(null); }} />
          </DialogContent>
        </Dialog>
      </div>

      {loading ? (
        <div className="text-center py-8 text-muted-foreground">Loading FAQ items...</div>
      ) : (
        <div className="space-y-2">
          {filteredItems.map((item) => (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="p-4 rounded-lg bg-muted/30 dark:bg-white/5 hover:bg-muted/50 transition-colors"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    {getCategoryBadge(item.category)}
                    {item.isPublished ? (
                      <Badge className="bg-emerald-500/30 dark:bg-emerald-500/20 text-emerald-400">Published</Badge>
                    ) : (
                      <Badge className="bg-slate-500/20">Draft</Badge>
                    )}
                  </div>
                  <h3 className="font-medium mb-1">{item.question}</h3>
                  <p className="text-sm text-muted-foreground line-clamp-2">{item.answer}</p>
                </div>
                <div className="flex items-center gap-1">
                  <Button variant="ghost" size="sm" onClick={() => handleTogglePublish(item)}>
                    {item.isPublished ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </Button>
                  <Button variant="ghost" size="sm" onClick={() => { setEditingItem(item); setIsDialogOpen(true); }}>
                    <Edit className="w-4 h-4" />
                  </Button>
                  <Button variant="ghost" size="sm" className="text-red-400" onClick={() => handleDeleteItem(item.id)}>
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </motion.div>
          ))}
          {filteredItems.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">No FAQ items found</div>
          )}
        </div>
      )}
    </div>
  );
}

// FAQ Form Component
function FAQForm({ item, onSave, onCancel }: { item: FAQItem | null; onSave: (data: Partial<FAQItem>) => void; onCancel: () => void }) {
  const [formData, setFormData] = useState<Partial<FAQItem>>({
    question: item?.question || '',
    answer: item?.answer || '',
    category: item?.category || 'GENERAL',
    isPublished: item?.isPublished ?? true,
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label>Question</Label>
        <Input
          value={formData.question}
          onChange={(e) => setFormData(prev => ({ ...prev, question: e.target.value }))}
          className="bg-muted/30 dark:bg-white/5 border-border"
          required
        />
      </div>

      <div className="space-y-2">
        <Label>Answer</Label>
        <Textarea
          value={formData.answer}
          onChange={(e) => setFormData(prev => ({ ...prev, answer: e.target.value }))}
          className="bg-muted/30 dark:bg-white/5 border-border min-h-[100px]"
          required
        />
      </div>

      <div className="grid sm:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>Category</Label>
          <Select value={formData.category} onValueChange={(v) => setFormData(prev => ({ ...prev, category: v }))}>
            <SelectTrigger className="bg-muted/30 dark:bg-white/5 border-border">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="GENERAL">General</SelectItem>
              <SelectItem value="PRICING">Pricing</SelectItem>
              <SelectItem value="SERVICES">Services</SelectItem>
              <SelectItem value="SUPPORT">Support</SelectItem>
              <SelectItem value="TECHNICAL">Technical</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="flex items-end">
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={formData.isPublished}
              onChange={(e) => setFormData(prev => ({ ...prev, isPublished: e.target.checked }))}
              className="rounded border-border"
            />
            <span className="text-sm">Published</span>
          </label>
        </div>
      </div>

      <DialogFooter>
        <Button type="button" variant="outline" onClick={onCancel}>Cancel</Button>
        <Button type="submit" className="bg-gradient-to-r from-emerald-500 to-teal-600">
          <Save className="w-4 h-4 mr-2" />
          Save FAQ
        </Button>
      </DialogFooter>
    </form>
  );
}

// Main Admin CMS Component
export function AdminCMS() {
  const { user } = useAppStore();
  const [activeTab, setActiveTab] = useState('pages');

  return (
    <div className="py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold mb-1">Content Management</h1>
            <p className="text-muted-foreground">Manage pages, blog posts, and FAQ items</p>
          </div>
          <RoleAccessIndicator requiredRole="ADMIN" currentRole={user?.role || 'GUEST'} />
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="bg-muted/30 dark:bg-white/5 border border-border">
            <TabsTrigger value="pages" className="data-[state=active]:bg-emerald-500/30 dark:bg-emerald-500/20 data-[state=active]:text-emerald-400">
              <FileText className="w-4 h-4 mr-2" />
              Pages
            </TabsTrigger>
            <TabsTrigger value="blog" className="data-[state=active]:bg-emerald-500/30 dark:bg-emerald-500/20 data-[state=active]:text-emerald-400">
              <Globe className="w-4 h-4 mr-2" />
              Blog
            </TabsTrigger>
            <TabsTrigger value="faq" className="data-[state=active]:bg-emerald-500/30 dark:bg-emerald-500/20 data-[state=active]:text-emerald-400">
              <Tag className="w-4 h-4 mr-2" />
              FAQ
            </TabsTrigger>
          </TabsList>

          <TabsContent value="pages">
            <PagesTab />
          </TabsContent>

          <TabsContent value="blog">
            <BlogTab />
          </TabsContent>

          <TabsContent value="faq">
            <FAQTab />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
