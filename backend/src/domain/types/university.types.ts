export type SubscriptionStatus = 'active' | 'inactive' | 'expired';

export interface University {
  id: string;
  name: string;
  email_domain: string;
  subscription_status: SubscriptionStatus | string;
  subscription_start: Date;
  subscription_end: Date;
  created_at: Date;
  updated_at: Date;
}

export interface CreateUniversityDTO {
  name: string;
  email_domain: string;
  subscription_start: string | Date;
  subscription_end: string | Date;
}

export interface UpdateUniversityDTO {
  name?: string;
  email_domain?: string;
}
