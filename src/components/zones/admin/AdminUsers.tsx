'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import {
  Users, Search, Plus, Edit, Trash2, Shield, Mail, Phone,
  Calendar, DollarSign, Image as ImageIcon, Video, Bot, MoreVertical,
  Filter, Download, Upload, UserCheck, UserX, Key, Loader2,
  ChevronUp, ChevronDown
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter
} from '@/components/ui/dialog';
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAppStore } from '@/store/app-store';
import type { UserRole } from '@/types/database';
import { useToast } from '@/hooks/use-toast';

interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  avatar?: string;
  walletBalance: number;
  createdAt: string;
  lastLoginAt?: string;
  status: string;
  wallet_balance: number;
  is_active?: boolean;
  email_verified?: boolean;
  total_orders?: number;
  total_spent?: number;
}

const roleColors: Record<UserRole, string> = {
  GUEST: 'bg-slate-500/20 text-muted-foreground',
  CLIENT: 'bg-emerald-500/30 dark:bg-emerald-500/20 text-emerald-400',
  EDITOR: 'bg-blue-500/20 text-blue-400',
  QA: 'bg-purple-500/20 text-purple-400',
  ADMIN: 'bg-amber-500/20 text-amber-400',
  DEVELOPER: 'bg-red-500/20 text-red-400',
};

export function AdminUsers() {
  const { user: currentUser } = useAppStore();
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState('');
  const [filterRole, setFilterRole] = useState<string>('all');
  const [activeTab, setActiveTab] = useState('all');
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [walletAdjustment, setWalletAdjustment] = useState<{ amount: number; type: 'add' | 'set' }>({ amount: 0, type: 'add' });
  const [isWalletDialogOpen, setIsWalletDialogOpen] = useState(false);
  const [scrollDirection, setScrollDirection] = useState<'top' | 'bottom'>('top');

  const handleScroll = (direction: 'top' | 'bottom') => {
    const el = document.getElementById('admin-users-scroll');
    if (el) {
      const viewport = el.querySelector('[data-slot="scroll-area-viewport"]') as HTMLElement;
      if (viewport) {
        viewport.scrollTo({ top: direction === 'top' ? 0 : viewport.scrollHeight, behavior: 'smooth' });
      }
      setScrollDirection(direction);
    }
  };

  const isDev = currentUser?.role === 'DEVELOPER';
  const isAdmin = currentUser?.role === 'ADMIN' || isDev;

  const fetchUsers = useCallback(async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/users?limit=100', { credentials: 'include' });
      const data = await response.json();
      if (data.users) {
        setUsers(data.users.map((u: any) => ({
          ...u,
          wallet_balance: u.walletBalance || 0,
          is_active: u.status === 'ACTIVE',
          email_verified: true,
          total_orders: u._count?.orders || 0,
          total_spent: 0,
        })));
      }
    } catch (error) {
      console.error('Error fetching users:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const filteredUsers = users.filter(user => {
    const matchesSearch = 
      user.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (user.name && user.name.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesRole = filterRole === 'all' || user.role === filterRole;
    const matchesTab = 
      activeTab === 'all' ||
      (activeTab === 'active' && user.is_active) ||
      (activeTab === 'inactive' && !user.is_active);
    return matchesSearch && matchesRole && matchesTab;
  });

  const handleSaveUser = async () => {
    if (!editingUser) return;
    try {
      const response = await fetch('/api/users', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          userId: editingUser.id,
          name: editingUser.name,
          email: editingUser.email,
          role: editingUser.role,
          status: editingUser.is_active ? 'ACTIVE' : 'SUSPENDED',
          walletBalance: editingUser.wallet_balance,
        }),
      });
      if (response.ok) {
        toast({ title: 'User updated successfully' });
        fetchUsers();
      } else {
        const data = await response.json();
        toast({ title: data.error || 'Failed to update user', variant: 'destructive' });
      }
    } catch (error) {
      console.error('Error updating user:', error);
      toast({ title: 'Failed to update user', variant: 'destructive' });
    }
    setIsDialogOpen(false);
    setEditingUser(null);
  };

  const handleWalletUpdate = async () => {
    if (!editingUser) return;
    try {
      const response = await fetch('/api/users', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          userId: editingUser.id,
          walletBalance: walletAdjustment.type === 'set' 
            ? walletAdjustment.amount 
            : editingUser.walletBalance + walletAdjustment.amount,
        }),
      });
      if (response.ok) {
        const data = await response.json();
        setUsers(prev => prev.map(u => 
          u.id === editingUser.id 
            ? { ...u, walletBalance: data.user.walletBalance, wallet_balance: data.user.walletBalance } 
            : u
        ));
        toast({ title: 'Wallet updated successfully' });
      }
    } catch (error) {
      console.error('Error updating wallet:', error);
      toast({ title: 'Failed to update wallet', variant: 'destructive' });
    }
    setIsWalletDialogOpen(false);
    setWalletAdjustment({ amount: 0, type: 'add' });
  };

  const handleDeleteUser = async (id: string) => {
    if (!confirm('Are you sure you want to delete this user?')) return;
    try {
      await fetch(`/api/users?userId=${id}`, { method: 'DELETE', credentials: 'include' });
      setUsers(prev => prev.filter(u => u.id !== id));
      toast({ title: 'User deleted successfully' });
    } catch (error) {
      console.error('Error deleting user:', error);
      toast({ title: 'Failed to delete user', variant: 'destructive' });
    }
  };

  const openEditDialog = (user: User) => {
    setEditingUser({ ...user });
    setIsDialogOpen(true);
  };

  const openWalletDialog = (user: User) => {
    setEditingUser({ ...user });
    setWalletAdjustment({ amount: 0, type: 'add' });
    setIsWalletDialogOpen(true);
  };

  const handleToggleActive = (id: string) => {
    setUsers(prev => prev.map(u => 
      u.id === id ? { ...u, is_active: !u.is_active } : u
    ));
  };

  const stats = {
    total: users.length,
    active: users.filter(u => u.is_active).length,
    clients: users.filter(u => u.role === 'CLIENT').length,
    staff: users.filter(u => ['EDITOR', 'QA', 'ADMIN', 'DEVELOPER'].includes(u.role)).length,
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
        <div>
          <h1 className="text-2xl font-bold">User Management</h1>
          <p className="text-muted-foreground">Manage all users, roles, and permissions</p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline">
            <Download className="w-4 h-4 mr-2" />
            Export
          </Button>
          <Button variant="outline">
            <Upload className="w-4 h-4 mr-2" />
            Import
          </Button>
          {isDev && (
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              Add User
            </Button>
          )}
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="glass-card">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/30 dark:bg-emerald-500/20 flex items-center justify-center">
                <Users className="w-5 h-5 text-emerald-400" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total Users</p>
                <p className="text-xl font-bold">{stats.total}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="glass-card">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-teal-500/20 flex items-center justify-center">
                <UserCheck className="w-5 h-5 text-teal-400" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Active</p>
                <p className="text-xl font-bold">{stats.active}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="glass-card">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-cyan-500/20 flex items-center justify-center">
                <ImageIcon className="w-5 h-5 text-cyan-400" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Clients</p>
                <p className="text-xl font-bold">{stats.clients}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="glass-card">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-blue-500/20 flex items-center justify-center">
                <Shield className="w-5 h-5 text-blue-400" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Staff</p>
                <p className="text-xl font-bold">{stats.staff}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs & Filters */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center mb-4">
          <TabsList>
            <TabsTrigger value="all">All</TabsTrigger>
            <TabsTrigger value="active">Active</TabsTrigger>
            <TabsTrigger value="inactive">Inactive</TabsTrigger>
            <TabsTrigger value="unverified">Unverified</TabsTrigger>
          </TabsList>

          <div className="flex gap-3 w-full sm:w-auto">
            <div className="relative flex-1 sm:flex-initial">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search users..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 w-full sm:w-64"
              />
            </div>
            <Select value={filterRole} onValueChange={setFilterRole}>
              <SelectTrigger className="w-32">
                <SelectValue placeholder="Role" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Roles</SelectItem>
                <SelectItem value="CLIENT">Clients</SelectItem>
                <SelectItem value="EDITOR">Editors</SelectItem>
                <SelectItem value="QA">QA</SelectItem>
                <SelectItem value="ADMIN">Admins</SelectItem>
                <SelectItem value="DEVELOPER">Developers</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <TabsContent value={activeTab} className="relative">
          {/* Users List */}
          <ScrollArea className="h-[600px] lg:h-[calc(100vh-450px)]" id="admin-users-scroll">
            <div className="space-y-3">
              {filteredUsers.map((user, index) => (
                <motion.div
                  key={user.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.03 }}
                >
                  <Card className="glass-card hover:border-emerald-500 transition-all">
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <Avatar className="w-12 h-12 border-2 border-emerald-500">
                            <AvatarImage src={user.avatar} />
                            <AvatarFallback className="bg-gradient-to-br from-emerald-500 to-teal-600 text-white">
                              {user.name.charAt(0).toUpperCase()}
                            </AvatarFallback>
                          </Avatar>
                          
                          <div>
                            <div className="flex items-center gap-2">
                              <h3 className="font-semibold">{user.name}</h3>
                              <Badge className={roleColors[user.role]}>
                                {user.role}
                              </Badge>
                              {!user.is_active && (
                                <Badge variant="outline" className="text-red-400 border-red-400/50">
                                  Inactive
                                </Badge>
                              )}
                              {!user.email_verified && (
                                <Badge variant="outline" className="text-amber-400 border-amber-400/50">
                                  Unverified
                                </Badge>
                              )}
                            </div>
                            <p className="text-sm text-muted-foreground">{user.email}</p>
                          </div>
                        </div>

                        <div className="hidden lg:flex items-center gap-6 text-sm">
                          <div className="text-center">
                            <p className="text-muted-foreground">Wallet</p>
                            <p className="font-medium">${user.wallet_balance.toFixed(2)}</p>
                          </div>
                          {user.role === 'CLIENT' && (
                            <>
                              <div className="text-center">
                                <p className="text-muted-foreground">Orders</p>
                                <p className="font-medium">{user.total_orders}</p>
                              </div>
                              <div className="text-center">
                                <p className="text-muted-foreground">Spent</p>
                                <p className="font-medium">${user.total_spent}</p>
                              </div>
                            </>
                          )}
                            <div className="text-center">
                            <p className="text-muted-foreground">Joined</p>
                            <p className="font-medium">{new Date(user.createdAt || '2024-01-01').toLocaleDateString()}</p>
                            </div>
                        </div>

                        <div className="flex items-center gap-2">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleToggleActive(user.id)}
                          >
                            {user.is_active ? (
                              <UserCheck className="w-4 h-4 text-emerald-400" />
                            ) : (
                              <UserX className="w-4 h-4 text-red-400" />
                            )}
                          </Button>
                          
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon">
                                <MoreVertical className="w-4 h-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="glass-card">
                              <DropdownMenuItem onClick={() => { setEditingUser(user); setIsDialogOpen(true); }}>
                                <Edit className="w-4 h-4 mr-2" />
                                Edit User
                              </DropdownMenuItem>
                              <DropdownMenuItem>
                                <Key className="w-4 h-4 mr-2" />
                                Reset Password
                              </DropdownMenuItem>
                              <DropdownMenuItem>
                                <Mail className="w-4 h-4 mr-2" />
                                Send Email
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => openWalletDialog(user)}>
                                <DollarSign className="w-4 h-4 mr-2" />
                                Adjust Wallet
                              </DropdownMenuItem>
                              {isDev && (
                                <DropdownMenuItem 
                                  className="text-red-400"
                                  onClick={() => handleDeleteUser(user.id)}
                                >
                                  <Trash2 className="w-4 h-4 mr-2" />
                                  Delete User
                                </DropdownMenuItem>
                              )}
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}

              {filteredUsers.length === 0 && (
                <div className="text-center py-12 text-muted-foreground">
                  No users found matching your criteria
                </div>
              )}
            </div>
          </ScrollArea>
          
          <div className="absolute bottom-4 right-4 flex gap-2 z-10">
            <Button variant="secondary" size="icon" className="h-8 w-8 rounded-full shadow-lg" onClick={() => handleScroll('top')}>
              <ChevronUp className="h-4 w-4" />
            </Button>
            <Button variant="secondary" size="icon" className="h-8 w-8 rounded-full shadow-lg" onClick={() => handleScroll('bottom')}>
              <ChevronDown className="h-4 w-4" />
            </Button>
          </div>
        </TabsContent>
      </Tabs>

      {/* Edit User Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-md glass-card">
          <DialogHeader>
            <DialogTitle>Edit User</DialogTitle>
          </DialogHeader>

          {editingUser && (
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label>Name</Label>
                <Input
                  value={editingUser.name}
                  onChange={(e) => setEditingUser({ ...editingUser, name: e.target.value })}
                />
              </div>
              <div className="grid gap-2">
                <Label>Email</Label>
                <Input
                  value={editingUser.email}
                  onChange={(e) => setEditingUser({ ...editingUser, email: e.target.value })}
                />
              </div>
              <div className="grid gap-2">
                <Label>Role</Label>
                <Select
                  value={editingUser.role}
                  onValueChange={(value) => setEditingUser({ ...editingUser, role: value as UserRole })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="CLIENT">Client</SelectItem>
                    <SelectItem value="EDITOR">Editor</SelectItem>
                    <SelectItem value="QA">QA</SelectItem>
                    <SelectItem value="ADMIN">Admin</SelectItem>
                    {isDev && <SelectItem value="DEVELOPER">Developer</SelectItem>}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label>Wallet Balance</Label>
                <Input
                  type="number"
                  value={editingUser.wallet_balance}
                  onChange={(e) => setEditingUser({ ...editingUser, wallet_balance: parseFloat(e.target.value) })}
                />
              </div>
              <div className="flex items-center justify-between">
                <Label>Active</Label>
                <Switch
                  checked={editingUser.is_active}
                  onCheckedChange={(checked) => setEditingUser({ ...editingUser, is_active: checked })}
                />
              </div>
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSaveUser}>
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Wallet Adjustment Dialog */}
      <Dialog open={isWalletDialogOpen} onOpenChange={setIsWalletDialogOpen}>
        <DialogContent className="glass-card">
          <DialogHeader>
            <DialogTitle>Adjust Wallet Balance</DialogTitle>
          </DialogHeader>
          {editingUser && (
            <div className="grid gap-4 py-4">
              <div className="p-4 bg-muted/30 rounded-lg">
                <p className="text-sm text-muted-foreground">Current Balance</p>
                <p className="text-2xl font-bold">${(editingUser.walletBalance || 0).toFixed(2)}</p>
              </div>
              <div className="grid gap-2">
                <Label>Adjustment Type</Label>
                <Select
                  value={walletAdjustment.type}
                  onValueChange={(value: 'add' | 'set') => setWalletAdjustment({ ...walletAdjustment, type: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="add">Add Amount</SelectItem>
                    <SelectItem value="set">Set New Balance</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label>Amount</Label>
                <Input
                  type="number"
                  value={walletAdjustment.amount}
                  onChange={(e) => setWalletAdjustment({ ...walletAdjustment, amount: parseFloat(e.target.value) || 0 })}
                  placeholder="Enter amount"
                />
              </div>
              <div className="p-4 bg-emerald-500/10 border border-emerald-500/30 rounded-lg">
                <p className="text-sm text-muted-foreground">New Balance Will Be</p>
                <p className="text-xl font-bold text-emerald-400">
                  ${walletAdjustment.type === 'add' 
                    ? ((editingUser.walletBalance || 0) + walletAdjustment.amount).toFixed(2)
                    : walletAdjustment.amount.toFixed(2)
                  }
                </p>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsWalletDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleWalletUpdate}>
              Update Wallet
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
