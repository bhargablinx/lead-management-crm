"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
    ArrowUp,
    ArrowDown,
    ArrowUpDown,
    Eye,
    Filter,
    Loader2,
    ChevronLeft,
    ChevronRight,
    ChevronsLeft,
    ChevronsRight,
} from "lucide-react";
import { STATUS_COLORS, STATUS_LABELS, SortField, SortDir, formatDate, getAssignee } from "./leadsUtils";
import type { Lead } from "@/lib/types";

interface LeadsTableProps {
    leads: Lead[];
    loading: boolean;
    hasActiveFilters: boolean;
    onClearFilters: () => void;
    onSelectLead: (lead: Lead) => void;
    sortField: SortField;
    sortDir: SortDir;
    onSort: (field: SortField) => void;
    // Pagination
    page: number;
    limit: number;
    totalLeads: number;
    totalPages: number;
    onPageChange: (page: number) => void;
}

function SortIcon({ field, sortField, sortDir }: { field: SortField; sortField: SortField; sortDir: SortDir }) {
    if (sortField !== field) return <ArrowUpDown className="h-3.5 w-3.5 ml-1 opacity-40" />;
    return sortDir === "asc"
        ? <ArrowUp className="h-3.5 w-3.5 ml-1 text-primary" />
        : <ArrowDown className="h-3.5 w-3.5 ml-1 text-primary" />;
}

function SortButton({
    label,
    field,
    sortField,
    sortDir,
    onSort,
}: {
    label: string;
    field: SortField;
    sortField: SortField;
    sortDir: SortDir;
    onSort: (f: SortField) => void;
}) {
    return (
        <button
            className="flex items-center text-xs font-semibold uppercase tracking-wide text-muted-foreground hover:text-foreground transition-colors"
            onClick={() => onSort(field)}
        >
            {label}
            <SortIcon field={field} sortField={sortField} sortDir={sortDir} />
        </button>
    );
}

function paginationRange(page: number, totalPages: number): (number | "...")[] {
    const pages: (number | "...")[] = [];
    if (totalPages <= 7) {
        for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else {
        pages.push(1);
        if (page > 3) pages.push("...");
        for (let i = Math.max(2, page - 1); i <= Math.min(totalPages - 1, page + 1); i++) {
            pages.push(i);
        }
        if (page < totalPages - 2) pages.push("...");
        pages.push(totalPages);
    }
    return pages;
}

export default function LeadsTable({
    leads,
    loading,
    hasActiveFilters,
    onClearFilters,
    onSelectLead,
    sortField,
    sortDir,
    onSort,
    page,
    limit,
    totalLeads,
    totalPages,
    onPageChange,
}: LeadsTableProps) {
    return (
        <Card className="border border-border/50 shadow-sm">
            <CardContent className="p-0">
                {loading ? (
                    <div className="flex h-64 items-center justify-center">
                        <div className="flex flex-col items-center gap-3 text-muted-foreground">
                            <Loader2 className="h-6 w-6 animate-spin" />
                            <p className="text-sm">Loading leads…</p>
                        </div>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <Table>
                            <TableHeader>
                                <TableRow className="hover:bg-transparent border-b border-border/50">
                                    <TableHead>
                                        <SortButton label="Lead" field="firstName" sortField={sortField} sortDir={sortDir} onSort={onSort} />
                                    </TableHead>
                                    <TableHead>
                                        <SortButton label="Company" field="company" sortField={sortField} sortDir={sortDir} onSort={onSort} />
                                    </TableHead>
                                    <TableHead>
                                        <SortButton label="Status" field="status" sortField={sortField} sortDir={sortDir} onSort={onSort} />
                                    </TableHead>
                                    <TableHead className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                                        Owner
                                    </TableHead>
                                    <TableHead>
                                        <SortButton label="Created" field="createdAt" sortField={sortField} sortDir={sortDir} onSort={onSort} />
                                    </TableHead>
                                    <TableHead className="text-right text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                                        Action
                                    </TableHead>
                                </TableRow>
                            </TableHeader>

                            <TableBody>
                                {leads.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={6} className="h-40 text-center">
                                            <div className="flex flex-col items-center gap-2 text-muted-foreground">
                                                <Filter className="h-8 w-8 opacity-30" />
                                                <p className="text-sm font-medium">No leads found</p>
                                                {hasActiveFilters && (
                                                    <Button variant="outline" size="sm" onClick={onClearFilters}>
                                                        Clear filters
                                                    </Button>
                                                )}
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    leads.map((lead) => {
                                        const { name: ownerName, initials } = getAssignee(lead);
                                        return (
                                            <TableRow
                                                key={lead._id}
                                                className="group hover:bg-muted/30 transition-colors cursor-pointer"
                                                onClick={() => onSelectLead(lead)}
                                            >
                                                <TableCell>
                                                    <div>
                                                        <p className="font-semibold text-foreground leading-none group-hover:text-primary transition-colors">
                                                            {lead.firstName} {lead.lastName || ""}
                                                        </p>
                                                        <p className="text-xs text-muted-foreground mt-1">{lead.email}</p>
                                                    </div>
                                                </TableCell>
                                                <TableCell className="text-sm">{lead.company || "—"}</TableCell>
                                                <TableCell>
                                                    <span className={`inline-flex items-center rounded-full border px-2 py-0.5 text-xs font-medium ${STATUS_COLORS[lead.status] ?? ""}`}>
                                                        {STATUS_LABELS[lead.status] ?? lead.status}
                                                    </span>
                                                </TableCell>
                                                <TableCell>
                                                    <div className="flex items-center gap-2">
                                                        <Avatar className="h-6 w-6 border">
                                                            <AvatarFallback className="text-[10px] font-semibold">{initials}</AvatarFallback>
                                                        </Avatar>
                                                        <span className="text-sm">{ownerName}</span>
                                                    </div>
                                                </TableCell>
                                                <TableCell className="text-xs text-muted-foreground">
                                                    {formatDate(lead.createdAt)}
                                                </TableCell>
                                                <TableCell className="text-right">
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        className="h-7 w-7 opacity-0 group-hover:opacity-100 transition-opacity text-muted-foreground hover:text-primary"
                                                        onClick={(e) => { e.stopPropagation(); onSelectLead(lead); }}
                                                    >
                                                        <Eye className="h-3.5 w-3.5" />
                                                    </Button>
                                                </TableCell>
                                            </TableRow>
                                        );
                                    })
                                )}
                            </TableBody>
                        </Table>
                    </div>
                )}

                {/* Pagination */}
                {!loading && totalLeads > 0 && (
                    <div className="flex flex-col sm:flex-row items-center justify-between gap-3 px-4 py-3 border-t border-border/50">
                        <p className="text-xs text-muted-foreground">
                            Showing{" "}
                            <span className="font-medium text-foreground">
                                {(page - 1) * limit + 1}–{Math.min(page * limit, totalLeads)}
                            </span>{" "}
                            of <span className="font-medium text-foreground">{totalLeads}</span> leads
                        </p>

                        <div className="flex items-center gap-1">
                            <Button id="leads-page-first" variant="outline" size="icon" className="h-7 w-7"
                                disabled={page === 1} onClick={() => onPageChange(1)}>
                                <ChevronsLeft className="h-3.5 w-3.5" />
                            </Button>
                            <Button id="leads-page-prev" variant="outline" size="icon" className="h-7 w-7"
                                disabled={page === 1} onClick={() => onPageChange(page - 1)}>
                                <ChevronLeft className="h-3.5 w-3.5" />
                            </Button>

                            {paginationRange(page, totalPages).map((p, i) =>
                                p === "..." ? (
                                    <span key={`ellipsis-${i}`} className="px-2 text-muted-foreground text-xs">…</span>
                                ) : (
                                    <Button
                                        key={p}
                                        id={`leads-page-${p}`}
                                        variant={p === page ? "default" : "outline"}
                                        size="icon"
                                        className="h-7 w-7 text-xs"
                                        onClick={() => onPageChange(p as number)}
                                    >
                                        {p}
                                    </Button>
                                )
                            )}

                            <Button id="leads-page-next" variant="outline" size="icon" className="h-7 w-7"
                                disabled={page === totalPages} onClick={() => onPageChange(page + 1)}>
                                <ChevronRight className="h-3.5 w-3.5" />
                            </Button>
                            <Button id="leads-page-last" variant="outline" size="icon" className="h-7 w-7"
                                disabled={page === totalPages} onClick={() => onPageChange(totalPages)}>
                                <ChevronsRight className="h-3.5 w-3.5" />
                            </Button>
                        </div>
                    </div>
                )}
            </CardContent>
        </Card>
    );
}
