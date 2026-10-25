'use client';

import { EmployerLayout } from '@/app/components/employer/layout/EmployerLayout';
import { WelcomeHeader } from '@/app/components/employer/dashboard/WelcomeHeader';
import { DashboardStats } from '@/app/components/employer/dashboard/DashboardStats';
import { OpportunitiesTable } from '@/app/components/employer/dashboard/OpportunitiesTable';
import { RecentApplications, UpcomingInterviews } from '@/app/components/employer/dashboard/RecentApplications';
import { CompanySetupCard } from '@/app/components/employer/dashboard/CompanySetupCard';

export default function EmployerDashboardPage() {
  return (
    <EmployerLayout>
      <div style={{ maxWidth: 1200 }}>
        <WelcomeHeader />
        <DashboardStats />
        <div className='mb-6'>
          <OpportunitiesTable />
        </div>
        <div className='grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6'>
          <RecentApplications />
          <UpcomingInterviews />
        </div>
        <CompanySetupCard />
      </div>
    </EmployerLayout>
  );
}
