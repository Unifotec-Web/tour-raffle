'use client';

import React, { useState } from 'react';
import DashboardLayout from '@/components/dashboard/DashboardLayout';
import Link from 'next/link';
import { CreditCard, ShieldCheck } from 'lucide-react';

export default function CheckoutPage() {
  const [method, setMethod] = useState('card');

  return (
    <DashboardLayout>
      <div className="space-y-8 max-w-3xl mx-auto">
        <div className="text-center space-y-2">
          <h1 className="text-2xl sm:text-3xl font-extrabold text-primary tracking-tight">Checkout</h1>
          <p className="text-mutedBlue text-sm">Complete your purchase by selecting a payment method.</p>
        </div>

        <div className="bg-white border border-borderBlue rounded-2xl p-8 shadow-card space-y-6">
          <h3 className="text-xl font-extrabold text-primary">Payment Method</h3>

          <div className="space-y-3">
            <div
              onClick={() => setMethod('card')}
              className={`border rounded-xl p-4 flex items-center justify-between cursor-pointer transition-colors ${method === 'card' ? 'border-secondary bg-lightBlue ring-2 ring-secondary/30' : 'border-borderBlue bg-white'}`}
            >
              <div className="flex items-center gap-3">
                <CreditCard className="w-5 h-5 text-secondary" />
                <div>
                  <span className="font-bold text-primary text-sm block">Credit / Debit Card</span>
                  <span className="text-[11px] text-mutedBlue">Secure & Instant</span>
                </div>
              </div>
              <span className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${method === 'card' ? 'border-secondary' : 'border-borderBlue'}`}>
                {method === 'card' && <span className="w-2 h-2 rounded-full bg-secondary"></span>}
              </span>
            </div>

            <div
              onClick={() => setMethod('paypal')}
              className={`border rounded-xl p-4 flex items-center justify-between cursor-pointer transition-colors ${method === 'paypal' ? 'border-secondary bg-lightBlue ring-2 ring-secondary/30' : 'border-borderBlue bg-white'}`}
            >
              <div className="flex items-center gap-3">
                <div className="w-5 h-5 rounded bg-secondary/20 flex items-center justify-center text-secondary font-bold text-xs">P</div>
                <div>
                  <span className="font-bold text-primary text-sm block">PayPal</span>
                  <span className="text-[11px] text-mutedBlue">Secure & Instant</span>
                </div>
              </div>
              <span className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${method === 'paypal' ? 'border-secondary' : 'border-borderBlue'}`}>
                {method === 'paypal' && <span className="w-2 h-2 rounded-full bg-secondary"></span>}
              </span>
            </div>
          </div>

          <div className="flex items-start gap-2 pt-2">
            <input type="checkbox" id="checkout-terms" defaultChecked className="mt-0.5 rounded border-borderBlue text-secondary focus:ring-secondary" />
            <label htmlFor="checkout-terms" className="text-xs text-mutedBlue leading-tight">
              I agree to the <Link href="/legal/terms" className="text-secondary font-semibold hover:underline">Terms & Conditions</Link> and <Link href="/legal/privacy" className="text-secondary font-semibold hover:underline">Privacy Policy</Link>
            </label>
          </div>

          <div className="bg-lightBlue border border-borderBlue rounded-xl p-5 space-y-3">
            <h4 className="font-bold text-primary text-sm">Order Summary</h4>
            <div className="flex justify-between text-xs text-mutedBlue"><span>10 Coupons</span><strong className="text-primary">$80.00</strong></div>
            <div className="flex justify-between text-xs text-mutedBlue"><span>Discount (20%)</span><strong className="text-success">-$16.00</strong></div>
            <div className="flex justify-between text-sm font-extrabold text-primary pt-3 border-t border-borderBlue">
              <span>Total Amount</span>
              <span className="text-secondary">$64.00</span>
            </div>
          </div>

          <div className="flex items-center gap-2 text-xs text-mutedBlue">
            <ShieldCheck className="w-4 h-4 text-success shrink-0" />
            <span>Your payment information is safe and secure.</span>
          </div>

          <Link
            href="/dashboard/payment/processing"
            className="block w-full text-center bg-accent hover:bg-accent-hover text-primary font-bold py-3.5 rounded-xl shadow-md transition-colors text-sm"
          >
            Pay Now ($64.00)
          </Link>
        </div>
      </div>
    </DashboardLayout>
  );
}
