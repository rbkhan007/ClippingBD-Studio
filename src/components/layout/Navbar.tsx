'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Menu, X, Bell, User, Wallet, LogOut, Settings,
  ChevronDown, MessageSquare, Home, Image as ImageIcon, Video, Bot,
  Globe, Calculator, Folder, Eye, DollarSign, Users, Phone, Clock
} from 'lucide-react'
import { useAppStore, getDashboardPath, canAccess } from '@/store/app-store'
import { useNotifications } from '@/hooks/realtime/use-notifications'
import { useScrollDirection } from '@/hooks/use-scroll-direction'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem,
  DropdownMenuSeparator, DropdownMenuTrigger, DropdownMenuSub,
  DropdownMenuSubContent, DropdownMenuSubTrigger
} from '@/components/ui/dropdown-menu'
import { ScrollArea } from '@/components/ui/scroll-area'
import { currencies, popularCurrencies, type Currency } from '@/data/currency'
import { ThemeToggle } from '@/components/ui/theme-toggle'
import { Logo } from '@/components/Logo'

const publicNav = [
  { path: '/', label: 'Home', icon: Home },
  { path: '/services/clipping-path', label: 'Clipping Path', icon: ImageIcon },
  { path: '/services/image', label: 'Image', icon: ImageIcon },
  { path: '/services/video', label: 'Video', icon: Video },
  { path: '/services/ai', label: 'AI', icon: Bot },
  { path: '/services/web', label: 'Web', icon: Globe },
  { path: '/pricing', label: 'Pricing', icon: Calculator },
  { path: '/portfolio', label: 'Portfolio', icon: Eye },
  { path: '/studio', label: 'Studio', icon: Folder },
  { path: '/team', label: 'Our Team', icon: Users },
  { path: '/contact', label: 'Contact Us', icon: Phone },
]

// Time Widget Component
function TimeWidget() {
  const [time, setTime] = useState(new Date())
  
  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000)
    return () => clearInterval(timer)
  }, [])
  
  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('en-US', { 
      hour: '2-digit', 
      minute: '2-digit',
      hour12: true 
    })
  }
  
  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', { 
      weekday: 'short',
      month: 'short', 
      day: 'numeric' 
    })
  }
  
  return (
    <div className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-lg glass-card text-sm">
      <Clock className="w-4 h-4 text-emerald-400" />
      <div className="flex items-center gap-2">
        <span className="font-medium text-theme-inverse">{formatTime(time)}</span>
        <span className="text-muted-foreground text-xs">{formatDate(time)}</span>
      </div>
    </div>
  )
}

export function Navbar() {
  const { user, isAuthenticated, currentPage, setCurrentPage, logout, selectedCurrency, setSelectedCurrency } = useAppStore()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [showNotifications, setShowNotifications] = useState(false)
  const { isScrollingDown, isAtTop } = useScrollDirection({ threshold: 50 })

  const { notifications, unreadCount, markAsRead, markAllAsRead } = useNotifications({
    userId: user?.id,
  })

  const handleNavClick = (path: string) => {
    setCurrentPage(path);
    window.history.pushState({}, '', path);
    // Reset scroll position to top immediately and after a small delay
    window.scrollTo({ top: 0, behavior: 'instant' });
    document.documentElement.scrollTop = 0;
    document.body.scrollTop = 0;
    setTimeout(() => {
      window.scrollTo({ top: 0, behavior: 'instant' });
      document.documentElement.scrollTop = 0;
      document.body.scrollTop = 0;
    }, 50);
    setMobileMenuOpen(false);
  }

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'ORDER_UPDATE': return '📦'
      case 'PAYMENT': return '💳'
      case 'NITRO_ALERT': return '⚡'
      case 'QA_FEEDBACK': return '✅'
      case 'CHAT': return '💬'
      default: return '🔔'
    }
  }

  // Determine if navbar should be visible
  const navbarVisible = isAtTop || !isScrollingDown

  const handleCurrencyChange = (currency: Currency) => {
    setSelectedCurrency(currency)
  }

  return (
    <motion.header 
      className="fixed top-0 left-0 right-0 z-50 glass border-b border-border transition-all duration-300"
      initial={{ y: 0 }}
      animate={{ 
        y: navbarVisible ? 0 : -100,
        opacity: navbarVisible ? 1 : 0.9
      }}
      transition={{ 
        type: "spring",
        stiffness: 300,
        damping: 30,
        mass: 0.8
      }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <button 
            onClick={() => handleNavClick('/')}
            className="flex items-center gap-3 group"
            aria-label="Go to homepage"
          >
            <motion.div 
              className="relative"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Logo size={32} showIcons={false} />
            </motion.div>
            <div className="hidden sm:block">
              <span className="text-lg font-bold gradient-text leading-tight block">ClippingPath & Website</span>
              <span className="text-lg font-bold gradient-text leading-tight block">Services Studio</span>
            </div>
          </button>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center gap-1">
            {publicNav.slice(0, 5).map((item) => (
              <motion.button
                key={item.path}
                onClick={() => handleNavClick(item.path)}
                className={`px-3 py-2 rounded-lg text-sm font-medium transition-all
                  ${currentPage === item.path 
                    ? 'text-emerald-400 bg-emerald-500/10' 
                    : 'text-muted-foreground hover:text-foreground hover:bg-black/5 dark:hover:bg-white/5'
                  }`}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                aria-current={currentPage === item.path ? 'page' : undefined}
              >
                {item.label}
              </motion.button>
            ))}
            
            {/* More Dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="flex items-center gap-1 px-3 py-2 rounded-lg text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-black/5 dark:hover:bg-white/5 transition-all" aria-label="More navigation options">
                  More <ChevronDown className="w-4 h-4" aria-hidden="true" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="glass-card min-w-[200px]">
                {publicNav.slice(5).map((item) => (
                  <DropdownMenuItem key={item.path} asChild>
                    <button onClick={() => handleNavClick(item.path)} className="flex items-center gap-2 cursor-pointer w-full text-foreground hover:text-emerald-400 transition-colors">
                      <item.icon className="w-4 h-4 text-emerald-400" />
                      <span>{item.label}</span>
                    </button>
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          </nav>

          {/* Right Side */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Time Widget */}
            <TimeWidget />
            
            {/* Theme Toggle */}
            <ThemeToggle variant="icon" size="sm" />
            
            {/* Currency Selector - Always visible */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="hidden sm:flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg glass-card text-sm font-medium hover:border-emerald-500/30 transition-all">
                  <span className="text-sm">{selectedCurrency.flag}</span>
                  <span className="text-xs text-muted-foreground">{selectedCurrency.code}</span>
                  <ChevronDown className="w-3 h-3 text-muted-foreground" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="glass-card min-w-[200px]">
                <div className="px-2 py-1.5 text-xs text-muted-foreground font-medium">
                  Popular Currencies
                </div>
                {popularCurrencies.map((code) => {
                  const currency = currencies.find(c => c.code === code)
                  if (!currency) return null
                  return (
                    <DropdownMenuItem
                      key={currency.code}
                      onClick={() => handleCurrencyChange(currency)}
                      className={`cursor-pointer ${selectedCurrency.code === currency.code ? 'bg-emerald-500/10 text-emerald-400' : ''}`}
                    >
                      <span className="mr-2">{currency.flag}</span>
                      <span className="flex-1">{currency.code}</span>
                      <span className="text-xs text-muted-foreground">{currency.symbol}</span>
                    </DropdownMenuItem>
                  )
                })}
                <DropdownMenuSeparator className="bg-border" />
                <DropdownMenuSub>
                  <DropdownMenuSubTrigger className="text-xs">
                    <Globe className="w-3 h-3 mr-2" />
                    All Currencies
                  </DropdownMenuSubTrigger>
                  <DropdownMenuSubContent className="glass-card max-h-64 overflow-y-auto">
                    {currencies.map((currency) => (
                      <DropdownMenuItem
                        key={currency.code}
                        onClick={() => handleCurrencyChange(currency)}
                        className={`cursor-pointer ${selectedCurrency.code === currency.code ? 'bg-emerald-500/10 text-emerald-400' : ''}`}
                      >
                        <span className="mr-2">{currency.flag}</span>
                        <span className="flex-1">{currency.name}</span>
                        <span className="text-xs text-muted-foreground">{currency.symbol}</span>
                      </DropdownMenuItem>
                    ))}
                  </DropdownMenuSubContent>
                </DropdownMenuSub>
              </DropdownMenuContent>
            </DropdownMenu>
            
            {isAuthenticated && user ? (
              <>
                {/* Wallet */}
                <motion.div 
                  className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-lg bg-black/5 dark:bg-white/5 border border-border"
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.1 }}
                >
                  <Wallet className="w-4 h-4 text-emerald-400" />
                  <span className="text-sm font-medium text-foreground">${user.walletBalance?.toFixed(2) || '0.00'}</span>
                </motion.div>

                {/* Notifications */}
                <div className="relative">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setShowNotifications(!showNotifications)}
                    className="relative"
                  >
                    <Bell className="w-5 h-5" />
                    {unreadCount > 0 && (
                      <motion.span 
                        className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-red-500 text-white text-xs flex items-center justify-center"
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ type: "spring", stiffness: 500, damping: 25 }}
                      >
                        {unreadCount > 9 ? '9+' : unreadCount}
                      </motion.span>
                    )}
                  </Button>

                  <AnimatePresence>
                    {showNotifications && (
                      <motion.div
                        initial={{ opacity: 0, y: -10, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: -10, scale: 0.95 }}
                        transition={{ type: "spring", stiffness: 400, damping: 25 }}
                        className="absolute right-0 mt-2 w-80 glass-card rounded-xl overflow-hidden"
                      >
                        <div className="p-3 border-b border-border flex items-center justify-between">
                          <span className="font-semibold">Notifications</span>
                          {unreadCount > 0 && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={markAllAsRead}
                              className="text-xs text-emerald-400"
                            >
                              Mark all read
                            </Button>
                          )}
                        </div>
                        <ScrollArea className="max-h-80">
                          {notifications.length === 0 ? (
                            <div className="p-4 text-center text-muted-foreground text-sm">
                              No notifications
                            </div>
                          ) : (
                            notifications.slice(0, 10).map((n) => (
                              <button
                                key={n.id}
                                onClick={() => {
                                  markAsRead(n.id)
                                  if (n.link) handleNavClick(n.link)
                                  setShowNotifications(false)
                                }}
                                className={`w-full p-3 flex items-start gap-3 hover:bg-black/5 dark:hover:bg-white/5 text-left ${
                                  !n.isRead ? 'bg-emerald-500/5' : ''
                                }`}
                              >
                                <span className="text-lg">{getNotificationIcon(n.type)}</span>
                                <div className="flex-1 min-w-0">
                                  <p className="font-medium text-sm text-foreground">{n.title}</p>
                                  <p className="text-xs text-muted-foreground truncate">{n.message}</p>
                                </div>
                              </button>
                            ))
                          )}
                        </ScrollArea>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                {/* Messages */}
                <Button variant="ghost" size="icon" onClick={() => handleNavClick('/messages')}>
                  <MessageSquare className="w-5 h-5" />
                </Button>

                {/* User Menu */}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <button className="flex items-center gap-2 p-1 rounded-lg hover:bg-white/5 transition-all">
                      <Avatar className="w-8 h-8 border-2 border-emerald-500/50">
                        <AvatarImage src={user.avatar || undefined} />
                        <AvatarFallback className="bg-gradient-to-br from-emerald-500 to-teal-600 text-white text-sm">
                          {user.name?.charAt(0) || user.email.charAt(0).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <ChevronDown className="w-4 h-4 text-muted-foreground hidden sm:block" />
                    </button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="glass-card min-w-[220px]">
                    <div className="px-2 py-1.5">
                      <p className="font-medium text-foreground">{user.name || 'User'}</p>
                      <p className="text-sm text-muted-foreground">{user.email}</p>
                      <Badge variant="outline" className="mt-1 text-xs border-emerald-500/50 text-emerald-400">
                        {user.role}
                      </Badge>
                    </div>
                    <DropdownMenuSeparator className="bg-border" />
                    
                    <DropdownMenuItem onClick={() => handleNavClick(getDashboardPath(user.role))}>
                      Dashboard
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => handleNavClick('/profile')}>
                      <Settings className="w-4 h-4 mr-2" />
                      Settings
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => handleNavClick('/billing')}>
                      <Wallet className="w-4 h-4 mr-2" />
                      Wallet
                    </DropdownMenuItem>
                    
                    <DropdownMenuSeparator className="bg-border" />
                    <DropdownMenuItem onClick={logout} className="text-red-400">
                      <LogOut className="w-4 h-4 mr-2" />
                      Logout
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </>
            ) : (
              <>
                <Button variant="ghost" onClick={() => handleNavClick('/auth')} className="hidden sm:inline-flex">
                  Login
                </Button>
                <Button className="bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 border-0" onClick={() => handleNavClick('/auth')}>
                  Get Started
                </Button>
              </>
            )}

            {/* Mobile Menu */}
            <Button
              variant="ghost"
              size="icon"
              className="lg:hidden"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-label={mobileMenuOpen ? 'Close menu' : 'Open menu'}
              aria-expanded={mobileMenuOpen}
            >
              {mobileMenuOpen ? <X className="w-5 h-5" aria-hidden="true" /> : <Menu className="w-5 h-5" aria-hidden="true" />}
            </Button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ type: "spring", stiffness: 400, damping: 30 }}
            className="lg:hidden glass border-t border-border"
            role="navigation"
            aria-label="Mobile navigation"
          >
            <nav className="px-4 py-4 space-y-2">
              {publicNav.map((item) => (
                <button
                  key={item.path}
                  onClick={() => handleNavClick(item.path)}
                  className={`block w-full px-4 py-2 rounded-lg text-sm font-medium transition-all text-left
                    ${currentPage === item.path 
                      ? 'text-emerald-400 bg-emerald-500/10' 
                      : 'text-muted-foreground hover:text-foreground hover:bg-black/5 dark:hover:bg-white/5'
                    }`}
                  aria-current={currentPage === item.path ? 'page' : undefined}
                >
                  {item.label}
                </button>
              ))}
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.header>
  )
}
