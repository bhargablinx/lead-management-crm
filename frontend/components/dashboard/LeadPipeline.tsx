import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import type { Lead, LeadStatus } from "@/lib/types";

interface LeadPipelineProps {
    leads: Lead[];
}

interface PipelineStage {
    stage: string;
    statusValue: LeadStatus;
    color: string;
}

const STAGES: PipelineStage[] = [
    { stage: "New", statusValue: "new", color: "bg-blue-500" },
    { stage: "Contacted", statusValue: "contacted", color: "bg-yellow-500" },
    { stage: "Qualified", statusValue: "qualified", color: "bg-purple-500" },
    { stage: "Proposal Sent", statusValue: "proposal_sent", color: "bg-orange-500" },
    { stage: "Negotiation", statusValue: "negotiation", color: "bg-indigo-500" },
    { stage: "Won", statusValue: "won", color: "bg-green-500" },
    { stage: "Lost", statusValue: "lost", color: "bg-red-500" },
];

export default function LeadPipeline({ leads }: LeadPipelineProps) {
    const totalLeads = leads.length;

    return (
        <Card className="border border-border/50 shadow-sm">
            <CardHeader>
                <CardTitle className="text-xl font-bold">Lead Pipeline</CardTitle>
            </CardHeader>

            <CardContent className="space-y-5">
                {STAGES.map((item) => {
                    const count = leads.filter((l) => l.status === item.statusValue).length;
                    const percentage = totalLeads > 0 ? (count / totalLeads) * 100 : 0;

                    return (
                        <div key={item.stage} className="space-y-2">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <div className={`h-3 w-3 rounded-full ${item.color}`} />
                                    <span className="font-medium text-sm">{item.stage}</span>
                                </div>

                                <Badge variant="secondary" className="font-semibold">
                                    {count} {count === 1 ? "Lead" : "Leads"}
                                </Badge>
                            </div>

                            <Progress value={percentage} className="h-2" />
                        </div>
                    );
                })}

                <div className="border-t pt-4 flex items-center justify-between text-sm text-muted-foreground">
                    <span>Total Active Leads</span>
                    <span className="font-bold text-foreground text-base">
                        {totalLeads}
                    </span>
                </div>
            </CardContent>
        </Card>
    );
}