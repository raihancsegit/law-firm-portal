export type UserProfile = {
  id: string;
  first_name: string | null;
  last_name: string | null;
  role: string | null;
  status: string | null;
  email: string | null;
  is_approved?: boolean;
  is_verified?: boolean;
  avatar_url?: string; // Optional avatar URL
}