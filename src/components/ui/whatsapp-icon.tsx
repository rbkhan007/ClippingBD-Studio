'use client';

import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageCircle } from 'lucide-react';

const DEFAULT_WHATSAPP = '+8801722646692';

export function WhatsAppFloating() {
  const [whatsappNumber, setWhatsappNumber] = useState<string>(DEFAULT_WHATSAPP);
  const [isVisible, setIsVisible] = useState(true);
  const [showTooltip, setShowTooltip] = useState(false);

  useEffect(() => {
    // Fetch CMS settings to get WhatsApp number (cached for 60s)
    const fetchSettings = async () => {
      try {
        const response = await fetch('/api/cms/settings', { 
          next: { revalidate: 60 } 
        });
        if (response.ok) {
          const data = await response.json();
          if (data.success && data.data && data.data.whatsappNumber) {
            let number = data.data.whatsappNumber.replace(/\D/g, '');
            if (!number.startsWith('+') && !number.startsWith('88')) {
              number = '+' + number;
            } else if (number.startsWith('88') && !number.startsWith('+')) {
              number = '+' + number;
            }
            setWhatsappNumber(number);
          }
        }
      } catch (error) {
        console.error('Failed to fetch WhatsApp number:', error);
      }
    };

    fetchSettings();
  }, []);

  const waLink = `https://wa.me/${whatsappNumber.replace(/\D/g, '')}?text=Hi! I'm interested in your services. Can you please provide more information?`;

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.a
          href={waLink}
          target="_blank"
          rel="noopener noreferrer"
          initial={{ scale: 0, opacity: 0, x: 100 }}
          animate={{ scale: 1, opacity: 1, x: 0 }}
          exit={{ scale: 0, opacity: 0, x: 100 }}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.95 }}
          onMouseEnter={() => setShowTooltip(true)}
          onMouseLeave={() => setShowTooltip(false)}
          className="fixed bottom-6 right-6 z-50 flex items-center justify-center w-16 h-16 rounded-full bg-green-500 hover:bg-green-600 shadow-lg hover:shadow-green-500/50 transition-all duration-300 group"
          aria-label="Contact us on WhatsApp"
          title="Chat with us on WhatsApp"
        >
          {/* WhatsApp Icon */}
          <MessageCircle className="w-8 h-8 text-white" />

          {/* Animated pulse ring */}
          <span className="absolute inset-0 rounded-full bg-green-400 animate-ping opacity-40" />
          
          {/* Online status dot */}
          <span className="absolute bottom-1 right-1 w-3 h-3 bg-green-400 rounded-full border-2 border-white" />

          {/* Tooltip */}
          <motion.div
            initial={{ opacity: 0, x: 10 }}
            animate={{ opacity: showTooltip ? 1 : 0, x: showTooltip ? 0 : 10 }}
            className="absolute right-20 top-1/2 -translate-y-1/2 bg-zinc-900 dark:bg-zinc-800 text-white px-4 py-2 rounded-lg text-sm font-medium shadow-xl opacity-0 group-hover:opacity-100 transition-all whitespace-nowrap border border-zinc-700"
          >
            <span className="text-green-400">💬</span> Chat on WhatsApp
            <div className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-full border-8 border-transparent border-l-zinc-900 dark:border-l-zinc-800" />
          </motion.div>
        </motion.a>
      )}
    </AnimatePresence>
  );
}

// Mini floating button for mobile - smaller and less intrusive
export function WhatsAppMini() {
  const [whatsappNumber, setWhatsappNumber] = useState<string>(DEFAULT_WHATSAPP);

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const response = await fetch('/api/cms/settings');
        if (response.ok) {
          const data = await response.json();
          if (data.success && data.data?.whatsappNumber) {
            let number = data.data.whatsappNumber.replace(/\D/g, '');
            number = number.startsWith('+') ? number : number.startsWith('88') ? '+' + number : '+' + number;
            setWhatsappNumber(number);
          }
        }
      } catch (error) {
        console.error('Failed to fetch WhatsApp number:', error);
      }
    };
    fetchSettings();
  }, []);

  const waLink = `https://wa.me/${whatsappNumber.replace(/\D/g, '')}?text=Hi! I need help.`;

  return (
    <a
      href={waLink}
      target="_blank"
      rel="noopener noreferrer"
      className="fixed bottom-4 right-4 z-50 w-12 h-12 rounded-full bg-green-500 flex items-center justify-center shadow-lg md:hidden"
    >
      <MessageCircle className="w-6 h-6 text-white" />
    </a>
  );
}
