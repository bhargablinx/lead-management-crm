import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";

const sources = [
    {
        name: "Website",
        leads: 48,
    },
    {
        name: "Facebook Ads",
        leads: 30,
    },
    {
        name: "Google Ads",
        leads: 22,
    },
    {
        name: "Referral",
        leads: 18,
    },
    {
        name: "Manual",
        leads: 10,
    },
];

const totalLeads = sources.reduce((sum, source) => sum + source.leads, 0);

export default function LeadSources() {
    return (
        <Card>
            <CardHeader>
                <CardTitle>Lead Sources</CardTitle>
            </CardHeader>

            <CardContent className="space-y-5">
                {sources.map((source) => {
                    const percentage = (source.leads / totalLeads) * 100;

                    return (
                        <div key={source.name} className="space-y-2">
                            <div className="flex items-center justify-between text-sm">
                                <span className="font-medium">{source.name}</span>

                                <div className="flex items-center gap-3 text-muted-foreground">
                                    <span>{source.leads} Leads</span>
                                    <span>{percentage.toFixed(0)}%</span>
                                </div>
                            </div>

                            <Progress value={percentage} />
                        </div>
                    );
                })}

                <div className="flex items-center justify-between border-t pt-4 text-sm">
                    <span className="text-muted-foreground">
                        Total Leads
                    </span>

                    <span className="font-semibold">
                        {totalLeads}
                    </span>
                </div>
            </CardContent>
        </Card>
    );
}   