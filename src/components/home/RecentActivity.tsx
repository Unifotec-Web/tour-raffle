import Link from 'next/link';
export default function RecentActivity() {
  return <div className="bg-white border border-borderBlue rounded-2xl p-6 shadow-card h-full flex flex-col justify-between"><div><h3 className="text-xl font-extrabold text-primary tracking-tight mb-6">Recent Activity</h3><p className="text-mutedBlue text-sm">Participant activity is private. Sign in to see your own entries and payments.</p></div><Link href="/dashboard" className="text-secondary text-xs font-semibold hover:underline mt-6">My Dashboard →</Link></div>;
}
