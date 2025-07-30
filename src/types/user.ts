export type UserProfile = {
  id: string;
  first_name: string | null;
  last_name: string | null;
  phone_number: string | null;
  email: string | null;
  role: string | null;
  status: string | null;
  case_type: string | null;
  is_newsletter_subscribed: boolean | null;
  is_approved: boolean | null;
  is_verified: boolean | null;
  avatar_url: string | null;
  internal_notes: string | null;
}