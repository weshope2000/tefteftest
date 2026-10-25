'use client';

import { EmployerLayout } from '@/app/components/employer/layout/EmployerLayout';

const types = [
  { key: 'freelance', title: 'Freelance project', fields: ['Scope', 'Deliverables', 'Fixed price or hourly rate', 'Milestones'] },
  { key: 'internship', title: 'Internship', fields: ['Duration', 'Learning goals', 'Schedule', 'Compensation if applicable'] },
  { key: 'monthly', title: 'Monthly employment', fields: ['Monthly salary range', 'Work schedule', 'Contract duration'] },
  { key: 'permanent', title: 'Permanent employment', fields: ['Salary range', 'Requirements', 'Benefits', 'Work arrangement'] },
  { key: 'civil', title: 'Civil service', fields: ['Recruiting institution', 'Official requirements', 'Deadline', 'Official reference'] },
];

export default function PostOpportunityPage() {
  return (
    <EmployerLayout>
      <div style={{ maxWidth: 900 }}>
        <h1 className='text-2xl font-semibold text-[#172B22] mb-2'>Post an Opportunity</h1>
        <p className='text-[#52645A] mb-6'>Select opportunity type and fill in details.</p>
        <div className='bg-white rounded-[12px] border border-[#E2E8E4] p-6'>
          <div className='mb-4'>
            <label className='text-sm text-[#172B22] mb-2 block'>Opportunity type</label>
            <div className='grid grid-cols-1 md:grid-cols-2 gap-3'>
              {types.map((t) => (
                <div key={t.key} className='border border-[#E2E8E4] rounded-[8px] p-3 hover:border-[#26734D] cursor-pointer'>
                  <p className='font-medium text-[#172B22]'>{t.title}</p>
                  <p className='text-xs text-[#52645A] mt-1'>{t.fields.join(', ')}</p>
                </div>
              ))}
            </div>
          </div>
          <p className='text-xs text-[#52645A]'>Civil-service opportunities should be clearly identified and should not imply government affiliation unless verified.</p>
        </div>
      </div>
    </EmployerLayout>
  );
}
