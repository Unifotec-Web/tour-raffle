import React from 'react';
import DashboardLayout from '@/components/dashboard/DashboardLayout';
import { CheckCircle2, ShieldCheck, FileText } from 'lucide-react';

export default function DrawAuditPage() {
  const processes = [
    { title: 'Random Number Generator', status: 'Completed' },
    { title: 'Independent Verification', status: 'Completed' },
    { title: 'Audit Review', status: 'Completed' },
    { title: 'Official Results', status: 'Completed' },
  ];

  return (
    <DashboardLayout>
      <div className="space-y-8 max-w-4xl mx-auto">

        <div className="text-center space-y-2">
          <h1 className="text-2xl sm:text-3xl font-extrabold text-primary tracking-tight">Draw Verification & Audit Information</h1>
          <p className="text-mutedBlue text-sm">Our draws are conducted fairly and transparently. Here you can view the verification and audit details.</p>
        </div>

        <div className="bg-white border border-borderBlue rounded-2xl p-8 sm:p-10 shadow-card space-y-8">
          <div className="flex items-center justify-between pb-6 border-b border-borderBlue">
            <div>
              <h3 className="text-xl font-extrabold text-primary">Maldives Dream Getaway</h3>
              <p className="text-mutedBlue text-xs mt-0.5">Draw Date: Oct 12, 2025 • Draw ID: TR-2020-001</p>
            </div>
            <span className="bg-success/15 text-success border border-success/30 font-bold text-xs px-3 py-1 rounded-full inline-flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4" /> Verified
            </span>
          </div>

          <div className="space-y-4">
            <h4 className="font-bold text-primary text-sm">Verification Process</h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {processes.map((p, idx) => (
                <div key={idx} className="bg-lightBlue border border-borderBlue rounded-xl p-4 text-center space-y-2">
                  <div className="w-8 h-8 rounded-full bg-success/20 text-success flex items-center justify-center mx-auto">
                    <CheckCircle2 className="w-4 h-4" />
                  </div>
                  <h5 className="font-bold text-primary text-xs">{p.title}</h5>
                  <span className="text-[10px] text-success font-bold uppercase">{p.status}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-lightBlue border border-borderBlue rounded-xl p-6 space-y-3 text-xs">
            <h4 className="font-bold text-primary text-sm mb-2">Audit Information</h4>
            <div className="flex justify-between"><span className="text-mutedBlue">Auditor:</span><strong className="text-primary">Global Fairness Audit (GFA)</strong></div>
            <div className="flex justify-between"><span className="text-mutedBlue">Audit Date:</span><strong className="text-primary">Oct 12, 2025</strong></div>
            <div className="flex justify-between"><span className="text-mutedBlue">Report Reference:</span><strong className="text-primary font-mono">GFA-TR-2025-001</strong></div>
            <div className="flex justify-between"><span className="text-mutedBlue">Verification Status:</span><strong className="text-success">Verified</strong></div>
          </div>

          <div className="pt-2 text-center">
            <button className="inline-flex items-center gap-2 bg-accent hover:bg-accent-hover text-primary font-bold px-6 py-3 rounded-pill shadow transition-colors text-sm">
              <FileText className="w-4 h-4" /> View Full Audit Report
            </button>
          </div>
        </div>

      </div>
    </DashboardLayout>
  );
}
