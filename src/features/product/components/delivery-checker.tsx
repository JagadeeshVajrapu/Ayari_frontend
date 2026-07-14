'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { MapPin, Truck, CheckCircle, XCircle } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

const DELIVERABLE_PINS = ['110001', '400001', '560001', '600001', '700001', '500001'];

export function DeliveryChecker() {
  const [pincode, setPincode] = useState('');
  const [result, setResult] = useState<'idle' | 'available' | 'unavailable'>('idle');
  const [checking, setChecking] = useState(false);

  const checkDelivery = () => {
    if (pincode.length !== 6) return;
    setChecking(true);
    setTimeout(() => {
      setResult(DELIVERABLE_PINS.some((p) => pincode.startsWith(p.slice(0, 3))) ? 'available' : 'unavailable');
      setChecking(false);
    }, 800);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      className="rounded-3xl border border-border/60 bg-surface-elevated p-5 shadow-soft"
    >
      <div className="mb-3 flex items-center gap-2">
        <MapPin className="h-4 w-4 text-champagne-dark dark:text-champagne" />
        <h3 className="text-sm font-medium text-foreground">Delivery Checker</h3>
      </div>

      <div className="flex gap-2">
        <Input
          type="text"
          placeholder="Enter pincode"
          maxLength={6}
          value={pincode}
          onChange={(e) => {
            setPincode(e.target.value.replace(/\D/g, ''));
            setResult('idle');
          }}
          className="flex-1"
        />
        <Button variant="outline" onClick={checkDelivery} disabled={pincode.length !== 6 || checking}>
          {checking ? '...' : 'Check'}
        </Button>
      </div>

      {result === 'available' && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          className="mt-3 flex items-start gap-2 text-sm text-green-600 dark:text-green-400"
        >
          <CheckCircle className="mt-0.5 h-4 w-4 shrink-0" />
          <div>
            <p className="font-medium">Delivery available</p>
            <p className="flex items-center gap-1 text-xs text-ink-muted">
              <Truck className="h-3 w-3" /> Estimated 3–5 business days · Free shipping
            </p>
          </div>
        </motion.div>
      )}

      {result === 'unavailable' && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          className="mt-3 flex items-center gap-2 text-sm text-red-500"
        >
          <XCircle className="h-4 w-4" />
          Delivery not available for this pincode
        </motion.div>
      )}
    </motion.div>
  );
}
