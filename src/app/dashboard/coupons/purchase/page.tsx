'use client';

import React, { useState } from 'react';
import DashboardLayout from '@/components/dashboard/DashboardLayout';
import Link from 'next/link';
import { CreditCard, CheckCircle2, ShieldCheck, ArrowRight } from 'lucide-react';

export default function PurchaseCouponsPage() {
  const [selectedQty, setSelectedQty] = useState(10);
  const [success, setSuccess] = useState(false);

  const pricing: Record<number, { price: number; discount: string }> = {
    1: { price: 10, discount: '+ transaction fee' },
    5: { price: 45, discount: 'Save 10%' },
    10: { price: 80, discount: 'Save 20%' },
    20: { price: 150, discount: 'Save 25%' },
  };

  return (
    <DashboardLayout>
      <div className="space-y-8 max-w-4xl mx-auto">

        {!success ? (
          <>
            {/* Header */}
            <div className="text-center space-y-2">
              <h1 className="text-2xl sm:text-3xl font-extrabold text-primary tracking-tight">Purchase Coupons</h1>
              <p className="text-mutedBlue text-sm">Choose the number of coupons you want to buy and complete your payment securely.</p>
            </div>

            {/* Steps indicator */}
            <div className="flex items-center justify-center gap-4 text-xs font-bold text-mutedBlue">
              <span className="flex items-center gap-1.5 text-primary"><span className="w-6 h-6 rounded-full bg-accent text-primary flex items-center justify-center">1</span> Select Quantity</span>
              <span>---</span>
              <span className="flex items-center gap-1.5"><span className="w-6 h-6 rounded-full bg-borderBlue text-mutedBlue flex items-center justify-center">2</span> Payment</span>
              <span>---</span>
              <span className="flex items-center gap-1.5"><span className="w-6 h-6 rounded-full bg-borderBlue text-mutedBlue flex items-center justify-center">3</span> Confirmation</span>
            </div>

            {/* Quantity Cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[1, 5, 10, 20].map((qty) => {
                const isSelected = selectedQty === qty;
                return (
                  <div
                    key={qty}
                    onClick={() => setSelectedQty(qty)}
                    className={`cursor-pointer rounded-2xl p-5 border text-center transition-all relative ${
                      isSelected
                        ? 'border-secondary bg-lightBlue shadow-md ring-2 ring-secondary/30'
                        : 'border-borderBlue bg-white hover:border-secondary/50'
                    }`}
                  >
                    {qty === 10 && (
                      <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-accent text-primary text-[10px] font-extrabold px-2.5 py-0.5 rounded-full uppercase shadow-sm">
                        Most Popular
                      </span>
                    )}
                    <h3 className="font-bold text-primary text-base mb-1">{qty} Coupon{qty > 1 ? 's' : ''}</h3>
                    <div className="text-2xl font-extrabold text-primary mb-1">${pricing[qty].price}.00</div>
                    <span className="text-[11px] text-mutedBlue font-medium block">{pricing[qty].discount}</span>
                  </div>
                );
              })}
            </div>

            {/* Checkout Form */}
            <div className="bg-white border border-borderBlue rounded-2xl p-8 shadow-card space-y-6">
              <h3 className="text-xl font-extrabold text-primary tracking-tight">Checkout & Payment</h3>

              <div className="space-y-3">
                <label className="block text-xs font-bold text-primary">Payment Method</label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="border border-secondary bg-lightBlue rounded-xl p-4 flex items-center justify-between cursor-pointer">
                    <div className="flex items-center gap-3">
                      <CreditCard className="w-5 h-5 text-secondary" />
                      <div>
                        <span className="font-bold text-primary text-sm block">Credit / Debit Card</span>
                        <span className="text-[11px] text-mutedBlue">Secure & Instant</span>
                      </div>
                    </div>
                    <span className="w-4 h-4 rounded-full border-2 border-secondary flex items-center justify-center">
                      <span className="w-2 h-2 rounded-full bg-secondary"></span>
                    </span>
                  </div>

                  <div className="border border-borderBlue bg-white rounded-xl p-4 flex items-center justify-between cursor-pointer hover:border-secondary/50 transition-colors">
                    <div className="flex items-center gap-3">
                      <div className="w-5 h-5 rounded bg-secondary/20 flex items-center justify-center text-secondary font-bold text-xs">P</div>
                      <div>
                        <span className="font-bold text-primary text-sm block">PayPal</span>
                        <span className="text-[11px] text-mutedBlue">Secure & Instant</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Order Summary */}
              <div className="bg-lightBlue border border-borderBlue rounded-xl p-5 space-y-3">
                <h4 className="font-bold text-primary text-sm">Order Summary</h4>
                <div className="flex justify-between text-xs text-mutedBlue">
                  <span>{selectedQty} Coupons</span>
                  <span className="font-semibold text-primary">${pricing[selectedQty].price}.00</span>
                </div>
                <div className="flex justify-between text-xs text-mutedBlue">
                  <span>Discount (20%)</span>
                  <span className="font-semibold text-success">-${(pricing[selectedQty].price * 0.2).toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm font-extrabold text-primary pt-3 border-t border-borderBlue">
                  <span>Total Amount</span>
                  <span className="text-secondary">${(pricing[selectedQty].price * 0.8).toFixed(2)}</span>
                </div>
              </div>

              {/* Secure Payment Note */}
              <div className="flex items-center gap-2 text-xs text-mutedBlue">
                <ShieldCheck className="w-4 h-4 text-success shrink-0" />
                <span>Your payment is secured with industry-leading encryption. Your payment information is safe.</span>
              </div>

              <button
                onClick={() => setSuccess(true)}
                className="w-full bg-accent hover:bg-accent-hover text-primary font-bold py-3.5 rounded-xl shadow-md transition-all text-sm"
              >
                Proceed to Checkout →
              </button>
            </div>
          </>
        ) : (
          /* Payment Successful Confirmation */
          <div className="bg-white border border-borderBlue rounded-2xl p-10 shadow-card text-center space-y-6">
            <div className="w-16 h-16 rounded-full bg-success/15 border border-success/30 flex items-center justify-center text-success mx-auto shadow-sm">
              <CheckCircle2 className="w-8 h-8" />
            </div>

            <div>
              <h1 className="text-2xl font-extrabold text-primary tracking-tight">Payment Successful!</h1>
              <p className="text-mutedBlue text-xs mt-1">Your payment has been confirmed. Your coupons have been added to your account.</p>
            </div>

            <div className="bg-lightBlue border border-borderBlue rounded-xl p-6 text-left max-w-md mx-auto space-y-3 text-xs">
              <div className="flex justify-between"><span className="text-mutedBlue">Reference ID:</span><strong className="text-primary font-mono">TRX-3005-1048</strong></div>
              <div className="flex justify-between"><span className="text-mutedBlue">Amount Paid:</span><strong className="text-primary">$64.00</strong></div>
              <div className="flex justify-between"><span className="text-mutedBlue">Payment Method:</span><strong className="text-primary">Credit Card</strong></div>
              <div className="flex justify-between"><span className="text-mutedBlue">Date:</span><strong className="text-primary">Oct 12, 2025 10:34 AM</strong></div>
            </div>

            <div className="pt-2 flex flex-col sm:flex-row gap-3 justify-center">
              <Link
                href="/dashboard/coupons"
                className="bg-accent hover:bg-accent-hover text-primary font-bold px-6 py-3 rounded-pill shadow transition-colors text-sm"
              >
                View Coupons
              </Link>
              <Link
                href="/dashboard"
                className="bg-white hover:bg-lightBlue text-primary font-semibold px-6 py-3 rounded-pill border border-borderBlue transition-colors text-sm shadow-sm"
              >
                Back to Dashboard
              </Link>
            </div>
          </div>
        )}

      </div>
    </DashboardLayout>
  );
}
