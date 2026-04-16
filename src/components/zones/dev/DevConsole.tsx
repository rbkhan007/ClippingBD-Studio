'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  Terminal, Database, Server, Shield, Bell, Zap, Lock, RefreshCw,
  Download, Upload, Trash2, Bug, Activity, HardDrive, Clock,
  AlertTriangle, CheckCircle, XCircle, Settings, Globe, Key
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Progress } from '@/components/ui/progress';
import { useAppStore } from '@/store/app-store';

interface SystemStatus {
  status: 'healthy' | 'warning' | 'error';
  uptime: string;
  memory: { used: number; total: number };
  cpu: number;
  database: 'connected' | 'disconnected';
  storage: 'active' | 'inactive';
}

interface LogEntry {
  id: string;
  timestamp: string;
  level: 'info' | 'warn' | 'error';
  message: string;
  source: string;
}

export function DevConsole() {
  const { user } = useAppStore();
  const [activeTab, setActiveTab] = useState('overview');
  const [systemStatus, setSystemStatus] = useState<SystemStatus>({
    status: 'healthy',
    uptime: '3d 14h 27m',
    memory: { used: 2.4, total: 8 },
    cpu: 23,
    database: 'connected',
    storage: 'active',
  });
  const [logs, setLogs] = useState<LogEntry[]>([
    { id: '1', timestamp: '2024-01-15 14:32:01', level: 'info', message: 'Server started successfully', source: 'server' },
    { id: '2', timestamp: '2024-01-15 14:32:05', level: 'info', message: 'Database connection established', source: 'database' },
    { id: '3', timestamp: '2024-01-15 14:35:22', level: 'warn', message: 'High memory usage detected', source: 'monitor' },
    { id: '4', timestamp: '2024-01-15 14:40:11', level: 'error', message: 'Failed to process image batch', source: 'worker' },
  ]);

  // Feature toggles
  const [features, setFeatures] = useState({
    maintenanceMode: false,
    debugMode: true,
    verboseLogging: false,
    experimentalAPIs: false,
    rateLimitBypass: false,
    autoBackup: true,
  });

  const handleFeatureToggle = (feature: keyof typeof features) => {
    setFeatures(prev => ({ ...prev, [feature]: !prev[feature] }));
  };

  const handleClearLogs = () => {
    if (confirm('Clear all logs?')) {
      setLogs([]);
    }
  };

  const handleExportLogs = () => {
    const data = JSON.stringify(logs, null, 2);
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `logs-${new Date().toISOString()}.json`;
    a.click();
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Terminal className="w-6 h-6 text-emerald-400" />
            Dev Console
          </h1>
          <p className="text-muted-foreground">System monitoring and developer tools</p>
        </div>
        <Badge variant="outline" className="border-emerald-500 text-emerald-400">
          Developer Access
        </Badge>
      </div>

      {/* System Status Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="glass-card">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/30 dark:bg-emerald-500/20 flex items-center justify-center">
                <Server className="w-5 h-5 text-emerald-400" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Status</p>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                  <span className="font-medium">Healthy</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="glass-card">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-teal-500/20 flex items-center justify-center">
                <Clock className="w-5 h-5 text-teal-400" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Uptime</p>
                <span className="font-medium">{systemStatus.uptime}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="glass-card">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-cyan-500/20 flex items-center justify-center">
                <Database className="w-5 h-5 text-cyan-400" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Database</p>
                <span className="font-medium text-emerald-400 capitalize">{systemStatus.database}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="glass-card">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-blue-500/20 flex items-center justify-center">
                <Activity className="w-5 h-5 text-blue-400" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">CPU</p>
                <span className="font-medium">{systemStatus.cpu}%</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid grid-cols-4 lg:grid-cols-6 gap-2">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="features">Features</TabsTrigger>
          <TabsTrigger value="logs">Logs</TabsTrigger>
          <TabsTrigger value="api">API Keys</TabsTrigger>
          <TabsTrigger value="backups" className="hidden lg:block">Backups</TabsTrigger>
          <TabsTrigger value="security" className="hidden lg:block">Security</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="mt-6 space-y-6">
          <div className="grid lg:grid-cols-2 gap-6">
            <Card className="glass-card">
              <CardHeader>
                <CardTitle className="text-lg">Memory Usage</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Used</span>
                    <span>{systemStatus.memory.used} GB / {systemStatus.memory.total} GB</span>
                  </div>
                  <Progress value={(systemStatus.memory.used / systemStatus.memory.total) * 100} className="h-2" />
                </div>
              </CardContent>
            </Card>

            <Card className="glass-card">
              <CardHeader>
                <CardTitle className="text-lg">Quick Actions</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-3">
                  <Button variant="outline" className="justify-start">
                    <RefreshCw className="w-4 h-4 mr-2" />
                    Clear Cache
                  </Button>
                  <Button variant="outline" className="justify-start">
                    <Database className="w-4 h-4 mr-2" />
                    Run Migrations
                  </Button>
                  <Button variant="outline" className="justify-start">
                    <Download className="w-4 h-4 mr-2" />
                    Export Data
                  </Button>
                  <Button variant="outline" className="justify-start text-red-400">
                    <Trash2 className="w-4 h-4 mr-2" />
                    Clear Logs
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Features Tab */}
        <TabsContent value="features" className="mt-6">
          <Card className="glass-card">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Zap className="w-5 h-5 text-amber-400" />
                Feature Toggles
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-6">
                {Object.entries(features).map(([key, value]) => (
                  <div key={key} className="flex items-center justify-between">
                    <div>
                      <Label className="capitalize">{key.replace(/([A-Z])/g, ' $1')}</Label>
                      <p className="text-sm text-muted-foreground">
                        {key === 'maintenanceMode' && 'Show maintenance page to all users'}
                        {key === 'debugMode' && 'Enable detailed logging and debug tools'}
                        {key === 'verboseLogging' && 'Log all API requests and responses'}
                        {key === 'experimentalAPIs' && 'Enable beta API endpoints'}
                        {key === 'rateLimitBypass' && 'Disable rate limiting for testing'}
                        {key === 'autoBackup' && 'Automatic daily database backups'}
                      </p>
                    </div>
                    <Switch
                      checked={value}
                      onCheckedChange={() => handleFeatureToggle(key as keyof typeof features)}
                    />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Logs Tab */}
        <TabsContent value="logs" className="mt-6">
          <Card className="glass-card">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg flex items-center gap-2">
                  <Terminal className="w-5 h-5" />
                  System Logs
                </CardTitle>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" onClick={handleExportLogs}>
                    <Download className="w-4 h-4 mr-2" />
                    Export
                  </Button>
                  <Button variant="outline" size="sm" className="text-red-400" onClick={handleClearLogs}>
                    <Trash2 className="w-4 h-4 mr-2" />
                    Clear
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 font-mono text-sm">
                {logs.map((log) => (
                  <div
                    key={log.id}
                    className={`p-3 rounded-lg ${
                      log.level === 'error' ? 'bg-red-500/10 border border-red-500/20' :
                      log.level === 'warn' ? 'bg-amber-500/10 border border-amber-500/20' :
                      'bg-muted/30 dark:bg-white/5 border border-border'
                    }`}
                  >
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-muted-foreground">{log.timestamp}</span>
                      <Badge variant="outline" className={
                        log.level === 'error' ? 'border-red-500/50 text-red-400' :
                        log.level === 'warn' ? 'border-amber-500/50 text-amber-400' :
                        'border-emerald-500 text-emerald-400'
                      }>
                        {log.level.toUpperCase()}
                      </Badge>
                      <span className="text-muted-foreground">[{log.source}]</span>
                    </div>
                    <p className="text-slate-200">{log.message}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* API Keys Tab */}
        <TabsContent value="api" className="mt-6">
          <Card className="glass-card">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Key className="w-5 h-5" />
                API Keys Management
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {[
                { name: 'Supabase', key: 'sb_prod_****', status: 'active' },
                { name: 'Stripe', key: 'sk_live_****', status: 'active' },
                { name: 'AWS S3', key: 'AKIA****', status: 'active' },
                { name: 'OpenAI', key: 'sk-****', status: 'inactive' },
              ].map((api) => (
                <div key={api.name} className="flex items-center justify-between p-4 rounded-lg bg-muted/30 dark:bg-white/5">
                  <div>
                    <p className="font-medium">{api.name}</p>
                    <p className="text-sm text-muted-foreground font-mono">{api.key}</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <Badge className={api.status === 'active' ? 'bg-emerald-500/30 dark:bg-emerald-500/20 text-emerald-400' : 'bg-slate-500/20 text-muted-foreground'}>
                      {api.status}
                    </Badge>
                    <Button variant="outline" size="sm">
                      Rotate
                    </Button>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Backups Tab */}
        <TabsContent value="backups" className="mt-6">
          <Card className="glass-card">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <HardDrive className="w-5 h-5" />
                Database Backups
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {[
                { date: '2024-01-15 00:00', size: '156 MB', type: 'Auto' },
                { date: '2024-01-14 00:00', size: '152 MB', type: 'Auto' },
                { date: '2024-01-13 00:00', size: '148 MB', type: 'Auto' },
                { date: '2024-01-12 18:30', size: '145 MB', type: 'Manual' },
              ].map((backup, i) => (
                <div key={i} className="flex items-center justify-between p-4 rounded-lg bg-muted/30 dark:bg-white/5">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-lg bg-emerald-500/30 dark:bg-emerald-500/20 flex items-center justify-center">
                      <Database className="w-5 h-5 text-emerald-400" />
                    </div>
                    <div>
                      <p className="font-medium">{backup.date}</p>
                      <p className="text-sm text-muted-foreground">{backup.size} • {backup.type}</p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm">
                      <Download className="w-4 h-4 mr-2" />
                      Download
                    </Button>
                    <Button variant="outline" size="sm">
                      Restore
                    </Button>
                  </div>
                </div>
              ))}
              
              <Button className="w-full mt-4">
                <Upload className="w-4 h-4 mr-2" />
                Create Manual Backup
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Security Tab */}
        <TabsContent value="security" className="mt-6">
          <Card className="glass-card">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Shield className="w-5 h-5" />
                Security Settings
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="p-4 rounded-lg bg-emerald-500/30 dark:bg-emerald-500/20 dark:bg-emerald-500/10 border border-emerald-500/20">
                <div className="flex items-center gap-2 mb-2">
                  <CheckCircle className="w-5 h-5 text-emerald-400" />
                  <span className="font-medium">All Security Checks Passed</span>
                </div>
                <p className="text-sm text-muted-foreground">Your application is properly secured</p>
              </div>

              {[
                { label: 'HTTPS Enabled', status: true },
                { label: 'Rate Limiting', status: true },
                { label: 'CORS Configured', status: true },
                { label: 'SQL Injection Protection', status: true },
                { label: 'XSS Protection', status: true },
                { label: 'CSRF Protection', status: true },
              ].map((item) => (
                <div key={item.label} className="flex items-center justify-between">
                  <span>{item.label}</span>
                  <div className="flex items-center gap-2">
                    {item.status ? (
                      <CheckCircle className="w-5 h-5 text-emerald-400" />
                    ) : (
                      <XCircle className="w-5 h-5 text-red-400" />
                    )}
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
