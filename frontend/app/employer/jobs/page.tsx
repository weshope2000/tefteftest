'use client';

import { EmployerLayout } from '@/app/components/employer/layout/EmployerLayout';

export default function EmployerJobsPage() {
  return (
    <EmployerLayout>
      <div>
        <div className='flex items-center justify-between mb-6'>
          <h1 className='text-2xl font-semibold text-[#172B22]'>My Opportunities</h1>
          <a href='/employer/jobs/new' className='px-4 py-2 bg-[#26734D] text-white rounded-[8px]'>Post Opportunity</a>
        </div>
        <div className='bg-white rounded-[12px] border border-[#E2E8E4] p-6'>
          <p className='text-[#52645A]'>No opportunities yet.</p>
        </div>
      </div>
    </EmployerLayout>
  );
}
