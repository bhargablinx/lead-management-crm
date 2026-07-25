import {
    ArrowUpRight,
    MoreHorizontal,
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

type LeadStatus =
    | "New"
    | "Contacted"
    | "Qualified"
    | "Proposal"
    | "Won"
    | "Lost";

interface Lead {
    id: number;
    name: string;
    company: string;
    email: string;
    status: LeadStatus;
    owner: string;
    createdAt: string;
}

const leads: Lead[] = [
    {
        id: 1,
        name: "John Doe",
        company: "Acme Inc.",
        email: "john@acme.com",
        status: "Qualified",
        owner: "Admin",
        createdAt: "5 mins ago",
    },
    {
        id: 2,
        name: "Sarah Smith",
        company: "Google",
        email: "sarah@google.com",
        status: "New",
        owner: "Alice",
        createdAt: "20 mins ago",
    },
    {
        id: 3,
        name: "Mike Johnson",
        company: "Netflix",
        email: "mike@netflix.com",
        status: "Proposal",
        owner: "Bob",
        createdAt: "1 hour ago",
    },
    {
        id: 4,
        name: "Emma Wilson",
        company: "Meta",
        email: "emma@meta.com",
        status: "Won",
        owner: "Admin",
        createdAt: "Yesterday",
    },
    {
        id: 5,
        name: "David Brown",
        company: "Amazon",
        email: "david@amazon.com",
        status: "Contacted",
        owner: "Alice",
        createdAt: "Yesterday",
    },
];

const statusVariant = {
    New: "secondary",
    Contacted: "outline",
    Qualified: "default",
    Proposal: "secondary",
    Won: "default",
    Lost: "destructive",
} as const;

export default function RecentLeadsTable() {
    return (
        <Card>
            <CardHeader className="flex flex-row items-center justify-between">
                <div>
                    <CardTitle>Recent Leads</CardTitle>
                    <CardDescription>
                        Latest leads added to your organization.
                    </CardDescription>
                </div>

                <Button variant="outline" size="sm">
                    View All
                    <ArrowUpRight className="ml-2 h-4 w-4" />
                </Button>
            </CardHeader>

            <CardContent>
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Lead</TableHead>
                            <TableHead>Company</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead>Owner</TableHead>
                            <TableHead>Created</TableHead>
                            <TableHead className="w-[60px]" />
                        </TableRow>
                    </TableHeader>

                    <TableBody>
                        {leads.map((lead) => (
                            <TableRow key={lead.id}>
                                <TableCell>
                                    <div>
                                        <p className="font-medium">{lead.name}</p>
                                        <p className="text-sm text-muted-foreground">
                                            {lead.email}
                                        </p>
                                    </div>
                                </TableCell>

                                <TableCell>{lead.company}</TableCell>

                                <TableCell>
                                    <Badge variant={statusVariant[lead.status]}>
                                        {lead.status}
                                    </Badge>
                                </TableCell>

                                <TableCell>
                                    <div className="flex items-center gap-2">
                                        <Avatar className="h-8 w-8">
                                            <AvatarFallback>
                                                {lead.owner
                                                    .split(" ")
                                                    .map((n) => n[0])
                                                    .join("")}
                                            </AvatarFallback>
                                        </Avatar>

                                        <span>{lead.owner}</span>
                                    </div>
                                </TableCell>

                                <TableCell className="text-muted-foreground">
                                    {lead.createdAt}
                                </TableCell>

                                <TableCell>
                                    <Button variant="ghost" size="icon">
                                        <MoreHorizontal className="h-4 w-4" />
                                    </Button>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </CardContent>
        </Card>
    );
}