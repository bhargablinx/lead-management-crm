// Shared constants and utilities for the Leads feature.
import type { LeadStatus, Lead } from "@/lib/types";

export const STATUS_OPTIONS: { value: LeadStatus | ""; label: string }[] = [
    { value: "", label: "All Statuses" },
    { value: "new", label: "New" },
    { value: "contacted", label: "Contacted" },
    { value: "qualified", label: "Qualified" },
    { value: "proposal_sent", label: "Proposal Sent" },
    { value: "negotiation", label: "Negotiation" },
    { value: "won", label: "Won" },
    { value: "lost", label: "Lost" },
];

export const LIMIT_OPTIONS = [10, 25, 50, 100];

export const STATUS_COLORS: Record<string, string> = {
    new: "bg-blue-500/10 text-blue-600 border-blue-500/20",
    contacted: "bg-amber-500/10 text-amber-600 border-amber-500/20",
    qualified: "bg-violet-500/10 text-violet-600 border-violet-500/20",
    proposal_sent: "bg-cyan-500/10 text-cyan-600 border-cyan-500/20",
    negotiation: "bg-orange-500/10 text-orange-600 border-orange-500/20",
    won: "bg-emerald-500/10 text-emerald-600 border-emerald-500/20",
    lost: "bg-red-500/10 text-red-600 border-red-500/20",
};

export const STATUS_LABELS: Record<string, string> = {
    new: "New",
    contacted: "Contacted",
    qualified: "Qualified",
    proposal_sent: "Proposal Sent",
    negotiation: "Negotiation",
    won: "Won",
    lost: "Lost",
};

export type SortField = "firstName" | "email" | "status" | "createdAt" | "company";
export type SortDir = "asc" | "desc";

export function formatDate(dateStr: string) {
    try {
        return new Date(dateStr).toLocaleDateString(undefined, {
            month: "short",
            day: "numeric",
            year: "numeric",
        });
    } catch {
        return "—";
    }
}

export function getAssignee(lead: Lead) {
    if (typeof lead.assignedTo === "object" && lead.assignedTo) {
        const name = lead.assignedTo.name;
        const initials = name.split(" ").map((n) => n[0]).join("").substring(0, 2).toUpperCase();
        return { name, initials };
    }
    return { name: "Unassigned", initials: "—" };
}
