import {
    UserPlus,
    UserCheck,
    Send,
    FileText,
    CircleDollarSign,
} from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const activities = [
    {
        id: 1,
        title: "John Doe moved to Qualified",
        description: "Lead status updated by Admin",
        time: "5 mins ago",
        icon: UserCheck,
    },
    {
        id: 2,
        title: "Sarah assigned to Mike",
        description: "Lead owner changed",
        time: "30 mins ago",
        icon: UserPlus,
    },
    {
        id: 3,
        title: "Proposal sent to Acme Inc.",
        description: "Proposal email delivered",
        time: "1 hour ago",
        icon: Send,
    },
    {
        id: 4,
        title: "Contract uploaded",
        description: "New document added",
        time: "3 hours ago",
        icon: FileText,
    },
    {
        id: 5,
        title: "Deal marked as Won",
        description: "Revenue updated",
        time: "Yesterday",
        icon: CircleDollarSign,
    },
];

export default function RecentActivities() {
    return (
        <Card>
            <CardHeader>
                <CardTitle>Recent Activities</CardTitle>
            </CardHeader>

            <CardContent>
                <div className="space-y-6">
                    {activities.map((activity, index) => {
                        const Icon = activity.icon;

                        return (
                            <div key={activity.id} className="relative flex gap-4">
                                {/* Timeline */}
                                {index !== activities.length - 1 && (
                                    <div className="absolute left-5 top-10 h-full w-px bg-border" />
                                )}

                                {/* Icon */}
                                <div className="z-10 flex h-10 w-10 items-center justify-center rounded-full border bg-background">
                                    <Icon className="h-5 w-5 text-primary" />
                                </div>

                                {/* Content */}
                                <div className="flex-1 pb-2">
                                    <div className="flex items-start justify-between gap-4">
                                        <div>
                                            <p className="font-medium leading-none">
                                                {activity.title}
                                            </p>

                                            <p className="mt-1 text-sm text-muted-foreground">
                                                {activity.description}
                                            </p>
                                        </div>

                                        <span className="whitespace-nowrap text-xs text-muted-foreground">
                                            {activity.time}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </CardContent>
        </Card>
    );
}