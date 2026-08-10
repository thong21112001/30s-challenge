import { getCurrentUser } from '@/lib/auth';
import { getAdminDashboardDataAction } from '@/actions/admin-actions';
import { Navbar } from '@/components/navbar';
import { OfflineBanner } from '@/components/offline-banner';
import { AdminDashboardClient } from '@/components/admin/admin-client';
import { redirect } from 'next/navigation';

export default async function AdminPage() {
  const user = await getCurrentUser();

  if (!user || user.role !== 'ADMIN') {
    redirect('/');
  }

  const data = await getAdminDashboardDataAction();

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans selection:bg-indigo-500 selection:text-white flex flex-col">
      <OfflineBanner />
      <Navbar user={user} />

      <main className="flex-1 max-w-6xl mx-auto px-4 py-8 sm:py-12 w-full">
        <AdminDashboardClient data={data as any} />
      </main>
    </div>
  );
}
