"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Loader2, X, Trash2, Save, MessageSquare, Mail, Phone, Briefcase } from "lucide-react";
import { UseFormRegister, UseFormHandleSubmit } from "react-hook-form";
import { STATUS_OPTIONS, formatDate } from "./leadsUtils";
import type { Lead, Note, UpdateLeadPayload, User } from "@/lib/types";

interface LeadDetailSlideOverProps {
    lead: Lead;
    onClose: () => void;
    // Edit form
    register: UseFormRegister<UpdateLeadPayload>;
    handleSubmit: UseFormHandleSubmit<UpdateLeadPayload>;
    onSave: (data: UpdateLeadPayload) => void;
    isSaving: boolean;
    // Delete
    isAdmin: boolean;
    onDelete: (id: string) => void;
    users: User[];
    // Notes
    notes: Note[];
    notesLoading: boolean;
    newNoteContent: string;
    onNoteContentChange: (val: string) => void;
    onAddNote: (e: React.FormEvent) => void;
}

export default function LeadDetailSlideOver({
    lead,
    onClose,
    register,
    handleSubmit,
    onSave,
    isSaving,
    isAdmin,
    onDelete,
    users,
    notes,
    notesLoading,
    newNoteContent,
    onNoteContentChange,
    onAddNote,
}: LeadDetailSlideOverProps) {
    return (
        <div className="fixed inset-0 z-50 flex justify-end bg-background/80 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="w-full max-w-xl bg-background border-l border-border h-full flex flex-col shadow-2xl animate-in slide-in-from-right duration-300">
                {/* Header */}
                <div className="p-6 border-b flex items-center justify-between">
                    <div>
                        <Badge className="mb-2 bg-primary/10 text-primary hover:bg-primary/10 border-0">
                            Lead Profile
                        </Badge>
                        <h2 className="text-2xl font-bold tracking-tight text-foreground">
                            {lead.firstName} {lead.lastName || ""}
                        </h2>
                    </div>
                    <Button variant="ghost" size="icon" onClick={onClose}>
                        <X className="h-4 w-4" />
                    </Button>
                </div>

                {/* Scrollable content */}
                <div className="flex-1 overflow-y-auto p-6 space-y-6">
                    {/* ── Edit Form ── */}
                    <form onSubmit={handleSubmit(onSave)} className="space-y-5">
                        {!isAdmin && (
                            <div className="rounded-md bg-muted p-3 text-xs text-muted-foreground border">
                                As a team member, you can only modify the status and add notes for this lead.
                            </div>
                        )}

                        <div className="space-y-4">
                            <div className="grid gap-4 sm:grid-cols-2">
                                <div className="space-y-1">
                                    <Label htmlFor="e-fn">First Name</Label>
                                    <Input id="e-fn" disabled={!isAdmin} {...register("firstName")} />
                                </div>
                                <div className="space-y-1">
                                    <Label htmlFor="e-ln">Last Name</Label>
                                    <Input id="e-ln" disabled={!isAdmin} {...register("lastName")} />
                                </div>
                            </div>
                            <div className="grid gap-4 sm:grid-cols-2">
                                <div className="space-y-1">
                                    <Label className="flex items-center gap-1.5">
                                        <Mail className="h-3.5 w-3.5 text-muted-foreground" /> Email
                                    </Label>
                                    <Input id="e-email" type="email" disabled={!isAdmin} {...register("email")} />
                                </div>
                                <div className="space-y-1">
                                    <Label className="flex items-center gap-1.5">
                                        <Phone className="h-3.5 w-3.5 text-muted-foreground" /> Phone
                                    </Label>
                                    <Input id="e-phone" disabled={!isAdmin} {...register("phone")} />
                                </div>
                            </div>
                            <div className="grid gap-4 sm:grid-cols-2">
                                <div className="space-y-1">
                                    <Label className="flex items-center gap-1.5">
                                        <Briefcase className="h-3.5 w-3.5 text-muted-foreground" /> Company
                                    </Label>
                                    <Input id="e-company" disabled={!isAdmin} {...register("company")} />
                                </div>
                                <div className="space-y-1">
                                    <Label>Source</Label>
                                    <Input id="e-source" disabled={!isAdmin} {...register("source")} />
                                </div>
                            </div>

                            {/* Status — editable by all */}
                            <div className="space-y-1">
                                <Label htmlFor="e-status">Status</Label>
                                <select
                                    id="e-status"
                                    {...register("status")}
                                    className="w-full h-9 rounded-md border border-input bg-background px-3 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                                >
                                    {STATUS_OPTIONS.filter((s) => s.value).map((s) => (
                                        <option key={s.value} value={s.value}>{s.label}</option>
                                    ))}
                                </select>
                            </div>

                            {isAdmin && (
                                <div className="space-y-1">
                                    <Label htmlFor="e-assign">Assigned To</Label>
                                    <select
                                        id="e-assign"
                                        {...register("assignedTo")}
                                        className="w-full h-9 rounded-md border border-input bg-background px-3 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                                    >
                                        <option value="">Unassigned</option>
                                        {users.map((u) => (
                                            <option key={u._id} value={u._id}>{u.name} ({u.role})</option>
                                        ))}
                                    </select>
                                </div>
                            )}

                            <div className="space-y-1">
                                <Label htmlFor="e-notes">Notes</Label>
                                <textarea
                                    id="e-notes"
                                    rows={3}
                                    disabled={!isAdmin}
                                    className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring disabled:opacity-50"
                                    {...register("notes")}
                                />
                            </div>
                        </div>

                        <div className="flex items-center justify-between gap-2 pt-3 border-t">
                            {isAdmin && (
                                <Button
                                    type="button"
                                    variant="destructive"
                                    size="sm"
                                    className="gap-1.5"
                                    onClick={() => onDelete(lead._id)}
                                >
                                    <Trash2 className="h-3.5 w-3.5" /> Delete
                                </Button>
                            )}
                            <Button type="submit" disabled={isSaving} size="sm" className="ml-auto gap-1.5">
                                {isSaving
                                    ? <Loader2 className="h-3.5 w-3.5 animate-spin" />
                                    : <Save className="h-3.5 w-3.5" />}
                                Save Changes
                            </Button>
                        </div>
                    </form>

                    {/* ── Notes Thread ── */}
                    <div className="space-y-4">
                        <h3 className="text-sm font-semibold flex items-center gap-2">
                            <MessageSquare className="h-4 w-4 text-muted-foreground" /> Notes
                            <span className="text-muted-foreground font-normal">({notes.length})</span>
                        </h3>

                        <form onSubmit={onAddNote} className="flex gap-2">
                            <Input
                                placeholder="Write a note…"
                                value={newNoteContent}
                                onChange={(e) => onNoteContentChange(e.target.value)}
                                className="flex-1"
                            />
                            <Button type="submit" size="sm" disabled={!newNoteContent.trim() || notesLoading}>
                                {notesLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Add"}
                            </Button>
                        </form>

                        {notesLoading && notes.length === 0 ? (
                            <div className="flex justify-center py-6">
                                <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
                            </div>
                        ) : notes.length === 0 ? (
                            <p className="text-sm text-muted-foreground py-4 text-center">No notes yet.</p>
                        ) : (
                            <div className="space-y-3">
                                {notes.map((note) => {
                                    const author = typeof note.authorId === "object" ? note.authorId.name : "Unknown";
                                    return (
                                        <div key={note._id} className="rounded-lg border border-border bg-muted/20 px-4 py-3 space-y-1">
                                            <p className="text-sm leading-relaxed">{note.content}</p>
                                            <p className="text-[11px] text-muted-foreground">
                                                {author} · {formatDate(note.createdAt)}
                                            </p>
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
