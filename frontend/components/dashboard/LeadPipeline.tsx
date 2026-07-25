import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";

const pipeline = [
    {
        stage: "New",
        count: 42,
        color: "bg-blue-500",
    },
    {
        stage: "Contacted",
        count: 30,
        color: "bg-yellow-500",
    },
    {
        stage: "Qualified",
        count: 22,
        color: "bg-purple-500",
    },
    {
        stage: "Proposal",
        count: 18,
        color: "bg-orange-500",
    },
    {
        stage: "Won",
        count: 12,
        color: "bg-green-500",
    },
    {
        stage: "Lost",
        count: 4,
        color: "bg-red-500",
    },
];

const totalLeads = pipeline.reduce((sum, stage) => sum + stage.count, 0);

export default function LeadPipeline() {
    return (
        <Card>
            <CardHeader>
                <CardTitle>Lead Pipeline</CardTitle>
            </CardHeader>

            <CardContent className="space-y-5">
                {pipeline.map((item) => {
                    const percentage = (item.count / totalLeads) * 100;

                    return (
                        <div key={item.stage} className="space-y-2">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <div className={`h-3 w-3 rounded-full ${item.color}`} />

                                    <span className="font-medium">{item.stage}</span>
                                </div>

                                <Badge variant="secondary">{item.count} Leads</Badge>
                            </div>

                            <Progress value={percentage} />
                        </div>
                    );
                })}

                <div className="border-t pt-4 flex items-center justify-between text-sm text-muted-foreground">
                    <span>Total Leads</span>

                    <span className="font-semibold text-foreground">
                        {totalLeads}
                    </span>
                </div>
            </CardContent>
        </Card>
    );
}