// src/types/user.ts
export type UserProfile = {
  id: string;
  first_name: string | null;
  last_name: string | null;
  role: string | null;
  status: string | null;
  email: string | null;
  is_approved?: boolean; // এই ফিল্ডগুলোও যোগ করা ভালো
  is_verified?: boolean;
}