import {
    Users,
    UserPlus,
    BadgeCheck,
    DollarSign,
    TrendingUp,
} from "lucide-react";
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";

const stats = [
    {
        title: "Total Leads",
        value: "128",
        change: "+12 today",
        icon: Users,
    },
    {
        title: "New Leads",
        value: "19",
        change: "This week",
        icon: UserPlus,
    },
    {
        title: "Converted",
        value: "32",
        change: "25% conversion",
        icon: BadgeCheck,
    },
    {
        title: "Revenue",
        value: "$42,580",
        change: "+8.2%",
        icon: DollarSign,
    },
];

export default function StatsCards() {
    return (
        <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {stats.map((stat) => {
                const Icon = stat.icon;

                return (
                    <Card
                        key={stat.title}
                        className="transition-all duration-200 hover:shadow-md"
                    >
                        <CardHeader className="flex flex-row items-center justify-between pb-2">
                            <CardTitle className="text-sm font-medium text-muted-foreground">
                                {stat.title}
                            </CardTitle>

                            <div className="rounded-lg bg-primary/10 p-2">
                                <Icon className="h-5 w-5 text-primary" />
                            </div>
                        </CardHeader>

                        <CardContent>
                            <div className="text-3xl font-bold tracking-tight">
                                {stat.value}
                            </div>

                            <div className="mt-2 flex items-center gap-1 text-sm text-muted-foreground">
                                <TrendingUp className="h-4 w-4 text-green-500" />
                                <span>{stat.change}</span>
                            </div>
                        </CardContent>
                    </Card>
                );
            })}
        </section>
    );
}