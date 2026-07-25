"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAppDispatch, useAppSelector } from "@/lib/store/store";
import { registerUser, clearError } from "@/lib/store/authSlice";
import type { RegisterPayload } from "@/lib/types";

export default function SignupPage() {
    const router = useRouter();
    const dispatch = useAppDispatch();
    const { isAuthenticated, loading, error } = useAppSelector((state) => state.auth);

    const {
        register,
        handleSubmit,
        formState: { errors },
        watch,
        setValue,
    } = useForm<RegisterPayload>();

    // Clear errors on mount
    useEffect(() => {
        dispatch(clearError());
    }, [dispatch]);

    // Redirect if authenticated
    useEffect(() => {
        if (isAuthenticated) {
            router.push("/dashboard");
        }
    }, [isAuthenticated, router]);

    // Automatically suggest organization slug from organization name
    // eslint-disable-next-line react-hooks/incompatible-library
    const orgNameValue = watch("orgName");
    useEffect(() => {
        if (orgNameValue) {
            const slug = orgNameValue
                .toLowerCase()
                .trim()
                .replace(/[^\w\s-]/g, "") // Remove special characters
                .replace(/[\s_]+/g, "-")  // Replace spaces/underscores with hyphens
                .replace(/^-+|-+$/g, ""); // Remove trailing/leading hyphens
            setValue("orgSlug", slug, { shouldValidate: true });
        }
    }, [orgNameValue, setValue]);

    const onSubmit = (data: RegisterPayload) => {
        dispatch(registerUser(data));
    };

    return (
        <div className="flex min-h-screen items-center justify-center bg-muted/30 px-4 py-8">
            <Card className="w-full max-w-md shadow-lg border border-border/50">
                <CardHeader className="space-y-2 text-center">
                    <CardTitle className="text-3xl font-bold tracking-tight">
                        Create Organization
                    </CardTitle>
                    <CardDescription>
                        Create your organization and administrator account.
                    </CardDescription>
                </CardHeader>

                <CardContent>
                    {error && (
                        <div className="mb-5 rounded-md bg-destructive/15 p-3 text-sm text-destructive border border-destructive/20 animate-in fade-in duration-200">
                            {error}
                        </div>
                    )}

                    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="orgName">Organization Name</Label>
                            <Input
                                id="orgName"
                                placeholder="One Org"
                                className={errors.orgName ? "border-destructive focus-visible:ring-destructive" : ""}
                                {...register("orgName", {
                                    required: "Organization Name is required",
                                    minLength: {
                                        value: 2,
                                        message: "Must be at least 2 characters",
                                    },
                                })}
                            />
                            {errors.orgName && (
                                <p className="text-xs text-destructive mt-1">
                                    {errors.orgName.message}
                                </p>
                            )}
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="orgSlug">Organization Slug</Label>
                            <Input
                                id="orgSlug"
                                placeholder="one-org"
                                className={errors.orgSlug ? "border-destructive focus-visible:ring-destructive" : ""}
                                {...register("orgSlug", {
                                    required: "Organization Slug is required",
                                    pattern: {
                                        value: /^[a-z0-9-]+$/,
                                        message: "Slug must contain only lowercase letters, numbers, and dashes",
                                    },
                                    minLength: {
                                        value: 2,
                                        message: "Must be at least 2 characters",
                                    },
                                })}
                            />
                            <p className="text-xs text-muted-foreground">
                                Used in your organization&apos;s URL.
                            </p>
                            {errors.orgSlug && (
                                <p className="text-xs text-destructive mt-1">
                                    {errors.orgSlug.message}
                                </p>
                            )}
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="name">Full Name</Label>
                            <Input
                                id="name"
                                placeholder="John Doe"
                                className={errors.name ? "border-destructive focus-visible:ring-destructive" : ""}
                                {...register("name", {
                                    required: "Full Name is required",
                                    minLength: {
                                        value: 2,
                                        message: "Must be at least 2 characters",
                                    },
                                })}
                            />
                            {errors.name && (
                                <p className="text-xs text-destructive mt-1">
                                    {errors.name.message}
                                </p>
                            )}
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="email">Email Address</Label>
                            <Input
                                id="email"
                                type="email"
                                placeholder="one@example.com"
                                className={errors.email ? "border-destructive focus-visible:ring-destructive" : ""}
                                {...register("email", {
                                    required: "Email Address is required",
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

                        <div className="space-y-2">
                            <Label htmlFor="password">Password</Label>
                            <Input
                                id="password"
                                type="password"
                                placeholder="••••••••"
                                className={errors.password ? "border-destructive focus-visible:ring-destructive" : ""}
                                {...register("password", {
                                    required: "Password is required",
                                    minLength: {
                                        value: 8,
                                        message: "Password must be at least 8 characters",
                                    },
                                })}
                            />
                            {errors.password && (
                                <p className="text-xs text-destructive mt-1">
                                    {errors.password.message}
                                </p>
                            )}
                        </div>

                        <Button type="submit" className="w-full flex justify-center items-center gap-2" disabled={loading}>
                            {loading ? (
                                <>
                                    <span className="h-4 w-4 animate-spin rounded-full border-2 border-background border-t-transparent" />
                                    Creating Organization...
                                </>
                            ) : (
                                "Create Organization"
                            )}
                        </Button>
                    </form>

                    <div className="mt-6 text-center text-sm text-muted-foreground">
                        Already have an account?{" "}
                        <Link
                            href="/login"
                            className="font-medium text-primary hover:underline"
                        >
                            Sign In
                        </Link>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}