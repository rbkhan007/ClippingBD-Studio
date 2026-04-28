'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  CreditCard, Plus, Edit, Trash2, Save, X, AlertCircle,
  CheckCircle, Shield, Eye, EyeOff, RefreshCw, Info,
  Wallet, DollarSign, Globe, Key, Server, ExternalLink
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { useAppStore } from '@/store/app-store';
import { GlassCard } from '@/components/ui/glass-card';

// Supported payment providers with icons and info
const PROVIDERS = {
  paypal: {
    name: 'PayPal',
    description: 'Accept payments via PayPal',
    logo: 'https://www.paypalobjects.com/webstatic/mktg/Logo/pp-logo-100px.png',
    fields: ['clientId', 'clientSecret', 'sandbox'],
    currencies: ['USD', 'EUR', 'GBP', 'AUD', 'CAD'],
  },
  stripe: {
    name: 'Stripe',
    description: 'Accept credit card payments via Stripe',
    logo: 'https://images.ctfassets.net/fzn2n1nzq965/HTTOloNPhisV9P4hlMPNA/cacf1bb88b9fc492dfad34378d844280/Stripe_logo.svg',
    fields: ['publicKey', 'secretKey', 'webhookSecret'],
    currencies: ['USD', 'EUR', 'GBP', 'AUD', 'CAD', 'JPY'],
  },
  payoneer: {
    name: 'Payoneer',
    description: 'Global payout service for editors',
    logo: null,
    fields: ['merchantId', 'secretKey'],
    currencies: ['USD', 'EUR', 'GBP'],
  },
  bkash: {
    name: 'bKash',
    description: 'Mobile payment service (Bangladesh)',
    logo: null,
    fields: ['merchantId', 'publicKey', 'secretKey'],
    currencies: ['BDT'],
  },
  nagad: {
    name: 'Nagad',
    description: 'Mobile payment service (Bangladesh)',
    logo: null,
    fields: ['merchantId', 'publicKey', 'secretKey'],
    currencies: ['BDT'],
  },
  others: {
    name: 'Other',
    description: 'Custom payment gateway',
    logo: null,
    fields: ['publicKey', 'secretKey', 'webhookSecret'],
    currencies: ['USD', 'EUR', 'GBP', 'BDT'],
  },
};

interface PaymentGateway {
  id: string;
  provider: string;
  displayName: string;
  isEnabled: boolean;
  publicKey: string | null;
  secretKey: string | null;
  webhookSecret: string | null;
  merchantId: string | null;
  currency: string;
  additionalConfig: string | null;
  description: string | null;
  logoUrl: string | null;
  sortOrder: number;
  createdAt: string;
  updatedAt: string;
}

// Gateway Card Component
function GatewayCard({ 
  gateway, 
  onEdit, 
  onToggle,
  onDelete 
}: { 
  gateway: PaymentGateway;
  onEdit: (gateway: PaymentGateway) => void;
  onToggle: (id: string, enabled: boolean) => void;
  onDelete: (id: string) => void;
}) {
  const provider = PROVIDERS[gateway.provider as keyof typeof PROVIDERS] || PROVIDERS.others;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <Card className={`glass-card ${gateway.isEnabled ? 'border-emerald-500/30' : 'border-border'}`}>
        <CardContent className="p-6">
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center gap-3">
              {provider.logo ? (
                <img src={provider.logo} alt={provider.name} className="h-8 w-auto" />
              ) : (
                <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center">
                  <CreditCard className="w-5 h-5 text-white" />
                </div>
              )}
              <div>
                <h3 className="font-semibold">{gateway.displayName}</h3>
                <p className="text-sm text-muted-foreground">{provider.description}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Badge className={gateway.isEnabled ? 'bg-emerald-500/30 text-emerald-400' : 'bg-slate-500/20 text-muted-foreground'}>
                {gateway.isEnabled ? 'Enabled' : 'Disabled'}
              </Badge>
            </div>
          </div>

          <div className="space-y-2 mb-4">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Currency</span>
              <span className="font-medium">{gateway.currency}</span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Public Key</span>
              <span className="font-mono text-xs">
                {gateway.publicKey ? `${gateway.publicKey.slice(0, 12)}...` : 'Not set'}
              </span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Secret Key</span>
              <span className="font-mono text-xs">
                {gateway.secretKey ? '••••••••••••' : 'Not set'}
              </span>
            </div>
          </div>

          <Separator className="mb-4" />

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Switch
                checked={gateway.isEnabled}
                onCheckedChange={(checked) => onToggle(gateway.id, checked)}
              />
              <span className="text-sm text-muted-foreground">
                {gateway.isEnabled ? 'Active' : 'Inactive'}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" onClick={() => onEdit(gateway)}>
                <Edit className="w-4 h-4 mr-1" />
                Edit
              </Button>
              <Button 
                variant="outline" 
                size="sm" 
                className="text-red-400 hover:text-red-300"
                onClick={() => onDelete(gateway.id)}
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}

// Gateway Edit Dialog
function GatewayDialog({ 
  gateway, 
  isOpen, 
  onClose, 
  onSave 
}: { 
  gateway: PaymentGateway | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: Record<string, unknown>) => void;
}) {
  const [formData, setFormData] = useState({
    provider: 'paypal',
    displayName: '',
    isEnabled: false,
    publicKey: '',
    secretKey: '',
    webhookSecret: '',
    merchantId: '',
    currency: 'USD',
    description: '',
    sandbox: true,
  });
  const [showSecret, setShowSecret] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (gateway) {
      const additionalConfig = gateway.additionalConfig 
        ? JSON.parse(gateway.additionalConfig) 
        : { sandbox: true };
      
      setFormData({
        provider: gateway.provider,
        displayName: gateway.displayName,
        isEnabled: gateway.isEnabled,
        publicKey: gateway.publicKey || '',
        secretKey: '', // Don't prefill secret
        webhookSecret: '', // Don't prefill webhook secret
        merchantId: gateway.merchantId || '',
        currency: gateway.currency,
        description: gateway.description || '',
        sandbox: additionalConfig.sandbox ?? true,
      });
    } else {
      setFormData({
        provider: 'paypal',
        displayName: '',
        isEnabled: false,
        publicKey: '',
        secretKey: '',
        webhookSecret: '',
        merchantId: '',
        currency: 'USD',
        description: '',
        sandbox: true,
      });
    }
  }, [gateway, isOpen]);

  const provider = PROVIDERS[formData.provider as keyof typeof PROVIDERS] || PROVIDERS.others;

  const handleSubmit = async () => {
    setLoading(true);
    try {
      const additionalConfig = { sandbox: formData.sandbox };
      
      await onSave({
        id: gateway?.id,
        provider: formData.provider,
        displayName: formData.displayName,
        isEnabled: formData.isEnabled,
        publicKey: formData.publicKey || null,
        secretKey: formData.secretKey || undefined,
        webhookSecret: formData.webhookSecret || undefined,
        merchantId: formData.merchantId || null,
        currency: formData.currency,
        description: formData.description || null,
        additionalConfig,
      });
      onClose();
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="glass-card max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <CreditCard className="w-5 h-5 text-emerald-400" />
            {gateway ? 'Edit Payment Gateway' : 'Add Payment Gateway'}
          </DialogTitle>
          <DialogDescription>
            Configure payment gateway credentials. Secrets are encrypted before storage.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Provider Selection */}
          <div className="space-y-2">
            <Label>Provider</Label>
            <Select
              value={formData.provider}
              onValueChange={(value) => setFormData(prev => ({ ...prev, provider: value }))}
              disabled={!!gateway}
            >
              <SelectTrigger className="bg-muted/30 dark:bg-white/5 border-border">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {Object.entries(PROVIDERS).map(([key, p]) => (
                  <SelectItem key={key} value={key}>
                    {p.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Display Name */}
          <div className="space-y-2">
            <Label>Display Name</Label>
            <Input
              value={formData.displayName}
              onChange={(e) => setFormData(prev => ({ ...prev, displayName: e.target.value }))}
              placeholder="e.g., PayPal Checkout"
              className="bg-muted/30 dark:bg-white/5 border-border"
            />
          </div>

          {/* Currency */}
          <div className="space-y-2">
            <Label>Default Currency</Label>
            <Select
              value={formData.currency}
              onValueChange={(value) => setFormData(prev => ({ ...prev, currency: value }))}
            >
              <SelectTrigger className="bg-muted/30 dark:bg-white/5 border-border">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {provider.currencies.map((c) => (
                  <SelectItem key={c} value={c}>{c}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Public Key / Client ID */}
          <div className="space-y-2">
            <Label className="flex items-center gap-2">
              <Key className="w-4 h-4" />
              {formData.provider === 'paypal' ? 'Client ID' : 'Public Key'}
            </Label>
            <Input
              value={formData.publicKey}
              onChange={(e) => setFormData(prev => ({ ...prev, publicKey: e.target.value }))}
              placeholder={formData.provider === 'paypal' ? 'PayPal Client ID' : 'Public key'}
              className="bg-muted/30 dark:bg-white/5 border-border font-mono text-sm"
            />
          </div>

          {/* Secret Key */}
          <div className="space-y-2">
            <Label className="flex items-center gap-2">
              <Shield className="w-4 h-4" />
              {formData.provider === 'paypal' ? 'Client Secret' : 'Secret Key'}
            </Label>
            <div className="relative">
              <Input
                type={showSecret ? 'text' : 'password'}
                value={formData.secretKey}
                onChange={(e) => setFormData(prev => ({ ...prev, secretKey: e.target.value }))}
                placeholder={gateway ? 'Leave empty to keep existing' : 'Enter secret key'}
                className="bg-muted/30 dark:bg-white/5 border-border font-mono text-sm pr-10"
              />
              <button
                type="button"
                onClick={() => setShowSecret(!showSecret)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              >
                {showSecret ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
            {gateway && (
              <p className="text-xs text-muted-foreground">
                Leave empty to keep existing secret
              </p>
            )}
          </div>

          {/* Webhook Secret (for Stripe) */}
          {formData.provider === 'stripe' && (
            <div className="space-y-2">
              <Label className="flex items-center gap-2">
                <Server className="w-4 h-4" />
                Webhook Secret
              </Label>
              <Input
                type="password"
                value={formData.webhookSecret}
                onChange={(e) => setFormData(prev => ({ ...prev, webhookSecret: e.target.value }))}
                placeholder={gateway ? 'Leave empty to keep existing' : 'whsec_...'}
                className="bg-muted/30 dark:bg-white/5 border-border font-mono text-sm"
              />
            </div>
          )}

          {/* Sandbox Mode (for PayPal) */}
          {formData.provider === 'paypal' && (
            <div className="flex items-center justify-between">
              <Label>Sandbox Mode (Testing)</Label>
              <Switch
                checked={formData.sandbox}
                onCheckedChange={(checked) => setFormData(prev => ({ ...prev, sandbox: checked }))}
              />
            </div>
          )}

          {/* Description */}
          <div className="space-y-2">
            <Label>Description (Optional)</Label>
            <Textarea
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              placeholder="Notes about this gateway..."
              className="bg-muted/30 dark:bg-white/5 border-border"
              rows={2}
            />
          </div>

          {/* Enable Toggle */}
          <div className="flex items-center justify-between">
            <Label>Enable Gateway</Label>
            <Switch
              checked={formData.isEnabled}
              onCheckedChange={(checked) => setFormData(prev => ({ ...prev, isEnabled: checked }))}
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose} className="border-border">
            Cancel
          </Button>
          <Button 
            onClick={handleSubmit} 
            disabled={loading || !formData.displayName}
            className="bg-gradient-to-r from-emerald-500 to-teal-600"
          >
            {loading ? (
              <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
            ) : (
              <Save className="w-4 h-4 mr-2" />
            )}
            {gateway ? 'Update Gateway' : 'Add Gateway'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// Main Admin Payments Component
export function AdminPayments() {
  const { user } = useAppStore();
  const [gateways, setGateways] = useState<PaymentGateway[]>([]);
  const [loading, setLoading] = useState(true);
  const [editGateway, setEditGateway] = useState<PaymentGateway | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('gateways');

  const fetchGateways = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/admin/payment-gateways?includeDisabled=true', {
        credentials: 'include',
      });
      
      if (response.ok) {
        const data = await response.json();
        setGateways(data.gateways || []);
      }
    } catch (error) {
      console.error('Failed to fetch gateways:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchGateways();
  }, []);

  const handleToggle = async (id: string, enabled: boolean) => {
    try {
      const response = await fetch('/api/admin/payment-gateways', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ id, isEnabled: enabled }),
      });
      
      if (response.ok) {
        setGateways(prev => prev.map(g => 
          g.id === id ? { ...g, isEnabled: enabled } : g
        ));
      }
    } catch (error) {
      console.error('Failed to toggle gateway:', error);
    }
  };

  const handleSave = async (data: Record<string, unknown>) => {
    try {
      const isEdit = !!data.id;
      const url = '/api/admin/payment-gateways';
      const method = isEdit ? 'PUT' : 'POST';
      
      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(data),
      });
      
      if (response.ok) {
        fetchGateways();
      } else {
        const error = await response.json();
        console.error('Failed to save gateway:', error);
      }
    } catch (error) {
      console.error('Failed to save gateway:', error);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this payment gateway?')) return;
    
    try {
      const response = await fetch(`/api/admin/payment-gateways?id=${id}`, {
        method: 'DELETE',
        credentials: 'include',
      });
      
      if (response.ok) {
        setGateways(prev => prev.filter(g => g.id !== id));
      }
    } catch (error) {
      console.error('Failed to delete gateway:', error);
    }
  };

  const openAddDialog = () => {
    setEditGateway(null);
    setIsDialogOpen(true);
  };

  const openEditDialog = (gateway: PaymentGateway) => {
    setEditGateway(gateway);
    setIsDialogOpen(true);
  };

  const enabledGateways = gateways.filter(g => g.isEnabled);
  const disabledGateways = gateways.filter(g => !g.isEnabled);

  return (
    <div className="py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold mb-1">Payment Gateways</h1>
            <p className="text-muted-foreground">Configure payment providers for global transactions</p>
          </div>
          <div className="flex items-center gap-4">
            <Button 
              onClick={fetchGateways}
              variant="outline"
              className="border-border"
            >
              <RefreshCw className="w-4 h-4 mr-2" />
              Refresh
            </Button>
            <Button 
              onClick={openAddDialog}
              className="bg-gradient-to-r from-emerald-500 to-teal-600"
            >
              <Plus className="w-4 h-4 mr-2" />
              Add Gateway
            </Button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <Card className="glass-card">
            <CardContent className="p-4 text-center">
              <p className="text-2xl font-bold text-emerald-400">{gateways.length}</p>
              <p className="text-xs text-muted-foreground">Total Gateways</p>
            </CardContent>
          </Card>
          <Card className="glass-card">
            <CardContent className="p-4 text-center">
              <p className="text-2xl font-bold text-cyan-400">{enabledGateways.length}</p>
              <p className="text-xs text-muted-foreground">Enabled</p>
            </CardContent>
          </Card>
          <Card className="glass-card">
            <CardContent className="p-4 text-center">
              <p className="text-2xl font-bold text-amber-400">{disabledGateways.length}</p>
              <p className="text-xs text-muted-foreground">Disabled</p>
            </CardContent>
          </Card>
          <Card className="glass-card">
            <CardContent className="p-4 text-center">
              <p className="text-2xl font-bold">
                {new Set(gateways.map(g => g.currency)).size}
              </p>
              <p className="text-xs text-muted-foreground">Currencies</p>
            </CardContent>
          </Card>
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="bg-muted/30 dark:bg-white/5">
            <TabsTrigger value="gateways">All Gateways</TabsTrigger>
            <TabsTrigger value="settings">Global Settings</TabsTrigger>
          </TabsList>

          <TabsContent value="gateways">
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <RefreshCw className="w-8 h-8 animate-spin text-muted-foreground" />
              </div>
            ) : gateways.length === 0 ? (
              <Card className="glass-card">
                <CardContent className="py-12 text-center">
                  <CreditCard className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                  <h3 className="text-lg font-medium mb-2">No Payment Gateways</h3>
                  <p className="text-muted-foreground mb-4">
                    Add a payment gateway to start accepting online payments
                  </p>
                  <Button onClick={openAddDialog} className="bg-gradient-to-r from-emerald-500 to-teal-600">
                    <Plus className="w-4 h-4 mr-2" />
                    Add Your First Gateway
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <div className="grid md:grid-cols-2 gap-6">
                {enabledGateways.map((gateway) => (
                  <GatewayCard
                    key={gateway.id}
                    gateway={gateway}
                    onEdit={openEditDialog}
                    onToggle={handleToggle}
                    onDelete={handleDelete}
                  />
                ))}
                {disabledGateways.map((gateway) => (
                  <GatewayCard
                    key={gateway.id}
                    gateway={gateway}
                    onEdit={openEditDialog}
                    onToggle={handleToggle}
                    onDelete={handleDelete}
                  />
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="settings">
            <Card className="glass-card">
              <CardHeader>
                <CardTitle>Global Payment Settings</CardTitle>
                <CardDescription>Configure default payment behavior</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Default Currency</p>
                    <p className="text-sm text-muted-foreground">Base currency for all transactions</p>
                  </div>
                  <Select defaultValue="USD">
                    <SelectTrigger className="w-32 bg-muted/30 dark:bg-white/5 border-border">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="USD">USD</SelectItem>
                      <SelectItem value="EUR">EUR</SelectItem>
                      <SelectItem value="GBP">GBP</SelectItem>
                      <SelectItem value="BDT">BDT</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <Separator />

                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Auto Currency Conversion</p>
                    <p className="text-sm text-muted-foreground">Convert amounts to user's preferred currency</p>
                  </div>
                  <Switch defaultChecked />
                </div>

                <Separator />

                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Payment Webhooks</p>
                    <p className="text-sm text-muted-foreground">Enable real-time payment notifications</p>
                  </div>
                  <Switch defaultChecked />
                </div>

                 <div className="bg-muted/30 dark:bg-white/5 rounded-lg p-4">
                   <h4 className="font-medium mb-2 flex items-center gap-2">
                     <Info className="w-4 h-4 text-cyan-400" />
                     Webhook Endpoints
                   </h4>
                   <div className="space-y-2 text-sm">
                     <div className="flex items-center justify-between">
                       <span className="text-muted-foreground">Stripe</span>
                       <code className="text-xs bg-background px-2 py-1 rounded">/api/payments/webhooks/stripe</code>
                     </div>
                     <div className="flex items-center justify-between">
                       <span className="text-muted-foreground">PayPal</span>
                       <code className="text-xs bg-background px-2 py-1 rounded">/api/payments/webhooks/paypal (coming soon)</code>
                     </div>
                   </div>
                   <p className="text-xs text-muted-foreground mt-2">
                     Configure these URLs in your Stripe/PayPal dashboard for real-time payment automation.
                   </p>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>

      {/* Edit Dialog */}
      <GatewayDialog
        gateway={editGateway}
        isOpen={isDialogOpen}
        onClose={() => setIsDialogOpen(false)}
        onSave={handleSave}
      />
    </div>
  );
}

export default AdminPayments;
