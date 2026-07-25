import LeadPipeline from "@/components/dashboard/LeadPipeline";
import LeadSources from "@/components/dashboard/LeadSources";
import RecentActivities from "@/components/dashboard/RecentActivities";
import RecentLeadsTable from "@/components/dashboard/RecentLeadsTable";
import StatsCards from "@/components/dashboard/StatsCards";
import UpcomingFollowups from "@/components/dashboard/UpcomingFollowups";

export default function DashboardPage() {
    return (
        <div className="space-y-6 p-8">
            {/* Page Header */}
            <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">
                        Dashboard
                    </h1>

                    <p className="text-muted-foreground">
                        Welcome back! Here&apos;s an overview of your sales pipeline.
                    </p>
                </div>
            </div>

            {/* KPI Cards */}
            <StatsCards />

            {/* Pipeline + Activities */}
            <div className="grid gap-6 xl:grid-cols-3">
                <div className="xl:col-span-2">
                    <LeadPipeline />
                </div>

                <RecentActivities />
            </div>

            {/* Sources + Follow-ups */}
            <div className="grid gap-6 lg:grid-cols-2">
                <LeadSources />

                <UpcomingFollowups />
            </div>

            {/* Recent Leads */}
            <RecentLeadsTable />
        </div>
    );
}