'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import type { UserProfile } from '@/types/user'
// একটি স্ট্যান্ডার্ড রেসপন্স টাইপ
type ActionResult = {
  success: boolean;
  message: string;
}

// ব্যবহারকারী অনুমোদন করার ফাংশন
export async function approveUser(userId: string): Promise<ActionResult> {
  const supabase = createClient()
  
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

  // Phase 2: ফোল্ডার তৈরির লজিক ট্রিগার হবে
  const folderName = `${userProfile.last_name}_${userProfile.first_name}_${userId}`;
  console.log(`User approved. TODO: Create storage folder named: ${folderName}`);

  revalidatePath('/dashboard/users')
  return { success: true, message: 'User approved successfully.' }
}

// ব্যবহারকারী প্রত্যাখ্যান/ডিলিট করার ফাংশন
export async function rejectUser(userId: string): Promise<ActionResult> {
  const supabaseAdmin = createClient(); 

  const { error: authError } = await supabaseAdmin.auth.admin.deleteUser(userId)

  if (authError) {
    console.error('Error deleting user from auth:', authError)
    return { success: false, message: authError.message }
  }

  // Phase 2: স্টোরেজ থেকে ব্যবহারকারীর ফোল্ডার ডিলিট করার লজিক
  console.log(`User deleted. TODO: Delete user's storage folder.`);

  revalidatePath('/dashboard/users')
  return { success: true, message: 'User rejected and deleted successfully.' }
}

// ====================================================================
// ===== নতুন ফাংশনটি এখানে যোগ করুন এবং export করুন =====
// ====================================================================
export async function updateCaseStatus(userId: string, newStatus: string): Promise<ActionResult> {
  const supabase = createClient()

  // নিরাপত্তার জন্য, শুধুমাত্র নির্দিষ্ট কিছু স্ট্যাটাসই সেট করা যাবে
  const validStatuses = ['not_applied', 'application_in_progress', 'active', 'completed'];
  if (!validStatuses.includes(newStatus)) {
    return { success: false, message: 'Invalid status provided.' };
  }

  const { error } = await supabase
    .from('profiles')
    .update({ status: newStatus })
    .eq('id', userId)

  if (error) {
    console.error('Error updating case status:', error);
    return { success: false, message: error.message };
  }

  // `/dashboard/users` পেজের ডেটা পুনরায় আনার জন্য revalidate করুন
  revalidatePath('/dashboard/users');
  return { success: true, message: 'Case status updated.' };
}


export async function updateUserProfileByAdmin(userId: string, profileData: Partial<UserProfile>) {
    const supabase = createClient();

    // শুধুমাত্র যে ফিল্ডগুলো অ্যাডমিন পরিবর্তন করতে পারে, সেগুলোই নিন
    const { role, status, case_type, phone_number, internal_notes } = profileData;
    const allowedUpdates = { role, status, case_type, phone_number, internal_notes };

    const { error } = await supabase
        .from('profiles')
        .update(allowedUpdates)
        .eq('id', userId);

    if (error) {
        console.error('Error updating profile by admin:', error);
        return { success: false, message: error.message };
    }

    revalidatePath(`/dashboard/users/${userId}`);
    revalidatePath('/dashboard/users');
    return { success: true, message: 'Profile updated successfully.' };
}