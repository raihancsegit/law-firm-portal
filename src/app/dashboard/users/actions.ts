'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { PostgrestError } from '@supabase/supabase-js'

// একটি স্ট্যান্ডার্ড রেসপন্স টাইপ তৈরি করা ভালো অভ্যাস
type ActionResult = {
  success: boolean;
  message: string;
}

// ব্যবহারকারী অনুমোদন করার ফাংশন
export async function approveUser(userId: string): Promise<ActionResult> {
  const supabase = createClient()
  
  // Phase 2: ব্যবহারকারীর প্রোফাইল তথ্য আনা (ফোল্ডার তৈরির জন্য)
  const { data: userProfile, error: profileError } = await supabase
    .from('profiles')
    .select('first_name, last_name')
    .eq('id', userId)
    .single()

  if (profileError) {
    console.error('Error fetching user profile for approval:', profileError)
    return { success: false, message: 'Could not find user profile.' }
  }

  const { error: updateError } = await supabase
    .from('profiles')
    .update({ is_approved: true, status: 'active' })
    .eq('id', userId)
  
  if (updateError) {
    console.error('Error approving user:', updateError)
    return { success: false, message: updateError.message }
  }

  // Phase 2: এখানে ফোল্ডার তৈরির লজিক ট্রিগার হবে
  const folderName = `${userProfile.last_name}_${userProfile.first_name}_${userId}`;
  console.log(`User approved. TODO: Create storage folder named: ${folderName}`);
  // await createFoldersForUser(userId, folderName); // এই ফাংশনটি পরে তৈরি করতে হবে

  revalidatePath('/dashboard/users') // এই পেজের ডেটা পুনরায় আনার জন্য Next.js কে বলা
  return { success: true, message: 'User approved successfully.' }
}

// ব্যবহারকারী প্রত্যাখ্যান/ডিলিট করার ফাংশন
export async function rejectUser(userId: string): Promise<ActionResult> {
  // সার্ভার-সাইড অ্যাডমিন ক্লায়েন্ট তৈরি করতে হবে service_role key দিয়ে
  const supabaseAdmin = createClient(); // createClient() should handle this if properly configured
                                       // Alternatively, you can create a dedicated admin client.

  // Supabase Auth থেকে ইউজার ডিলিট করা
  // এটি profiles থেকেও cascade delete করবে (যদি ডাটাবেসে foreign key constraint ঠিকমতো সেট করা থাকে)
  const { error: authError } = await supabaseAdmin.auth.admin.deleteUser(userId)

  if (authError) {
    console.error('Error deleting user from auth:', authError)
    return { success: false, message: authError.message }
  }

  // Phase 2: ফাইল সিস্টেম/স্টোরেজ থেকে ব্যবহারকারীর ফোল্ডার ডিলিট করার লজিক
  console.log(`User deleted. TODO: Delete user's storage folder.`);
  // await deleteUserStorage(userId); // এই ফাংশনটি পরে তৈরি করতে হবে

  revalidatePath('/dashboard/users')
  return { success: true, message: 'User rejected and deleted successfully.' }
}