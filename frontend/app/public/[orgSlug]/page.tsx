/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState } from "react";
import { useParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { submitPublicLead } from "@/lib/api/leads";
import { CheckCircle2, AlertCircle, Sparkles, Send, Loader2 } from "lucide-react";
import type { PublicLeadPayload } from "@/lib/types";

export default function PublicLeadForm() {
    const params = useParams();
    const orgSlug = params.orgSlug as string;

    const [isSubmitted, setIsSubmitted] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [errorMsg, setErrorMsg] = useState<string | null>(null);

    const {
        register,
        handleSubmit,
        reset,
        formState: { errors },
    } = useForm<PublicLeadPayload>();

    const onSubmit = async (data: PublicLeadPayload) => {
        setSubmitting(true);
        setErrorMsg(null);
        try {
            const res = await submitPublicLead(orgSlug, data);
            if (res.success) {
                setIsSubmitted(true);
                reset();
            } else {
                setErrorMsg(res.message || "Failed to submit lead");
            }
        } catch (err: any) {
            setErrorMsg(
                err.response?.data?.message ||
                "Organization not found or inactive. Please double check the URL."
            );
        }
        setSubmitting(false);
    };

    const getOrgNameFromSlug = (slug: string) => {
        return slug
            .split("-")
            .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
            .join(" ");
    };

    if (isSubmitted) {
        return (
            <div className="flex min-h-screen items-center justify-center bg-muted/30 px-4">
                <Card className="w-full max-w-md shadow-2xl border-emerald-500/10 text-center animate-in zoom-in-95 duration-300">
                    <CardHeader className="space-y-4">
                        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-emerald-500/10 text-emerald-500">
                            <CheckCircle2 className="h-10 w-10 animate-bounce" />
                        </div>
                        <CardTitle className="text-2xl font-bold tracking-tight text-foreground">
                            Submission Successful!
                        </CardTitle>
                        <CardDescription className="text-sm">
                            Thank you for reaching out to <span className="font-semibold text-foreground">{getOrgNameFromSlug(orgSlug)}</span>.
                            Your information has been successfully received, and our team will get in touch with you shortly.
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="pt-2">
                        <Button
                            variant="outline"
                            className="w-full mt-2"
                            onClick={() => setIsSubmitted(false)}
                        >
                            Submit Another Request
                        </Button>
                    </CardContent>
                </Card>
            </div>
        );
    }

    return (
        <div className="flex min-h-screen items-center justify-center bg-muted/30 px-4 py-8">
            <Card className="w-full max-w-lg shadow-2xl border border-border/50">
                <CardHeader className="space-y-2 text-center pb-4 border-b border-border/40">
                    <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-primary">
                        <Sparkles className="h-5 w-5" />
                    </div>
                    <CardTitle className="text-2xl font-bold tracking-tight">
                        Contact Request
                    </CardTitle>
                    <CardDescription>
                        Submit your details to connect with <span className="font-semibold text-foreground capitalize">{getOrgNameFromSlug(orgSlug)}</span>.
                    </CardDescription>
                </CardHeader>

                <CardContent className="pt-6">
                    {errorMsg && (
                        <div className="mb-5 rounded-md bg-destructive/15 p-3.5 text-sm text-destructive border border-destructive/20 flex gap-2 items-start animate-in fade-in duration-200">
                            <AlertCircle className="h-5 w-5 flex-shrink-0 mt-0.5" />
                            <span>{errorMsg}</span>
                        </div>
                    )}

                    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                        <div className="grid gap-4 sm:grid-cols-2">
                            <div className="space-y-1">
                                <Label htmlFor="pub-fn">First Name *</Label>
                                <Input
                                    id="pub-fn"
                                    placeholder="John"
                                    className={errors.firstName ? "border-destructive" : ""}
                                    {...register("firstName", { required: "First Name is required" })}
                                />
                                {errors.firstName && (
                                    <p className="text-xs text-destructive mt-1">
                                        {errors.firstName.message}
                                    </p>
                                )}
                            </div>
                            <div className="space-y-1">
                                <Label htmlFor="pub-ln">Last Name</Label>
                                <Input
                                    id="pub-ln"
                                    placeholder="Doe"
                                    {...register("lastName")}
                                />
                            </div>
                        </div>

                        <div className="grid gap-4 sm:grid-cols-2">
                            <div className="space-y-1">
                                <Label htmlFor="pub-email">Email Address *</Label>
                                <Input
                                    id="pub-email"
                                    type="email"
                                    placeholder="john@example.com"
                                    className={errors.email ? "border-destructive" : ""}
                                    {...register("email", {
                                        required: "Email is required",
                                        pattern: {
                                            value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                                            message: "Invalid email address",
                                        },
                                    })}
                                />
                                {errors.email && (
                                    <p className="text-xs text-destructive mt-1">
                                        {errors.email.message}
                                    </p>
                                )}
                            </div>
                            <div className="space-y-1">
                                <Label htmlFor="pub-phone">Phone Number</Label>
                                <Input
                                    id="pub-phone"
                                    placeholder="+1 (555) 000-0000"
                                    {...register("phone")}
                                />
                            </div>
                        </div>

                        <div className="space-y-1">
                            <Label htmlFor="pub-company">Company</Label>
                            <Input
                                id="pub-company"
                                placeholder="Acme Inc."
                                {...register("company")}
                            />
                        </div>

                        <div className="space-y-1">
                            <Label htmlFor="pub-notes">Message / Requirements</Label>
                            <textarea
                                id="pub-notes"
                                rows={4}
                                placeholder="Describe your request or requirements here..."
                                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                                {...register("notes")}
                            />
                        </div>

                        <Button type="submit" className="w-full flex items-center justify-center gap-2 pt-2.5" disabled={submitting}>
                            {submitting ? (
                                <>
                                    <Loader2 className="h-4 w-4 animate-spin" />
                                    Submitting Request...
                                </>
                            ) : (
                                <>
                                    <Send className="h-4 w-4" />
                                    Submit Details
                                </>
                            )}
                        </Button>
                    </form>
                </CardContent>
            </Card>
        </div>
    );
}
