"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, X } from "lucide-react";
import { UseFormRegister, UseFormHandleSubmit, FieldErrors } from "react-hook-form";
import { STATUS_OPTIONS } from "./leadsUtils";
import type { CreateLeadPayload, User } from "@/lib/types";

interface CreateLeadModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (data: CreateLeadPayload) => Promise<void>;
    handleSubmit: UseFormHandleSubmit<CreateLeadPayload>;
    register: UseFormRegister<CreateLeadPayload>;
    errors: FieldErrors<CreateLeadPayload>;
    isSaving: boolean;
    isAdmin: boolean;
    users: User[];
}

export default function CreateLeadModal({
    isOpen,
    onClose,
    onSubmit,
    handleSubmit,
    register,
    errors,
    isSaving,
    isAdmin,
    users,
}: CreateLeadModalProps) {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm animate-in fade-in duration-200">
            <Card className="w-full max-w-lg shadow-2xl border border-border/80 max-h-[90vh] overflow-y-auto">
                <CardHeader className="flex flex-row items-center justify-between pb-2 border-b">
                    <div>
                        <CardTitle className="text-xl font-bold">Create New Lead</CardTitle>
                        <CardDescription>Enter details to add a lead to the pipeline.</CardDescription>
                    </div>
                    <Button variant="ghost" size="icon" onClick={onClose}>
                        <X className="h-4 w-4" />
                    </Button>
                </CardHeader>
                <CardContent className="pt-5">
                    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                        <div className="grid gap-4 sm:grid-cols-2">
                            <div className="space-y-1">
                                <Label htmlFor="c-fn">First Name *</Label>
                                <Input
                                    id="c-fn"
                                    placeholder="Jane"
                                    className={errors.firstName ? "border-destructive" : ""}
                                    {...register("firstName", { required: "Required" })}
                                />
                                {errors.firstName && (
                                    <p className="text-xs text-destructive">{errors.firstName.message}</p>
                                )}
                            </div>
                            <div className="space-y-1">
                                <Label htmlFor="c-ln">Last Name</Label>
                                <Input id="c-ln" placeholder="Doe" {...register("lastName")} />
                            </div>
                        </div>

                        <div className="grid gap-4 sm:grid-cols-2">
                            <div className="space-y-1">
                                <Label htmlFor="c-email">Email *</Label>
                                <Input
                                    id="c-email"
                                    type="email"
                                    placeholder="jane@company.com"
                                    className={errors.email ? "border-destructive" : ""}
                                    {...register("email", { required: "Required" })}
                                />
                                {errors.email && (
                                    <p className="text-xs text-destructive">{errors.email.message}</p>
                                )}
                            </div>
                            <div className="space-y-1">
                                <Label htmlFor="c-phone">Phone</Label>
                                <Input id="c-phone" placeholder="+1 555-0100" {...register("phone")} />
                            </div>
                        </div>

                        <div className="grid gap-4 sm:grid-cols-2">
                            <div className="space-y-1">
                                <Label htmlFor="c-company">Company</Label>
                                <Input id="c-company" placeholder="Acme Corp" {...register("company")} />
                            </div>
                            <div className="space-y-1">
                                <Label htmlFor="c-source">Source</Label>
                                <Input id="c-source" placeholder="Website, Referral…" {...register("source")} />
                            </div>
                        </div>

                        <div className="space-y-1">
                            <Label htmlFor="c-status">Status</Label>
                            <select
                                id="c-status"
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
                                <Label htmlFor="c-assign">Assign To</Label>
                                <select
                                    id="c-assign"
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
                            <Label htmlFor="c-notes">Notes</Label>
                            <textarea
                                id="c-notes"
                                rows={3}
                                placeholder="Background info about this lead…"
                                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                                {...register("notes")}
                            />
                        </div>

                        <div className="flex justify-end gap-2 pt-3 border-t">
                            <Button type="button" variant="outline" onClick={onClose}>
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
    );
}
