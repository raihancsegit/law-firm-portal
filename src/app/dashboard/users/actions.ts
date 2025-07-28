'use server'
import { createClient } from '@/lib/supabaseServer'
import { revalidatePath } from 'next/cache'

// ব্যবহারকারী অনুমোদন করার ফাংশন
export async function approveUser(userId: string) {
  const supabase = createClient()
  
  const { error } = await supabase
    .from('profiles')
    .update({ is_approved: true, status: 'active' }) // স্ট্যাটাসও আপডেট করা যেতে পারে
    .eq('id', userId)
  
  if (error) {
    return { success: false, message: error.message }
  }

  // Phase 2: এখানে ফোল্ডার তৈরির লজিক ট্রিগার হবে
  // যেমন: await createFoldersForUser(userId);

  revalidatePath('/dashboard/users') // এই পেজের ডেটা পুনরায় আনার জন্য Next.js কে বলা
  return { success: true, message: 'User approved successfully.' }
}

// ব্যবহারকারী প্রত্যাখ্যান/ডিলিট করার ফাংশন
export async function rejectUser(userId: string) {
  const supabase = createClient()

  // Supabase Auth থেকে ইউজার ডিলিট করা (এটি profiles থেকেও cascade delete করবে)
  const { error: authError } = await supabase.auth.admin.deleteUser(userId)

  if (authError) {
    return { success: false, message: authError.message }
  }

  // Phase 2: ফাইল সিস্টেম/স্টোরেজ থেকে ব্যবহারকারীর ফোল্ডার ডিলিট করার লজিক
  // যেমন: await deleteUserStorage(userId);

  revalidatePath('/dashboard/users')
  return { success: true, message: 'User rejected and deleted successfully.' }
}