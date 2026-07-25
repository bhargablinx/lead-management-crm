import {
    UserPlus,
    UserCheck,
    FileText,
    Trash2,
    Settings,
    Edit3,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { Activity } from "@/lib/types";

interface RecentActivitiesProps {
    activities: Activity[];
}

const iconMap = {
    lead_created: UserPlus,
    lead_updated: Edit3,
    status_changed: UserCheck,
    lead_assigned: UserCheck,
    note_added: FileText,
    note_updated: Edit3,
    note_deleted: Trash2,
    lead_deleted: Trash2,
};

export default function RecentActivities({ activities }: RecentActivitiesProps) {
    // Show only the latest 5 activities on the dashboard
    const displayActivities = activities.slice(0, 5);

    const formatTime = (dateStr: string) => {
        try {
            const date = new Date(dateStr);
            return date.toLocaleDateString(undefined, {
                month: "short",
                day: "numeric",
                hour: "2-digit",
                minute: "2-digit",
            });
        } catch {
            return "Some time ago";
        }
    };

    return (
        <Card className="border border-border/50 shadow-sm">
            <CardHeader>
                <CardTitle className="text-xl font-bold">Recent Activities</CardTitle>
            </CardHeader>

            <CardContent>
                {displayActivities.length === 0 ? (
                    <p className="text-sm text-muted-foreground text-center py-8">
                        No recent activities recorded.
                    </p>
                ) : (
                    <div className="space-y-6">
                        {displayActivities.map((activity, index) => {
                            // Match icon based on type, fall back to Settings
                            const IconComponent = iconMap[activity.type] || Settings;

                            // Extract author name
                            const authorName = typeof activity.userId === "object" && activity.userId
                                ? activity.userId.name
                                : "A user";

                            return (
                                <div key={activity._id} className="relative flex gap-4">
                                    {/* Timeline line */}
                                    {index !== displayActivities.length - 1 && (
                                        <div className="absolute left-5 top-10 h-full w-px bg-border/60" />
                                    )}

                                    {/* Icon badge */}
                                    <div className="z-10 flex h-10 w-10 items-center justify-center rounded-full border bg-background shadow-sm">
                                        <IconComponent className="h-4 w-4 text-primary" />
                                    </div>

                                    {/* Content details */}
                                    <div className="flex-1 pb-2">
                                        <div className="flex items-start justify-between gap-4">
                                            <div className="space-y-0.5">
                                                <p className="text-sm font-semibold text-foreground leading-tight">
                                                    {activity.description}
                                                </p>
                                                <p className="text-xs text-muted-foreground">
                                                    by {authorName}
                                                </p>
                                            </div>

                                            <span className="whitespace-nowrap text-[10px] font-semibold text-muted-foreground bg-muted/40 px-2 py-0.5 rounded-full">
                                                {formatTime(activity.createdAt)}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </CardContent>
        </Card>
    );
}