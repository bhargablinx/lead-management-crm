"use client";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Search, SlidersHorizontal, X } from "lucide-react";
import { STATUS_OPTIONS, LIMIT_OPTIONS, SortField, SortDir } from "./leadsUtils";
import type { LeadStatus } from "@/lib/types";
import type { User } from "@/lib/types";

interface LeadsFilterBarProps {
    search: string;
    onSearchChange: (val: string) => void;
    statusFilter: LeadStatus | "";
    onStatusChange: (val: LeadStatus | "") => void;
    assignedFilter: string;
    onAssignedChange: (val: string) => void;
    limit: number;
    onLimitChange: (val: number) => void;
    sortField: SortField;
    sortDir: SortDir;
    onSortChange: (field: string, dir: SortDir) => void;
    showFilters: boolean;
    onToggleFilters: () => void;
    hasActiveFilters: boolean;
    activeFilterCount: number;
    onClearFilters: () => void;
    isAdmin: boolean;
    users: User[];
}

export default function LeadsFilterBar({
    search,
    onSearchChange,
    statusFilter,
    onStatusChange,
    assignedFilter,
    onAssignedChange,
    limit,
    onLimitChange,
    sortField,
    sortDir,
    onSortChange,
    showFilters,
    onToggleFilters,
    hasActiveFilters,
    activeFilterCount,
    onClearFilters,
    isAdmin,
    users,
}: LeadsFilterBarProps) {
    const sortValue = `${sortDir === "desc" ? "-" : ""}${sortField}`;

    const handleSortSelect = (v: string) => {
        const isDesc = v.startsWith("-");
        const field = (isDesc ? v.slice(1) : v) as SortField;
        onSortChange(field, isDesc ? "desc" : "asc");
    };

    return (
        <Card className="border border-border/50 shadow-sm">
            <CardContent className="p-4 space-y-3">
                <div className="flex flex-col sm:flex-row gap-3">
                    {/* Search */}
                    <div className="relative flex-1">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
                        <Input
                            id="leads-search"
                            placeholder="Search by name, email, company…"
                            value={search}
                            onChange={(e) => onSearchChange(e.target.value)}
                            className="pl-9"
                        />
                    </div>

                    {/* Status filter */}
                    <select
                        id="leads-status-filter"
                        value={statusFilter}
                        onChange={(e) => onStatusChange(e.target.value as LeadStatus | "")}
                        className="h-9 rounded-md border border-input bg-background px-3 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-ring min-w-[155px]"
                    >
                        {STATUS_OPTIONS.map((opt) => (
                            <option key={opt.value} value={opt.value}>{opt.label}</option>
                        ))}
                    </select>

                    {/* Advanced filters toggle */}
                    <Button
                        variant="outline"
                        size="sm"
                        className="h-9 gap-1.5 shrink-0"
                        onClick={onToggleFilters}
                    >
                        <SlidersHorizontal className="h-4 w-4" />
                        <span>Filters</span>
                        {hasActiveFilters && (
                            <span className="ml-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-primary text-[10px] text-primary-foreground font-bold">
                                {activeFilterCount}
                            </span>
                        )}
                    </Button>

                    {hasActiveFilters && (
                        <Button
                            variant="ghost"
                            size="sm"
                            className="h-9 gap-1.5 text-muted-foreground"
                            onClick={onClearFilters}
                        >
                            <X className="h-3.5 w-3.5" /> Clear
                        </Button>
                    )}
                </div>

                {/* Advanced filters panel */}
                {showFilters && (
                    <div className="flex flex-wrap gap-4 pt-2 border-t border-border/50">
                        {isAdmin && (
                            <div className="space-y-1">
                                <Label className="text-xs text-muted-foreground">Assigned To</Label>
                                <select
                                    id="leads-assignee-filter"
                                    value={assignedFilter}
                                    onChange={(e) => onAssignedChange(e.target.value)}
                                    className="h-8 rounded-md border border-input bg-background px-2.5 py-0.5 text-sm focus:outline-none focus:ring-2 focus:ring-ring min-w-[160px]"
                                >
                                    <option value="">All Members</option>
                                    {users.map((u) => (
                                        <option key={u._id} value={u._id}>{u.name}</option>
                                    ))}
                                </select>
                            </div>
                        )}
                        <div className="space-y-1">
                            <Label className="text-xs text-muted-foreground">Rows per page</Label>
                            <select
                                id="leads-limit-select"
                                value={limit}
                                onChange={(e) => onLimitChange(Number(e.target.value))}
                                className="h-8 rounded-md border border-input bg-background px-2.5 py-0.5 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                            >
                                {LIMIT_OPTIONS.map((n) => (
                                    <option key={n} value={n}>{n} per page</option>
                                ))}
                            </select>
                        </div>
                        <div className="space-y-1">
                            <Label className="text-xs text-muted-foreground">Sort By</Label>
                            <select
                                id="leads-sort-select"
                                value={sortValue}
                                onChange={(e) => handleSortSelect(e.target.value)}
                                className="h-8 rounded-md border border-input bg-background px-2.5 py-0.5 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                            >
                                <option value="-createdAt">Newest First</option>
                                <option value="createdAt">Oldest First</option>
                                <option value="firstName">Name A–Z</option>
                                <option value="-firstName">Name Z–A</option>
                                <option value="status">Status A–Z</option>
                                <option value="company">Company A–Z</option>
                            </select>
                        </div>
                    </div>
                )}
            </CardContent>
        </Card>
    );
}
