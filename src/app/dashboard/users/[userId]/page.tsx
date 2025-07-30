import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import UserProfileClientPage from './UserProfileClientPage'
import type { UserProfile } from '@/types/user' // টাইপ ইম্পোর্ট করুন

type Props = {
  params: { userId: string }
}

export default async function UserProfilePage({ params }: Props) {
  const supabase = createClient()
  const { userId } = params

  // সরাসরি টেবিল কোয়েরির পরিবর্তে, আমাদের তৈরি করা RPC ফাংশনটি কল করুন
  const { data: profile, error: rpcError } = await supabase
    .rpc('get_user_profile', { user_id_input: userId })
    .single() // যেহেতু ফাংশনটি একটি মাত্র সারি রিটার্ন করবে

  if (rpcError || !profile) {
    console.error(`Error fetching user profile via RPC for ID: ${userId}`, rpcError);
    return notFound(); // যদি ব্যবহারকারী খুঁজে না পাওয়া যায় বা অ্যাডমিনের অনুমতি না থাকে
  }
  
  // rpc থেকে আসা ডেটা UserProfile টাইপের সাথে সামঞ্জস্যপূর্ণ
  const userProfile: UserProfile = profile;

  // ক্লায়েন্ট কম্পোনেন্টে ডেটা পাস করুন
  return <UserProfileClientPage initialProfile={userProfile} />
}