"use client";

import { useEffect, useState, useCallback } from "react";
import { useForm } from "react-hook-form";
import { useAppDispatch, useAppSelector } from "@/lib/store/store";
import { fetchLeads, addNewLead, editLead, removeLead } from "@/lib/store/leadsSlice";
import { fetchUsers } from "@/lib/store/usersSlice";
import { getActivities } from "@/lib/api/activities";
import { getLeadNotes, createLeadNote } from "@/lib/api/leads";
import { getOrganization } from "@/lib/api/organizations";
import StatsCards from "@/components/dashboard/StatsCards";
import LeadPipeline from "@/components/dashboard/LeadPipeline";
import RecentActivities from "@/components/dashboard/RecentActivities";
import LeadSources from "@/components/dashboard/LeadSources";
import UpcomingFollowups from "@/components/dashboard/UpcomingFollowups";
import RecentLeadsTable from "@/components/dashboard/RecentLeadsTable";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
    Plus,
    X,
    Trash2,
    Save,
    MessageSquare,
    Loader2,
    Calendar,
    Mail,
    Phone,
    Briefcase,
    Share2,
    Copy,
    Check,
    ExternalLink,
} from "lucide-react";
import type { Lead, Activity, Note, CreateLeadPayload, UpdateLeadPayload, Organization } from "@/lib/types";

export default function DashboardPage() {
    const dispatch = useAppDispatch();
    const currentUser = useAppSelector((state) => state.auth.user);
    const { leads, loading: leadsLoading } = useAppSelector((state) => state.leads);
    const { users } = useAppSelector((state) => state.users);

    const [activities, setActivities] = useState<Activity[]>([]);
    const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
    const [leadNotes, setLeadNotes] = useState<Note[]>([]);
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [newNoteContent, setNewNoteContent] = useState("");
    const [isSaving, setIsSaving] = useState(false);
    const [notesLoading, setNotesLoading] = useState(false);
    const [organization, setOrganization] = useState<Organization | null>(null);
    const [copied, setCopied] = useState(false);

    const copyFormLink = () => {
        if (!organization) return;
        const link = `${window.location.origin}/public/${organization.slug}`;
        navigator.clipboard.writeText(link);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    // Load organization details
    useEffect(() => {
        getOrganization()
            .then((res) => {
                if (res.success) setOrganization(res.data);
            })
            .catch(() => { });
    }, []);

    const {
        register: registerCreate,
        handleSubmit: handleCreateSubmit,
        reset: resetCreate,
        formState: { errors: createErrors },
    } = useForm<CreateLeadPayload>();

    const {
        register: registerEdit,
        handleSubmit: handleEditSubmit,
        reset: resetEdit,
    } = useForm<UpdateLeadPayload>();

    const loadDashboardData = useCallback(() => {
        dispatch(fetchLeads());
        if (currentUser?.role === "admin") {
            dispatch(fetchUsers());
        }
        getActivities()
            .then((res) => {
                if (res.success) setActivities(res.data);
            })
            .catch(() => { });
    }, [dispatch, currentUser]);

    // Load initial data
    useEffect(() => {
        loadDashboardData();
    }, [loadDashboardData]);

    // Populate edit form on lead selection
    useEffect(() => {
        if (selectedLead) {
            resetEdit({
                firstName: selectedLead.firstName,
                lastName: selectedLead.lastName || "",
                email: selectedLead.email,
                phone: selectedLead.phone || "",
                company: selectedLead.company || "",
                source: selectedLead.source || "",
                status: selectedLead.status,
                assignedTo: typeof selectedLead.assignedTo === "object" && selectedLead.assignedTo
                    ? selectedLead.assignedTo._id
                    : selectedLead.assignedTo || "",
                notes: selectedLead.notes || "",
            });
            // Fetch notes for selected lead
            // eslint-disable-next-line react-hooks/set-state-in-effect
            setNotesLoading(true);
            getLeadNotes(selectedLead._id)
                .then((res) => {
                    if (res.success) setLeadNotes(res.data);
                })
                .catch(() => { })
                .finally(() => setNotesLoading(false));
        }
    }, [selectedLead, resetEdit]);

    const handleCreateLead = async (data: CreateLeadPayload) => {
        setIsSaving(true);
        // Members automatically assign leads to themselves
        const payload = currentUser?.role === "member"
            ? { ...data, assignedTo: currentUser._id }
            : data;

        const result = await dispatch(addNewLead(payload));
        setIsSaving(false);
        if (addNewLead.fulfilled.match(result)) {
            setIsCreateModalOpen(false);
            resetCreate();
            loadDashboardData();
        }
    };

    const handleUpdateLead = async (data: UpdateLeadPayload) => {
        if (!selectedLead) return;
        setIsSaving(true);

        // Members can only update lead status
        const payload = currentUser?.role === "member"
            ? { status: data.status }
            : data;

        const result = await dispatch(editLead({ id: selectedLead._id, payload }));
        setIsSaving(false);
        if (editLead.fulfilled.match(result)) {
            setSelectedLead(null);
            loadDashboardData();
        }
    };

    const handleDeleteLead = async (id: string) => {
        if (window.confirm("Are you sure you want to delete this lead?")) {
            const result = await dispatch(removeLead(id));
            if (removeLead.fulfilled.match(result)) {
                setSelectedLead(null);
                loadDashboardData();
            }
        }
    };

    const handleAddNote = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedLead || !newNoteContent.trim()) return;

        setNotesLoading(true);
        try {
            const res = await createLeadNote(selectedLead._id, { content: newNoteContent });
            if (res.success) {
                setLeadNotes((prev) => [res.data, ...prev]);
                setNewNoteContent("");
                loadDashboardData(); // Refresh activities log
            }
        } catch { }
        setNotesLoading(false);
    };

    const isAdmin = currentUser?.role === "admin";

    return (
        <div className="space-y-6">
            {/* Page Header */}
            <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-foreground">Dashboard</h1>
                    <p className="text-muted-foreground">
                        Welcome back, {currentUser?.name}! Here is an overview of your sales pipeline.
                    </p>
                </div>
                <Button onClick={() => setIsCreateModalOpen(true)} className="flex items-center gap-2">
                    <Plus className="h-4 w-4" /> Create Lead
                </Button>
            </div>

            {/* Public Link Card */}
            {organization && (
                <Card className="border-primary/20 bg-primary/5 shadow-sm">
                    <CardContent className="flex flex-col sm:flex-row items-center justify-between p-4 gap-4">
                        <div className="flex items-center gap-3">
                            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                                <Share2 className="h-5 w-5" />
                            </div>
                            <div className="space-y-0.5 text-left">
                                <h3 className="font-semibold text-foreground text-sm">Public Lead Capture Link</h3>
                                <p className="text-xs text-muted-foreground">
                                    Share this link with prospects to automatically capture leads into your CRM.
                                </p>
                            </div>
                        </div>
                        <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
                            <code className="text-xs px-2.5 py-1.5 bg-background border rounded-md font-mono select-all truncate max-w-[200px] sm:max-w-xs md:max-w-md">
                                {`${typeof window !== "undefined" ? window.location.origin : ""}/public/${organization.slug}`}
                            </code>
                            <Button
                                size="sm"
                                variant="outline"
                                className="h-8 gap-1.5 shrink-0"
                                onClick={copyFormLink}
                            >
                                {copied ? (
                                    <>
                                        <Check className="h-3.5 w-3.5 text-emerald-500" />
                                        <span>Copied!</span>
                                    </>
                                ) : (
                                    <>
                                        <Copy className="h-3.5 w-3.5" />
                                        <span>Copy Link</span>
                                    </>
                                )}
                            </Button>
                            <Button
                                size="sm"
                                variant="ghost"
                                className="h-8 gap-1.5 shrink-0"
                                onClick={() => window.open(`/public/${organization.slug}`, "_blank", "noopener,noreferrer")}
                            >
                                <ExternalLink className="h-3.5 w-3.5" />
                                <span className="hidden sm:inline">Open</span>
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            )}

            {/* KPI Cards */}
            <StatsCards leads={leads} />

            {/* Pipeline + Activities Grid */}
            <div className="grid gap-6 xl:grid-cols-3">
                <div className="xl:col-span-2">
                    <LeadPipeline leads={leads} />
                </div>
                <RecentActivities activities={activities} />
            </div>

            {/* Sources + Follow-ups Grid */}
            <div className="grid gap-6 lg:grid-cols-2">
                <LeadSources leads={leads} />
                <UpcomingFollowups />
            </div>

            {/* Recent Leads Table */}
            {leadsLoading && leads.length === 0 ? (
                <Card className="flex h-48 items-center justify-center">
                    <div className="text-center space-y-2">
                        <Loader2 className="mx-auto h-6 w-6 animate-spin text-muted-foreground" />
                        <p className="text-sm text-muted-foreground">Fetching organization leads...</p>
                    </div>
                </Card>
            ) : (
                <RecentLeadsTable leads={leads} onSelectLead={setSelectedLead} />
            )}

            {/* Create Lead Modal */}
            {isCreateModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm animate-in fade-in duration-200">
                    <Card className="w-full max-w-lg shadow-2xl border border-border/80 max-h-[90vh] overflow-y-auto">
                        <CardHeader className="flex flex-row items-center justify-between pb-2 border-b">
                            <div>
                                <CardTitle className="text-xl font-bold">Create New Lead</CardTitle>
                                <CardDescription>Enter details to add a lead to the pipeline.</CardDescription>
                            </div>
                            <Button variant="ghost" size="icon" onClick={() => setIsCreateModalOpen(false)}>
                                <X className="h-4 w-4" />
                            </Button>
                        </CardHeader>
                        <CardContent className="pt-5">
                            <form onSubmit={handleCreateSubmit(handleCreateLead)} className="space-y-4">
                                <div className="grid gap-4 sm:grid-cols-2">
                                    <div className="space-y-1">
                                        <Label htmlFor="lead-fn">First Name</Label>
                                        <Input
                                            id="lead-fn"
                                            placeholder="Jane"
                                            className={createErrors.firstName ? "border-destructive" : ""}
                                            {...registerCreate("firstName", { required: "First Name is required" })}
                                        />
                                        {createErrors.firstName && <p className="text-xs text-destructive">{createErrors.firstName.message}</p>}
                                    </div>
                                    <div className="space-y-1">
                                        <Label htmlFor="lead-ln">Last Name</Label>
                                        <Input id="lead-ln" placeholder="Smith" {...registerCreate("lastName")} />
                                    </div>
                                </div>

                                <div className="grid gap-4 sm:grid-cols-2">
                                    <div className="space-y-1">
                                        <Label htmlFor="lead-email">Email</Label>
                                        <Input
                                            id="lead-email"
                                            type="email"
                                            placeholder="jane@example.com"
                                            className={createErrors.email ? "border-destructive" : ""}
                                            {...registerCreate("email", { required: "Email is required" })}
                                        />
                                        {createErrors.email && <p className="text-xs text-destructive">{createErrors.email.message}</p>}
                                    </div>
                                    <div className="space-y-1">
                                        <Label htmlFor="lead-phone">Phone</Label>
                                        <Input id="lead-phone" placeholder="+1 (555) 000-0000" {...registerCreate("phone")} />
                                    </div>
                                </div>

                                <div className="grid gap-4 sm:grid-cols-2">
                                    <div className="space-y-1">
                                        <Label htmlFor="lead-comp">Company</Label>
                                        <Input id="lead-comp" placeholder="Acme Corp" {...registerCreate("company")} />
                                    </div>
                                    <div className="space-y-1">
                                        <Label htmlFor="lead-src">Source</Label>
                                        <Input id="lead-src" placeholder="Website" {...registerCreate("source")} />
                                    </div>
                                </div>

                                <div className="grid gap-4 sm:grid-cols-2">
                                    <div className="space-y-1">
                                        <Label htmlFor="lead-status">Initial Status</Label>
                                        <select
                                            id="lead-status"
                                            className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                                            {...registerCreate("status")}
                                            defaultValue="new"
                                        >
                                            <option value="new">New</option>
                                            <option value="contacted">Contacted</option>
                                            <option value="qualified">Qualified</option>
                                            <option value="proposal_sent">Proposal Sent</option>
                                            <option value="negotiation">Negotiation</option>
                                            <option value="won">Won</option>
                                            <option value="lost">Lost</option>
                                        </select>
                                    </div>

                                    {isAdmin && (
                                        <div className="space-y-1">
                                            <Label htmlFor="lead-assign">Assignee</Label>
                                            <select
                                                id="lead-assign"
                                                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                                                {...registerCreate("assignedTo")}
                                                defaultValue=""
                                            >
                                                <option value="">Unassigned</option>
                                                {users.map((user) => (
                                                    <option key={user._id} value={user._id}>
                                                        {user.name} ({user.role})
                                                    </option>
                                                ))}
                                            </select>
                                        </div>
                                    )}
                                </div>

                                <div className="space-y-1">
                                    <Label htmlFor="lead-notes">Notes</Label>
                                    <textarea
                                        id="lead-notes"
                                        rows={3}
                                        placeholder="Add background information about this lead..."
                                        className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                                        {...registerCreate("notes")}
                                    />
                                </div>

                                <div className="flex justify-end gap-2 pt-3 border-t">
                                    <Button type="button" variant="outline" onClick={() => setIsCreateModalOpen(false)}>
                                        Cancel
                                    </Button>
                                    <Button type="submit" disabled={isSaving}>
                                        {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                        Create Lead
                                    </Button>
                                </div>
                            </form>
                        </CardContent>
                    </Card>
                </div>
            )}

            {/* Lead Details Slide-Over Sheet */}
            {selectedLead && (
                <div className="fixed inset-0 z-50 flex justify-end bg-background/80 backdrop-blur-sm animate-in fade-in duration-200">
                    <div className="w-full max-w-xl bg-background border-l border-border h-full flex flex-col shadow-2xl animate-in slide-in-from-right duration-300">
                        {/* Header */}
                        <div className="p-6 border-b flex items-center justify-between">
                            <div>
                                <Badge className="mb-2 bg-primary/10 text-primary hover:bg-primary/10 border-0">
                                    Lead Profile
                                </Badge>
                                <h2 className="text-2xl font-bold tracking-tight text-foreground">
                                    {selectedLead.firstName} {selectedLead.lastName || ""}
                                </h2>
                            </div>
                            <Button variant="ghost" size="icon" onClick={() => setSelectedLead(null)}>
                                <X className="h-4 w-4" />
                            </Button>
                        </div>

                        {/* Content Scroll Area */}
                        <div className="flex-1 overflow-y-auto p-6 space-y-6">
                            <form onSubmit={handleEditSubmit(handleUpdateLead)} className="space-y-5">
                                {/* Role based warning */}
                                {!isAdmin && (
                                    <div className="rounded-md bg-muted p-3 text-xs text-muted-foreground border">
                                        As a team member, you can only modify the status and add notes for this lead.
                                    </div>
                                )}

                                {/* Lead Details Fields */}
                                <div className="space-y-4">
                                    <div className="grid gap-4 sm:grid-cols-2">
                                        <div className="space-y-1">
                                            <Label htmlFor="edit-fn">First Name</Label>
                                            <Input id="edit-fn" disabled={!isAdmin} {...registerEdit("firstName")} />
                                        </div>
                                        <div className="space-y-1">
                                            <Label htmlFor="edit-ln">Last Name</Label>
                                            <Input id="edit-ln" disabled={!isAdmin} {...registerEdit("lastName")} />
                                        </div>
                                    </div>

                                    <div className="grid gap-4 sm:grid-cols-2">
                                        <div className="space-y-1">
                                            <Label className="flex items-center gap-1.5"><Mail className="h-3.5 w-3.5 text-muted-foreground" /> Email</Label>
                                            <Input id="edit-email" type="email" disabled={!isAdmin} {...registerEdit("email")} />
                                        </div>
                                        <div className="space-y-1">
                                            <Label className="flex items-center gap-1.5"><Phone className="h-3.5 w-3.5 text-muted-foreground" /> Phone</Label>
                                            <Input id="edit-phone" disabled={!isAdmin} {...registerEdit("phone")} />
                                        </div>
                                    </div>

                                    <div className="grid gap-4 sm:grid-cols-2">
                                        <div className="space-y-1">
                                            <Label className="flex items-center gap-1.5"><Briefcase className="h-3.5 w-3.5 text-muted-foreground" /> Company</Label>
                                            <Input id="edit-comp" disabled={!isAdmin} {...registerEdit("company")} />
                                        </div>
                                        <div className="space-y-1">
                                            <Label>Source</Label>
                                            <Input id="edit-src" disabled={!isAdmin} {...registerEdit("source")} />
                                        </div>
                                    </div>

                                    <div className="grid gap-4 sm:grid-cols-2">
                                        <div className="space-y-1">
                                            <Label>Status</Label>
                                            <select
                                                id="edit-status"
                                                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                                                {...registerEdit("status")}
                                            >
                                                <option value="new">New</option>
                                                <option value="contacted">Contacted</option>
                                                <option value="qualified">Qualified</option>
                                                <option value="proposal_sent">Proposal Sent</option>
                                                <option value="negotiation">Negotiation</option>
                                                <option value="won">Won</option>
                                                <option value="lost">Lost</option>
                                            </select>
                                        </div>

                                        <div className="space-y-1">
                                            <Label>Assignee</Label>
                                            {isAdmin ? (
                                                <select
                                                    id="edit-assign"
                                                    className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                                                    {...registerEdit("assignedTo")}
                                                >
                                                    <option value="">Unassigned</option>
                                                    {users.map((user) => (
                                                        <option key={user._id} value={user._id}>
                                                            {user.name} ({user.role})
                                                        </option>
                                                    ))}
                                                </select>
                                            ) : (
                                                <div className="w-full border rounded-md px-3 py-2 text-sm bg-muted text-muted-foreground font-semibold truncate capitalize">
                                                    {typeof selectedLead.assignedTo === "object" && selectedLead.assignedTo
                                                        ? selectedLead.assignedTo.name
                                                        : "Unassigned"}
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    {isAdmin && (
                                        <div className="space-y-1">
                                            <Label htmlFor="edit-notes">Notes</Label>
                                            <textarea
                                                id="edit-notes"
                                                rows={3}
                                                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                                                {...registerEdit("notes")}
                                            />
                                        </div>
                                    )}
                                </div>

                                {/* Form Actions */}
                                <div className="flex items-center justify-between border-t pt-4">
                                    {isAdmin ? (
                                        <Button
                                            type="button"
                                            variant="ghost"
                                            className="text-destructive hover:bg-destructive/10 hover:text-destructive flex items-center gap-1.5"
                                            onClick={() => handleDeleteLead(selectedLead._id)}
                                        >
                                            <Trash2 className="h-4 w-4" /> Delete Lead
                                        </Button>
                                    ) : (
                                        <div />
                                    )}
                                    <Button type="submit" disabled={isSaving} className="flex items-center gap-1.5">
                                        <Save className="h-4 w-4" /> Save Changes
                                    </Button>
                                </div>
                            </form>

                            {/* Divider */}
                            <hr className="border-t" />

                            {/* Notes Section */}
                            <div className="space-y-4">
                                <h3 className="text-lg font-bold flex items-center gap-2 text-foreground">
                                    <MessageSquare className="h-5 w-5 text-primary" /> Notes & Discussion
                                </h3>

                                <form onSubmit={handleAddNote} className="space-y-2">
                                    <textarea
                                        rows={2}
                                        placeholder="Add a new comment or update on this lead..."
                                        value={newNoteContent}
                                        onChange={(e) => setNewNoteContent(e.target.value)}
                                        className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                                        required
                                    />
                                    <div className="flex justify-end">
                                        <Button type="submit" size="sm" disabled={notesLoading}>
                                            {notesLoading && <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" />}
                                            Add Note
                                        </Button>
                                    </div>
                                </form>

                                <div className="space-y-3.5 max-h-[300px] overflow-y-auto pr-1">
                                    {notesLoading && leadNotes.length === 0 ? (
                                        <div className="flex items-center justify-center h-16 text-xs text-muted-foreground gap-2">
                                            <Loader2 className="h-4 w-4 animate-spin" /> Fetching discussion history...
                                        </div>
                                    ) : leadNotes.length === 0 ? (
                                        <p className="text-xs text-muted-foreground text-center py-4">
                                            No notes added yet.
                                        </p>
                                    ) : (
                                        leadNotes.map((note) => {
                                            const author = typeof note.authorId === "object" && note.authorId
                                                ? note.authorId.name
                                                : "A user";
                                            const authorInitials = author
                                                .split(" ")
                                                .map((n) => n[0])
                                                .join("")
                                                .substring(0, 2)
                                                .toUpperCase();

                                            return (
                                                <div key={note._id} className="p-3 border rounded-lg bg-muted/40 space-y-2 text-xs">
                                                    <div className="flex items-center justify-between">
                                                        <div className="flex items-center gap-1.5">
                                                            <div className="h-6 w-6 rounded-full bg-primary/10 text-primary font-bold text-[9px] flex items-center justify-center">
                                                                {authorInitials}
                                                            </div>
                                                            <span className="font-semibold text-foreground">{author}</span>
                                                        </div>
                                                        <span className="text-[10px] text-muted-foreground flex items-center gap-1">
                                                            <Calendar className="h-3 w-3" />
                                                            {new Date(note.createdAt).toLocaleDateString()}
                                                        </span>
                                                    </div>
                                                    <p className="text-muted-foreground leading-relaxed pl-7 break-words">
                                                        {note.content}
                                                    </p>
                                                </div>
                                            );
                                        })
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}