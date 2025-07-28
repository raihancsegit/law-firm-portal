import { createClient } from '@/lib/supabase/server' // সঠিক পাথ থেকে ইম্পোর্ট করুন

// StatCard কম্পোনেন্টের Props এর জন্য টাইপ ডিফাইন করা
type StatCardProps = {
  title: string;
  value: number | string;
  icon: string;
  color: string;
}

// একটি Helper কম্পোনেন্ট হিসেবে StatCard তৈরি করা
// এখানে Props এর টাইপ ব্যবহার করা হয়েছে
const StatCard = ({ title, value, icon, color }: StatCardProps) => (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex items-center">
            <div className={`flex-shrink-0 w-12 h-12 ${color} rounded-lg flex items-center justify-center`}>
                <i className={`fa-solid ${icon} text-white text-xl`}></i>
            </div>
            <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">{title}</p>
                <p className="text-2xl font-bold text-gray-900">{value}</p>
            </div>
        </div>
    </div>
)

// ActivityItem কম্পোনেন্টের Props এর জন্য টাইপ ডিফাইন করা
type ActivityItemProps = {
  icon: string;
  color: string;
  text: string;
  time: string;
}

// একটি Helper কম্পোনেন্ট হিসেবে ActivityItem তৈরি করা
// এখানে Props এর টাইপ ব্যবহার করা হয়েছে
const ActivityItem = ({ icon, color, text, time }: ActivityItemProps) => (
    <div className="flex items-start space-x-3">
        <div className={`flex-shrink-0 w-8 h-8 ${color} rounded-full flex items-center justify-center`}>
            <i className={`fa-solid ${icon} text-sm`}></i>
        </div>
        <div className="flex-1">
            {/* dangerouslySetInnerHTML ব্যবহার করা এড়ানো ভালো যদি সম্ভব হয়, 
                কিন্তু এখানে HTML স্ট্রিং রেন্ডার করার জন্য এটি প্রয়োজন */}
            <p className="text-sm text-gray-900" dangerouslySetInnerHTML={{ __html: text }}></p>
            <p className="text-xs text-gray-500">{time}</p>
        </div>
    </div>
)

// পেজ কম্পোনেন্টটি এখন একটি async ফাংশন
export default async function DashboardOverviewPage() {
    const supabase = createClient()

    // ডাইনামিক ডেটা আনার জন্য Supabase থেকে কোয়েরি
    // প্রতিটি কোয়েরিকে আলাদাভাবে error handling করা ভালো অভ্যাস
    const { count: totalClients, error: clientsError } = await supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true }) // head: true শুধুমাত্র count আনার জন্য অপ্টিমাইজ করে
        .eq('role', 'client')
    
    const { count: activeLeads, error: leadsError } = await supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true })
        .eq('role', 'lead')

    const { count: pendingApprovals, error: approvalsError } = await supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true })
        .eq('is_approved', false)

    // সার্ভার কনসোলে এরর লগ করা ভালো
    if (clientsError || leadsError || approvalsError) {
        console.error("Error fetching dashboard stats:", { clientsError, leadsError, approvalsError });
    }

    // ডেমো অ্যাক্টিভিটি ডেটা (বাস্তব ক্ষেত্রে এটিও ডাটাবেস থেকে আসবে)
    const recentActivities: ActivityItemProps[] = [
        { icon: 'fa-user-plus', color: 'bg-green-100 text-green-600', text: 'New client registration: <span class="font-medium">Sarah Johnson</span>', time: '2 hours ago' },
        { icon: 'fa-file-upload', color: 'bg-blue-100 text-blue-600', text: 'Document uploaded by <span class="font-medium">Michael Chen</span>', time: '4 hours ago' },
        { icon: 'fa-edit', color: 'bg-orange-100 text-orange-600', text: 'Application form completed: <span class="font-medium">David Rodriguez</span>', time: '6 hours ago' },
    ]

    return (
        <section id="dashboard-section">
            <div id="dashboard-stats" className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                <StatCard title="Total Clients" value={totalClients ?? 0} icon="fa-users" color="bg-law-blue" />
                <StatCard title="Active Leads" value={activeLeads ?? 0} icon="fa-user-plus" color="bg-law-gold" />
                <StatCard title="Pending Approvals" value={pendingApprovals ?? 0} icon="fa-file-pen" color="bg-orange-500" />
                {/* এই কার্ডের ডেটাও পরে ডাইনামিক করা যেতে পারে */}
                <StatCard title="Completed Cases" value={189} icon="fa-check-circle" color="bg-green-500" />
            </div>

            <div id="recent-activity-section" className="bg-white rounded-lg shadow-sm border border-gray-200">
                <div className="px-6 py-4 border-b border-gray-200">
                    <h3 className="text-lg font-semibold text-gray-900">Recent Activity</h3>
                </div>
                <div className="p-6">
                    <div id="activity-feed" className="space-y-6">
                        {recentActivities.map((activity, index) => (
                            <ActivityItem key={index} {...activity} />
                        ))}
                    </div>
                </div>
            </div>
        </section>
    )
}