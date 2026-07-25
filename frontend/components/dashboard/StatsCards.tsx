import {
    Users,
    UserPlus,
    BadgeCheck,
    Percent,
} from "lucide-react";
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import type { Lead } from "@/lib/types";

interface StatsCardsProps {
    leads: Lead[];
}

export default function StatsCards({ leads }: StatsCardsProps) {
    const totalLeads = leads.length;
    const newLeads = leads.filter((l) => l.status === "new").length;
    const wonLeads = leads.filter((l) => l.status === "won").length;
    
    const conversionRate = totalLeads > 0 
        ? ((wonLeads / totalLeads) * 100).toFixed(1) 
        : "0.0";

    const stats = [
        {
            title: "Total Leads",
            value: totalLeads.toString(),
            description: "Total database records",
            icon: Users,
        },
        {
            title: "New Leads",
            value: newLeads.toString(),
            description: "Awaiting outreach status",
            icon: UserPlus,
        },
        {
            title: "Won Deals",
            value: wonLeads.toString(),
            description: "Closed-won opportunities",
            icon: BadgeCheck,
        },
        {
            title: "Conversion Rate",
            value: `${conversionRate}%`,
            description: "Wins out of total leads",
            icon: Percent,
        },
    ];

    return (
        <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {stats.map((stat) => {
                const Icon = stat.icon;

                return (
                    <Card
                        key={stat.title}
                        className="transition-all duration-200 hover:shadow-md border border-border/50"
                    >
                        <CardHeader className="flex flex-row items-center justify-between pb-2">
                            <CardTitle className="text-sm font-semibold text-muted-foreground">
                                {stat.title}
                            </CardTitle>

                            <div className="rounded-lg bg-primary/10 p-2">
                                <Icon className="h-5 w-5 text-primary" />
                            </div>
                        </CardHeader>

                        <CardContent>
                            <div className="text-3xl font-bold tracking-tight text-foreground">
                                {stat.value}
                            </div>

                            <p className="mt-1 text-xs text-muted-foreground">
                                {stat.description}
                            </p>
                        </CardContent>
                    </Card>
                );
            })}
        </section>
    );
}