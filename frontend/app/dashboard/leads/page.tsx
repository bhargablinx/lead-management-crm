/* eslint-disable react-hooks/set-state-in-effect */
"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { useForm } from "react-hook-form";
import { useAppDispatch, useAppSelector } from "@/lib/store/store";
import { fetchLeads, addNewLead, editLead, removeLead } from "@/lib/store/leadsSlice";
import { fetchUsers } from "@/lib/store/usersSlice";
import { getLeadNotes, createLeadNote } from "@/lib/api/leads";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import LeadsFilterBar from "@/components/leads/LeadsFilterBar";
import LeadsTable from "@/components/leads/LeadsTable";
import CreateLeadModal from "@/components/leads/CreateLeadModal";
import LeadDetailSlideOver from "@/components/leads/LeadDetailSlideOver";
import type { Lead, Note, CreateLeadPayload, UpdateLeadPayload, GetLeadsParams, LeadStatus } from "@/lib/types";
import type { SortField, SortDir } from "@/components/leads/leadsUtils";

export default function LeadsPage() {
    const dispatch = useAppDispatch();
    const currentUser = useAppSelector((s) => s.auth.user);
    const { leads, pagination, loading: leadsLoading } = useAppSelector((s) => s.leads);
    const { users } = useAppSelector((s) => s.users);
    const isAdmin = currentUser?.role === "admin";

    // ── Filter / Search / Pagination state ─────────────────────────────────
    const [search, setSearch] = useState("");
    const [debouncedSearch, setDebouncedSearch] = useState("");
    const [statusFilter, setStatusFilter] = useState<LeadStatus | "">("");
    const [assignedFilter, setAssignedFilter] = useState("");
    const [page, setPage] = useState(1);
    const [limit, setLimit] = useState(10);
    const [sortField, setSortField] = useState<SortField>("createdAt");
    const [sortDir, setSortDir] = useState<SortDir>("desc");
    const [showFilters, setShowFilters] = useState(false);

    // ── Lead detail / notes state ───────────────────────────────────────────
    const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
    const [leadNotes, setLeadNotes] = useState<Note[]>([]);
    const [newNoteContent, setNewNoteContent] = useState("");
    const [notesLoading, setNotesLoading] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

    // ── Forms ───────────────────────────────────────────────────────────────
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

    // ── Debounced search ────────────────────────────────────────────────────
    const debounceTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
    const handleSearchChange = (val: string) => {
        setSearch(val);
        if (debounceTimer.current) clearTimeout(debounceTimer.current);
        debounceTimer.current = setTimeout(() => {
            setDebouncedSearch(val);
            setPage(1);
        }, 400);
    };

    // ── Sort ────────────────────────────────────────────────────────────────
    const handleSort = (field: SortField) => {
        if (sortField === field) {
            setSortDir((d) => (d === "asc" ? "desc" : "asc"));
        } else {
            setSortField(field);
            setSortDir("asc");
        }
        setPage(1);
    };

    const handleSortChange = (field: string, dir: SortDir) => {
        setSortField(field as SortField);
        setSortDir(dir);
        setPage(1);
    };

    const sortParam = `${sortDir === "desc" ? "-" : ""}${sortField}`;

    // ── Data loading ────────────────────────────────────────────────────────
    const loadLeads = useCallback(() => {
        const params: GetLeadsParams = {
            page,
            limit,
            sort: sortParam,
            ...(debouncedSearch && { search: debouncedSearch }),
            ...(statusFilter && { status: statusFilter }),
            ...(assignedFilter && isAdmin && { assignedTo: assignedFilter }),
        };
        dispatch(fetchLeads(params));
    }, [dispatch, page, limit, sortParam, debouncedSearch, statusFilter, assignedFilter, isAdmin]);

    useEffect(() => { loadLeads(); }, [loadLeads]);
    useEffect(() => { if (isAdmin) dispatch(fetchUsers()); }, [dispatch, isAdmin]);
    useEffect(() => { setPage(1); }, [statusFilter, assignedFilter, limit]);

    // ── Populate edit form when a lead is selected ──────────────────────────
    useEffect(() => {
        if (!selectedLead) return;
        resetEdit({
            firstName: selectedLead.firstName,
            lastName: selectedLead.lastName || "",
            email: selectedLead.email,
            phone: selectedLead.phone || "",
            company: selectedLead.company || "",
            source: selectedLead.source || "",
            status: selectedLead.status,
            assignedTo:
                typeof selectedLead.assignedTo === "object" && selectedLead.assignedTo
                    ? selectedLead.assignedTo._id
                    : (selectedLead.assignedTo as string) || "",
            notes: selectedLead.notes || "",
        });
        setNotesLoading(true);
        getLeadNotes(selectedLead._id)
            .then((res) => { if (res.success) setLeadNotes(res.data); })
            .catch(() => { })
            .finally(() => setNotesLoading(false));
    }, [selectedLead, resetEdit]);

    // ── Handlers ────────────────────────────────────────────────────────────
    const handleCreateLead = async (data: CreateLeadPayload) => {
        setIsSaving(true);
        const result = await dispatch(addNewLead(data));
        if (addNewLead.fulfilled.match(result)) {
            resetCreate();
            setIsCreateModalOpen(false);
            loadLeads();
        }
        setIsSaving(false);
    };

    const handleUpdateLead = async (data: UpdateLeadPayload) => {
        if (!selectedLead) return;
        setIsSaving(true);
        const result = await dispatch(editLead({ id: selectedLead._id, payload: data }));
        if (editLead.fulfilled.match(result)) {
            setSelectedLead(result.payload as Lead);
            loadLeads();
        }
        setIsSaving(false);
    };

    const handleDeleteLead = async (id: string) => {
        if (!window.confirm("Are you sure you want to delete this lead?")) return;
        const result = await dispatch(removeLead(id));
        if (removeLead.fulfilled.match(result)) {
            setSelectedLead(null);
            loadLeads();
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
            }
        } catch { }
        setNotesLoading(false);
    };

    const clearFilters = () => {
        setSearch("");
        setDebouncedSearch("");
        setStatusFilter("");
        setAssignedFilter("");
        setPage(1);
    };

    const hasActiveFilters = !!(debouncedSearch || statusFilter || assignedFilter);
    const activeFilterCount = [debouncedSearch, statusFilter, assignedFilter].filter(Boolean).length;
    const totalLeads = pagination?.total ?? 0;
    const totalPages = pagination?.pages ?? 1;

    return (
        <div className="space-y-6">
            {/* Page header */}
            <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-foreground">Leads</h1>
                    <p className="text-muted-foreground text-sm mt-0.5">
                        {totalLeads > 0
                            ? `${totalLeads} lead${totalLeads !== 1 ? "s" : ""} in your pipeline`
                            : "Manage and track your entire lead pipeline"}
                    </p>
                </div>
                <Button onClick={() => setIsCreateModalOpen(true)} className="flex items-center gap-2 shrink-0">
                    <Plus className="h-4 w-4" /> New Lead
                </Button>
            </div>

            {/* Filter toolbar */}
            <LeadsFilterBar
                search={search}
                onSearchChange={handleSearchChange}
                statusFilter={statusFilter}
                onStatusChange={setStatusFilter}
                assignedFilter={assignedFilter}
                onAssignedChange={setAssignedFilter}
                limit={limit}
                onLimitChange={setLimit}
                sortField={sortField}
                sortDir={sortDir}
                onSortChange={handleSortChange}
                showFilters={showFilters}
                onToggleFilters={() => setShowFilters((v) => !v)}
                hasActiveFilters={hasActiveFilters}
                activeFilterCount={activeFilterCount}
                onClearFilters={clearFilters}
                isAdmin={isAdmin}
                users={users}
            />

            {/* Leads table + pagination */}
            <LeadsTable
                leads={leads}
                loading={leadsLoading}
                hasActiveFilters={hasActiveFilters}
                onClearFilters={clearFilters}
                onSelectLead={setSelectedLead}
                sortField={sortField}
                sortDir={sortDir}
                onSort={handleSort}
                page={page}
                limit={limit}
                totalLeads={totalLeads}
                totalPages={totalPages}
                onPageChange={setPage}
            />

            {/* Create lead modal */}
            <CreateLeadModal
                isOpen={isCreateModalOpen}
                onClose={() => setIsCreateModalOpen(false)}
                onSubmit={handleCreateLead}
                handleSubmit={handleCreateSubmit}
                register={registerCreate}
                errors={createErrors}
                isSaving={isSaving}
                isAdmin={isAdmin}
                users={users}
            />

            {/* Lead detail slide-over */}
            {selectedLead && (
                <LeadDetailSlideOver
                    lead={selectedLead}
                    onClose={() => setSelectedLead(null)}
                    register={registerEdit}
                    handleSubmit={handleEditSubmit}
                    onSave={handleUpdateLead}
                    isSaving={isSaving}
                    isAdmin={isAdmin}
                    onDelete={handleDeleteLead}
                    users={users}
                    notes={leadNotes}
                    notesLoading={notesLoading}
                    newNoteContent={newNoteContent}
                    onNoteContentChange={setNewNoteContent}
                    onAddNote={handleAddNote}
                />
            )}
        </div>
    );
}
