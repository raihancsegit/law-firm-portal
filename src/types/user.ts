// src/types/user.ts
export type UserProfile = {
  id: string;
  first_name: string | null;
  last_name: string | null;
  role: string | null;
  status: string | null;
  email: string | null; // ফরম্যাট করার পর চূড়ান্ত টাইপ
}

// Supabase থেকে সরাসরি আসা ডেটার জন্য টাইপ
export type RawUserProfile = Omit<UserProfile, 'email'> & {
    users: { email: string } | null; // Supabase থেকে users(email) এভাবে আসে
}