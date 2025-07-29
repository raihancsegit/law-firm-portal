export type UserProfile = {
  id: string;
  first_name: string | null;
  last_name: string | null;
  role: string | null;
  status: string | null;
  email: string | null;
  
  // নতুন দুটি প্রপার্টি এখানে যোগ করুন
  case_type: string | null;
  is_newsletter_subscribed: boolean | null;

  // ঐচ্ছিক প্রপার্টিগুলো
  is_approved?: boolean;
  is_verified?: boolean;
  avatar_url?: string;
}