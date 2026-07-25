import {
    CalendarDays,
    Clock,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

type Priority = "High" | "Medium" | "Low";

interface FollowUp {
    id: number;
    name: string;
    company: string;
    due: string;
    priority: Priority;
}

const followUps: FollowUp[] = [
    {
        id: 1,
        name: "John Doe",
        company: "Acme Inc.",
        due: "Today • 2:00 PM",
        priority: "High",
    },
    {
        id: 2,
        name: "Sarah Smith",
        company: "Google",
        due: "Tomorrow • 10:30 AM",
        priority: "Medium",
    },
    {
        id: 3,
        name: "Emma Johnson",
        company: "Meta",
        due: "Tomorrow • 4:00 PM",
        priority: "Low",
    },
    {
        id: 4,
        name: "David Wilson",
        company: "Netflix",
        due: "Friday • 11:00 AM",
        priority: "High",
    },
];

const priorityVariant = {
    High: "destructive",
    Medium: "secondary",
    Low: "outline",
} as const;

export default function UpcomingFollowups() {
    return (
        <Card>
            <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>Upcoming Follow-ups</CardTitle>

                <CalendarDays className="h-5 w-5 text-muted-foreground" />
            </CardHeader>

            <CardContent className="space-y-4">
                {followUps.map((followUp) => (
                    <div
                        key={followUp.id}
                        className="flex items-start justify-between rounded-lg border p-4 transition-colors hover:bg-muted/40"
                    >
                        <div className="space-y-1">
                            <h4 className="font-medium leading-none">
                                {followUp.name}
                            </h4>

                            <p className="text-sm text-muted-foreground">
                                {followUp.company}
                            </p>

                            <div className="flex items-center gap-2 pt-1 text-xs text-muted-foreground">
                                <Clock className="h-3.5 w-3.5" />
                                <span>{followUp.due}</span>
                            </div>
                        </div>

                        <Badge variant={priorityVariant[followUp.priority]}>
                            {followUp.priority}
                        </Badge>
                    </div>
                ))}
            </CardContent>
        </Card>
    );
}