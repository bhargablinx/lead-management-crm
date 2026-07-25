import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import type { Lead } from "@/lib/types";

interface LeadSourcesProps {
    leads: Lead[];
}

export default function LeadSources({ leads }: LeadSourcesProps) {
    const totalLeads = leads.length;

    // Count leads per source dynamically
    const sourceCounts: Record<string, number> = {};
    leads.forEach((lead) => {
        const src = lead.source?.trim() || "Not Specified";
        sourceCounts[src] = (sourceCounts[src] || 0) + 1;
    });

    // Format and sort sources by lead count descending
    const sourcesData = Object.entries(sourceCounts)
        .map(([name, count]) => ({
            name,
            leadsCount: count,
        }))
        .sort((a, b) => b.leadsCount - a.leadsCount);

    return (
        <Card className="border border-border/50 shadow-sm">
            <CardHeader>
                <CardTitle className="text-xl font-bold">Lead Sources</CardTitle>
            </CardHeader>

            <CardContent className="space-y-5">
                {totalLeads === 0 ? (
                    <p className="text-sm text-muted-foreground text-center py-6">
                        No lead sources recorded yet.
                    </p>
                ) : (
                    sourcesData.map((source) => {
                        const percentage = totalLeads > 0 ? (source.leadsCount / totalLeads) * 100 : 0;

                        return (
                            <div key={source.name} className="space-y-2">
                                <div className="flex items-center justify-between text-sm">
                                    <span className="font-medium">{source.name}</span>

                                    <div className="flex items-center gap-3 text-muted-foreground text-xs">
                                        <span>{source.leadsCount} {source.leadsCount === 1 ? "Lead" : "Leads"}</span>
                                        <span className="font-semibold text-foreground">{percentage.toFixed(0)}%</span>
                                    </div>
                                </div>

                                <Progress value={percentage} className="h-2" />
                            </div>
                        );
                    })
                )}

                <div className="flex items-center justify-between border-t pt-4 text-sm">
                    <span className="text-muted-foreground">Total Leads Analyzed</span>
                    <span className="font-bold text-foreground text-base">
                        {totalLeads}
                    </span>
                </div>
            </CardContent>
        </Card>
    );
}