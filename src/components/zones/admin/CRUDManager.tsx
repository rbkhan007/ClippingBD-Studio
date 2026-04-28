'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Layers, DollarSign, MessageSquare, TrendingUp, Zap, HelpCircle,
  Users, ShoppingCart, Settings, Image, Plus, Search, Filter,
  ChevronRight, Edit, Trash2, Eye, CheckCircle, X, Save, RefreshCw,
  Database, Shield, AlertTriangle, ArrowLeft, Loader2
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow
} from '@/components/ui/table';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter
} from '@/components/ui/dialog';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue
} from '@/components/ui/select';
import { useAppStore } from '@/store/app-store';
import { crudEntities, entityCategories, CRUDEntity } from '@/data/crud-config';

// Icon mapping
const iconMap: Record<string, any> = {
  Layers, DollarSign, MessageSquare, TrendingUp, Zap, HelpCircle,
  Users, ShoppingCart, Settings, Image, FileText: Layers, Database: Database
};

const categoryIcons: Record<string, any> = {
  content: MessageSquare,
  users: Users,
  services: Layers,
  pricing: DollarSign,
  settings: Settings,
  media: Image,
};

export function CRUDManagerPage() {
  const { user } = useAppStore();
  const [selectedEntity, setSelectedEntity] = useState<CRUDEntity | null>(null);
  const [entityData, setEntityData] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [editItem, setEditItem] = useState<any | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<any | null>(null);
  const setCurrentPage = useAppStore((state) => state.setCurrentPage);

  // Fetch data from API
  const fetchEntityData = async (entityId: string) => {
    setLoading(true);
    try {
      const response = await fetch(`/api/admin/crud?entity=${entityId}`, {
        credentials: 'include',
      });
      const data = await response.json();
      if (data.data) {
        setEntityData(data.data);
      }
    } catch (error) {
      console.error('Failed to fetch entity data:', error);
    } finally {
      setLoading(false);
    }
  };

  // Load data when entity changes
  useEffect(() => {
    if (selectedEntity) {
      fetchEntityData(selectedEntity.id);
    }
  }, [selectedEntity]);

  // Delete item
  const deleteItem = async (item: any) => {
    if (!selectedEntity) return;
    try {
      const response = await fetch(
        `/api/admin/crud?entity=${selectedEntity.id}&id=${item.id}`,
        {
          method: 'DELETE',
          credentials: 'include',
        }
      );
      const data = await response.json();
      if (data.success) {
        setEntityData((prev) => prev.filter((i) => i.id !== item.id));
      }
    } catch (error) {
      console.error('Delete failed:', error);
    }
  };

  // Update item
  const updateItem = async () => {
    if (!selectedEntity || !editItem) return;
    try {
      const response = await fetch('/api/admin/crud', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          entityId: selectedEntity.id,
          itemId: editItem.id,
          data: editItem,
        }),
      });
      const data = await response.json();
      if (data.success) {
        setEntityData((prev) =>
          prev.map((i) => (i.id === editItem.id ? { ...i, ...editItem } : i))
        );
      }
    } catch (error) {
      console.error('Update failed:', error);
    }
  };

  // Create item
  const createItem = async (newItem: any) => {
    if (!selectedEntity) return;
    try {
      const response = await fetch('/api/admin/crud', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          entityId: selectedEntity.id,
          data: newItem,
        }),
      });
      const data = await response.json();
      if (data.success && data.item) {
        setEntityData((prev) => [data.item, ...prev]);
      }
    } catch (error) {
      console.error('Create failed:', error);
    }
  };

  // Check permission
  const hasPermission = (action: 'create' | 'read' | 'update' | 'delete'): boolean => {
    if (!selectedEntity) return false;
    const currentRole = user?.role as string || 'ADMIN';
    const permissionMap: Record<string, string[]> = {
      create: selectedEntity.permissions.canCreate as string[],
      read: selectedEntity.permissions.canRead as string[],
      update: selectedEntity.permissions.canUpdate as string[],
      delete: selectedEntity.permissions.canDelete as string[],
    };
    return permissionMap[action].includes(currentRole);
  };

  // Filter data by search
  const getFilteredData = () => {
    if (!selectedEntity) return [];
    const data = entityData;
    if (!searchQuery) return data;
    
    return data.filter((item: any) => 
      selectedEntity.searchFields.some((field: string) => 
        String(item[field] || '').toLowerCase().includes(searchQuery.toLowerCase())
      )
    );
  };

  const handleEdit = (item: any) => {
    setEditItem({ ...item });
    setIsEditDialogOpen(true);
  };

  const openDeleteDialog = (item: any) => {
    setItemToDelete(item);
    setIsDeleteDialogOpen(true);
  };

  const handleSave = async () => {
    await updateItem();
    setIsEditDialogOpen(false);
    setEditItem(null);
  };

  const confirmDelete = async () => {
    if (itemToDelete) {
      await deleteItem(itemToDelete);
    }
    setIsDeleteDialogOpen(false);
    setItemToDelete(null);
  };

  // Entity List View
  if (!selectedEntity) {
    return (
      <div className="p-6">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">
            Data <span className="gradient-text">Management</span>
          </h1>
          <p className="text-muted-foreground">
            Manage all your content, services, pricing, and settings from one place.
          </p>
        </div>

        {/* Categories */}
        {entityCategories.map(category => {
          const categoryEntities = crudEntities.filter(e => 
            e.category === category.id && e.isVisible
          );
          if (categoryEntities.length === 0) return null;

          const CategoryIcon = categoryIcons[category.id] || Database;

          return (
            <div key={category.id} className="mb-8">
              <div className="flex items-center gap-2 mb-4">
                <CategoryIcon className="w-5 h-5 text-emerald-400" />
                <h2 className="text-xl font-semibold">{category.name}</h2>
                <span className="text-sm text-muted-foreground">({categoryEntities.length} entities)</span>
              </div>
              
              <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {categoryEntities.map(entity => {
                  const EntityIcon = iconMap[entity.icon] || Database;
                  const dataCount = entityData.length;
                  
                  return (
                    <motion.div
                      key={entity.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      whileHover={{ scale: 1.02 }}
                      onClick={() => setSelectedEntity(entity)}
                      className="cursor-pointer"
                    >
                      <Card className="glass-card h-full hover:border-emerald-500 transition-all duration-300 group">
                        <CardContent className="p-5">
                          <div className="flex items-start justify-between mb-3">
                            <div className={`w-12 h-12 rounded-xl bg-gradient-to-br from-emerald-500/20 to-teal-500/20 flex items-center justify-center group-hover:scale-110 transition-transform`}>
                              <EntityIcon className="w-6 h-6 text-emerald-400" />
                            </div>
                            <Badge variant="outline" className="border-emerald-500/50 text-emerald-400">
                              {dataCount} items
                            </Badge>
                          </div>
                          <h3 className="font-semibold mb-1">{entity.name}</h3>
                          <p className="text-sm text-muted-foreground line-clamp-2">{entity.description}</p>
                          <div className="flex items-center justify-between mt-4">
                            <div className="flex gap-1">
                              {(entity.permissions.canCreate as string[]).includes(user?.role || 'ADMIN') && (
                                <Badge className="bg-emerald-500/30 dark:bg-emerald-500/20 dark:bg-emerald-500/10 text-emerald-400 border-0 text-xs">Create</Badge>
                              )}
                              {(entity.permissions.canUpdate as string[]).includes(user?.role || 'ADMIN') && (
                                <Badge className="bg-blue-500/10 text-blue-400 border-0 text-xs">Edit</Badge>
                              )}
                              {(entity.permissions.canDelete as string[]).includes(user?.role || 'ADMIN') && (
                                <Badge className="bg-red-500/10 text-red-400 border-0 text-xs">Delete</Badge>
                              )}
                            </div>
                            <ChevronRight className="w-4 h-4 text-muted-foreground group-hover:text-emerald-400 group-hover:translate-x-1 transition-all" />
                          </div>
                        </CardContent>
                      </Card>
                    </motion.div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    );
  }

  // Entity Detail View
  const filteredData = getFilteredData();

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <Button 
            variant="ghost" 
            size="icon"
            onClick={() => setSelectedEntity(null)}
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold">{selectedEntity.pluralName}</h1>
            <p className="text-muted-foreground text-sm">{selectedEntity.description}</p>
          </div>
        </div>
        {hasPermission('create') && (
          <Button 
            className="bg-gradient-to-r from-emerald-500 to-teal-600"
            onClick={() => {
              setEditItem({});
              setIsEditDialogOpen(true);
            }}
          >
            <Plus className="w-4 h-4 mr-2" />
            Add {selectedEntity.name}
          </Button>
        )}
      </div>

      {/* Search & Filters */}
      <div className="flex gap-4 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder={`Search ${selectedEntity.pluralName.toLowerCase()}...`}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 bg-muted/30 dark:bg-white/5 border-border"
          />
        </div>
        <Button variant="outline" className="border-border">
          <Filter className="w-4 h-4 mr-2" />
          Filters
        </Button>
        <Button variant="outline" className="border-border">
          <RefreshCw className="w-4 h-4 mr-2" />
          Refresh
        </Button>
      </div>

      {/* Data Table */}
      <Card className="glass-card">
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="border-border hover:bg-muted/30 dark:bg-white/5">
                  {selectedEntity.fields.filter(f => f.isVisible).slice(0, 6).map(field => (
                    <TableHead key={field.name} className="text-muted-foreground font-medium">
                      {field.label}
                    </TableHead>
                  ))}
                  <TableHead className="text-muted-foreground font-medium text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredData.map((item, idx) => (
                  <TableRow key={item.id || idx} className="border-border/50 hover:bg-muted/30 dark:bg-white/5">
                    {selectedEntity.fields.filter(f => f.isVisible).slice(0, 6).map(field => (
                      <TableCell key={field.name} className="text-foreground/80">
                        {field.type === 'boolean' ? (
                          item[field.name] ? (
                            <CheckCircle className="w-4 h-4 text-emerald-400" />
                          ) : (
                            <X className="w-4 h-4 text-muted-foreground" />
                          )
                        ) : field.type === 'multiselect' || field.type === 'select' ? (
                          <div className="flex flex-wrap gap-1">
                            {Array.isArray(item[field.name]) ? (
                              item[field.name].slice(0, 2).map((v: string) => (
                                <Badge key={v} variant="outline" className="text-xs border-emerald-500/50 text-emerald-400">
                                  {v}
                                </Badge>
                              ))
                            ) : (
                              <Badge variant="outline" className="text-xs">
                                {item[field.name]}
                              </Badge>
                            )}
                          </div>
                        ) : (
                          <span className="truncate max-w-[200px] block">
                            {String(item[field.name] || '-').substring(0, 50)}
                          </span>
                        )}
                      </TableCell>
                    ))}
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        {hasPermission('update') && (
                          <Button 
                            variant="ghost" 
                            size="icon"
                            onClick={() => handleEdit(item)}
                          >
                            <Edit className="w-4 h-4 text-muted-foreground hover:text-emerald-400" />
                          </Button>
                        )}
                        <Button variant="ghost" size="icon">
                          <Eye className="w-4 h-4 text-muted-foreground hover:text-blue-400" />
                        </Button>
                        {hasPermission('delete') && (
                          <Button 
                            variant="ghost" 
                            size="icon"
                            onClick={() => openDeleteDialog(item)}
                          >
                            <Trash2 className="w-4 h-4 text-muted-foreground hover:text-red-400" />
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto bg-card border-border">
          <DialogHeader>
            <DialogTitle>
              {editItem?.id ? `Edit ${selectedEntity.name}` : `Add New ${selectedEntity.name}`}
            </DialogTitle>
          </DialogHeader>
          
          <div className="grid gap-4 py-4">
            {selectedEntity.fields.map(field => {
              if (!field.isEditable && field.name !== 'id') return null;
              
              return (
                <div key={field.name} className="grid gap-2">
                  <Label className="text-foreground/80">
                    {field.label}
                    {field.required && <span className="text-red-400 ml-1">*</span>}
                  </Label>
                  
                  {field.type === 'text' && (
                    <Input
                      value={editItem?.[field.name] || ''}
                      onChange={(e) => setEditItem({ ...editItem, [field.name]: e.target.value })}
                      placeholder={field.placeholder}
                      className="bg-muted/30 dark:bg-white/5 border-border"
                    />
                  )}
                  
                  {field.type === 'textarea' && (
                    <Textarea
                      value={editItem?.[field.name] || ''}
                      onChange={(e) => setEditItem({ ...editItem, [field.name]: e.target.value })}
                      placeholder={field.placeholder}
                      className="bg-muted/30 dark:bg-white/5 border-border min-h-[100px]"
                    />
                  )}
                  
                  {field.type === 'number' && (
                    <Input
                      type="number"
                      value={editItem?.[field.name] || ''}
                      onChange={(e) => setEditItem({ ...editItem, [field.name]: Number(e.target.value) })}
                      className="bg-muted/30 dark:bg-white/5 border-border"
                    />
                  )}
                  
                  {field.type === 'boolean' && (
                    <Switch
                      checked={editItem?.[field.name] ?? field.defaultValue ?? false}
                      onCheckedChange={(checked) => setEditItem({ ...editItem, [field.name]: checked })}
                    />
                  )}
                  
                  {field.type === 'select' && (
                    <Select
                      value={editItem?.[field.name] || ''}
                      onValueChange={(value) => setEditItem({ ...editItem, [field.name]: value })}
                    >
                      <SelectTrigger className="bg-muted/30 dark:bg-white/5 border-border">
                        <SelectValue placeholder="Select..." />
                      </SelectTrigger>
                      <SelectContent>
                        {field.options?.map(opt => (
                          <SelectItem key={opt.value} value={opt.value}>
                            {opt.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                </div>
              );
            })}
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
              Cancel
            </Button>
            <Button 
              className="bg-gradient-to-r from-emerald-500 to-teal-600"
              onClick={handleSave}
            >
              <Save className="w-4 h-4 mr-2" />
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent className="bg-card border-border">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-red-400">
              <AlertTriangle className="w-5 h-5" />
              Confirm Delete
            </DialogTitle>
          </DialogHeader>
          <p className="text-muted-foreground py-4">
            Are you sure you want to delete this {selectedEntity.name.toLowerCase()}? 
            This action cannot be undone.
          </p>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>
              Cancel
            </Button>
            <Button 
              variant="destructive"
              onClick={confirmDelete}
            >
              <Trash2 className="w-4 h-4 mr-2" />
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
