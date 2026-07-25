import {
    ArrowUpRight,
    Eye,
} from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
    CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import type { Lead } from "@/lib/types";

interface RecentLeadsTableProps {
    leads: Lead[];
    onSelectLead: (lead: Lead) => void;
}

const statusLabels: Record<string, string> = {
    new: "New",
    contacted: "Contacted",
    qualified: "Qualified",
    proposal_sent: "Proposal Sent",
    negotiation: "Negotiation",
    won: "Won",
    lost: "Lost",
};

const statusVariants: Record<string, "secondary" | "outline" | "default" | "destructive"> = {
    new: "secondary",
    contacted: "outline",
    qualified: "default",
    proposal_sent: "secondary",
    negotiation: "secondary",
    won: "default",
    lost: "destructive",
};

export default function RecentLeadsTable({ leads, onSelectLead }: RecentLeadsTableProps) {
    // Show only the latest 5 leads on the dashboard
    const displayLeads = leads.slice(0, 5);

    const getAssigneeDetails = (lead: Lead) => {
        if (typeof lead.assignedTo === "object" && lead.assignedTo) {
            const name = lead.assignedTo.name;
            const initials = name
                .split(" ")
                .map((n) => n[0])
                .join("")
                .substring(0, 2)
                .toUpperCase();
            return { name, initials };
        }
        return { name: "Unassigned", initials: "U" };
    };

    const formatDate = (dateStr: string) => {
        try {
            const date = new Date(dateStr);
            return date.toLocaleDateString(undefined, { month: "short", day: "numeric", year: "2-digit" });
        } catch {
            return "-";
        }
    };

    return (
        <Card className="border border-border/50 shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between">
                <div>
                    <CardTitle className="text-xl font-bold">Recent Leads</CardTitle>
                    <CardDescription>
                        Latest leads added to your organization.
                    </CardDescription>
                </div>

                <Button variant="outline" size="sm" className="hidden sm:flex items-center gap-1.5">
                    Total Leads: {leads.length}
                    <ArrowUpRight className="h-4 w-4" />
                </Button>
            </CardHeader>

            <CardContent className="p-0 sm:p-6 sm:pt-0">
                <div className="overflow-x-auto">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Lead</TableHead>
                                <TableHead>Company</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead>Owner</TableHead>
                                <TableHead>Created</TableHead>
                                <TableHead className="text-right">Action</TableHead>
                            </TableRow>
                        </TableHeader>

                        <TableBody>
                            {displayLeads.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={6} className="h-28 text-center text-sm text-muted-foreground">
                                        No leads found. Create your first lead to get started.
                                    </TableCell>
                                </TableRow>
                            ) : (
                                displayLeads.map((lead) => {
                                    const { name: ownerName, initials } = getAssigneeDetails(lead);
                                    const leadFullName = `${lead.firstName} ${lead.lastName || ""}`.trim();

                                    return (
                                        <TableRow
                                            key={lead._id}
                                            className="hover:bg-muted/30 transition-colors cursor-pointer group"
                                            onClick={() => onSelectLead(lead)}
                                        >
                                            <TableCell>
                                                <div>
                                                    <p className="font-semibold text-foreground leading-none group-hover:text-primary transition-colors">
                                                        {leadFullName}
                                                    </p>
                                                    <p className="text-xs text-muted-foreground mt-1">
                                                        {lead.email}
                                                    </p>
                                                </div>
                                            </TableCell>

                                            <TableCell className="font-medium">
                                                {lead.company || "—"}
                                            </TableCell>

                                            <TableCell>
                                                <Badge
                                                    variant={statusVariants[lead.status] || "default"}
                                                    className="capitalize"
                                                    style={lead.status === "won" ? { backgroundColor: "#10b981", color: "#fff" } : undefined}
                                                >
                                                    {statusLabels[lead.status] || lead.status}
                                                </Badge>
                                            </TableCell>

                                            <TableCell>
                                                <div className="flex items-center gap-2">
                                                    <Avatar className="h-7 w-7 border">
                                                        <AvatarFallback className="text-[10px] font-bold">
                                                            {initials}
                                                        </AvatarFallback>
                                                    </Avatar>

                                                    <span className="text-sm font-medium">{ownerName}</span>
                                                </div>
                                            </TableCell>

                                            <TableCell className="text-muted-foreground text-xs">
                                                {formatDate(lead.createdAt)}
                                            </TableCell>

                                            <TableCell className="text-right">
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    className="h-8 w-8 text-muted-foreground hover:text-primary group-hover:bg-primary/5"
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        onSelectLead(lead);
                                                    }}
                                                >
                                                    <Eye className="h-4 w-4" />
                                                </Button>
                                            </TableCell>
                                        </TableRow>
                                    );
                                })
                            )}
                        </TableBody>
                    </Table>
                </div>
            </CardContent>
        </Card>
    );
}