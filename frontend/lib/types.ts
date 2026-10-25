export interface Milestone {
  title: string;
  description: string;
  amount: number;
  due_in_days: number;
}

export interface Bid {
  id: number;
  job_id: string;
  job_title: string;
  freelancer_id: string;
  freelancer_name: string;
  amount: number;
  rate_type: string;
  hourly_rate: number;
  cover_letter: string;
  delivery_days: number;
  experience: string;
  portfolio: string[];
  milestones: Milestone[];
  status: string;
  created_at: string;
  updated_at: string;
  withdrawn_at: string | null;
}

export interface Employer {
  user_id: string;
  name: string;
  role: string;
  company_name: string;
  headline: string;
  bio: string;
  country: string;
  total_spent: number;
  total_hired: number;
  avg_rating: number;
  verification_status: string;
  verified_at: string | null;
  member_since: string;
}

export interface Job {
  id: string;
  user_id: string;
  title: string;
  description: string;
  requirements: string;
  skills: string;
  budget: number;
  type: string;
  delivery_days: number;
  status: string;
  proposals_disclosed: boolean;
  proposal_count: number;
  is_saved: boolean;
  created_at: string;
  updated_at: string;
  employer?: Employer | null;
}

export interface SavedJob {
  job_id: string;
  title: string;
  company: string;
  budget: number;
  type: string;
  skills: string;
  status: string;
  saved_at: string;
  created_at: string;
}
