'use client';

import React from 'react';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import PageHero from '@/components/layout/PageHero';
import { Mail, MessageCircle, Phone, Building } from 'lucide-react';

export default function ContactUsPage() {
  return (
    <main className="min-h-screen flex flex-col bg-white">
      <Navbar />
      <PageHero
        title="Contact Us"
        description="We'd love to hear from you. Get in touch with our team."
        breadcrumb="Contact Us"
        bgImage="https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=2000&q=80"
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 space-y-16">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">

          {/* Contact Info (col-span-5) */}
          <div className="lg:col-span-5 space-y-6">
            <h3 className="text-2xl font-extrabold text-primary tracking-tight">Get in Touch</h3>
            <p className="text-mutedBlue text-sm leading-relaxed">
              Have questions about a raffle, your coupon code, or prize claims? Our dedicated support team is here to help 24/7.
            </p>

            <div className="space-y-4 pt-2">
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-full bg-lightBlue border border-borderBlue flex items-center justify-center text-secondary shrink-0 shadow-sm">
                  <Mail className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-bold text-primary text-sm">Email Support</h4>
                  <p className="text-mutedBlue text-xs">support@tourraffle.com</p>
                  <p className="text-[11px] text-mutedBlue/80">We typically reply within 24 hours.</p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-full bg-lightBlue border border-borderBlue flex items-center justify-center text-secondary shrink-0 shadow-sm">
                  <MessageCircle className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-bold text-primary text-sm">Live Chat</h4>
                  <p className="text-mutedBlue text-xs">Chat with our support team</p>
                  <p className="text-[11px] text-mutedBlue/80">Available 24/7</p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-full bg-lightBlue border border-borderBlue flex items-center justify-center text-secondary shrink-0 shadow-sm">
                  <Phone className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-bold text-primary text-sm">Phone Support</h4>
                  <p className="text-mutedBlue text-xs">+1 (800) 555-0187</p>
                  <p className="text-[11px] text-mutedBlue/80">Mon - Fri, 9AM - 6PM (EST)</p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-full bg-lightBlue border border-borderBlue flex items-center justify-center text-secondary shrink-0 shadow-sm">
                  <Building className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-bold text-primary text-sm">Business Inquiries</h4>
                  <p className="text-mutedBlue text-xs">business@tourraffle.com</p>
                  <p className="text-[11px] text-mutedBlue/80">For partnerships and advertising.</p>
                </div>
              </div>
            </div>
          </div>

          {/* Contact Form (col-span-7) */}
          <div className="lg:col-span-7 bg-lightBlue border border-borderBlue rounded-2xl p-8 sm:p-10 shadow-card">
            <h3 className="text-2xl font-extrabold text-primary mb-6 tracking-tight">Send Us a Message</h3>

            <form onSubmit={(e) => e.preventDefault()} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-primary mb-1">Full Name</label>
                  <input type="text" placeholder="Enter your full name" className="w-full bg-white border border-borderBlue rounded-xl py-2.5 px-3.5 text-sm text-primary placeholder-mutedBlue focus:outline-none focus:border-secondary transition-colors" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-primary mb-1">Email Address</label>
                  <input type="email" placeholder="Enter your email address" className="w-full bg-white border border-borderBlue rounded-xl py-2.5 px-3.5 text-sm text-primary placeholder-mutedBlue focus:outline-none focus:border-secondary transition-colors" />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-primary mb-1">Subject</label>
                <select className="w-full bg-white border border-borderBlue rounded-xl py-2.5 px-3.5 text-sm text-primary focus:outline-none focus:border-secondary transition-colors">
                  <option>Select a topic</option>
                  <option>Coupon & Payment Issue</option>
                  <option>Entry Verification</option>
                  <option>Winner & Prize Claim</option>
                  <option>Partnership</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-primary mb-1">Message</label>
                <textarea rows={5} placeholder="Type your message here..." className="w-full bg-white border border-borderBlue rounded-xl py-2.5 px-3.5 text-sm text-primary placeholder-mutedBlue focus:outline-none focus:border-secondary transition-colors resize-none"></textarea>
              </div>

              <button type="submit" className="w-full bg-accent hover:bg-accent-hover text-primary font-bold py-3.5 rounded-xl shadow-md transition-colors text-sm">
                Send Message
              </button>
            </form>
          </div>

        </div>
      </div>

      <Footer />
    </main>
  );
}
