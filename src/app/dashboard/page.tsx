import { createClient } from '@/lib/supabaseServer'

// একটি Helper কম্পোনেন্ট হিসেবে StatCard তৈরি করা যেতে পারে
const StatCard = ({ title, value, icon, color }) => (
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

// একটি Helper কম্পোনেন্ট হিসেবে ActivityItem তৈরি করা যেতে পারে
const ActivityItem = ({ icon, color, text, time }) => (
    <div className="flex items-start space-x-3">
        <div className={`flex-shrink-0 w-8 h-8 ${color} rounded-full flex items-center justify-center`}>
            <i className={`fa-solid ${icon} text-sm`}></i>
        </div>
        <div className="flex-1">
            <p className="text-sm text-gray-900" dangerouslySetInnerHTML={{ __html: text }}></p>
            <p className="text-xs text-gray-500">{time}</p>
        </div>
    </div>
)

export default async function DashboardOverviewPage() {
    const supabase = createClient()

    // ডাইনামিক ডেটা আনার জন্য উদাহরণ (এগুলো পরে বাস্তব ডেটা দিয়ে প্রতিস্থাপন করতে হবে)
    const { count: totalClients } = await supabase.from('profiles').select('*', { count: 'exact' }).eq('role', 'client')
    const { count: activeLeads } = await supabase.from('profiles').select('*', { count: 'exact' }).eq('role', 'lead')
    const { count: pendingApprovals } = await supabase.from('profiles').select('*', { count: 'exact' }).eq('is_approved', false)

    // ডেমো অ্যাক্টিভিটি ডেটা
    const recentActivities = [
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