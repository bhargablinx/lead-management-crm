"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function SignupPage() {
    return (
        <div className="flex min-h-screen items-center justify-center bg-muted/30 px-4 py-8">
            <Card className="w-full max-w-md">
                <CardHeader className="space-y-2 text-center">
                    <CardTitle className="text-3xl font-bold">
                        Create Organization
                    </CardTitle>
                    <CardDescription>
                        Create your organization and administrator account.
                    </CardDescription>
                </CardHeader>

                <CardContent>
                    <form className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="orgName">Organization Name</Label>
                            <Input
                                id="orgName"
                                name="orgName"
                                placeholder="One Org"
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="orgSlug">Organization Slug</Label>
                            <Input
                                id="orgSlug"
                                name="orgSlug"
                                placeholder="one-org"
                            />
                            <p className="text-xs text-muted-foreground">
                                Used in your organization&apos; URL.
                            </p>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="name">Full Name</Label>
                            <Input
                                id="name"
                                name="name"
                                placeholder="One"
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="email">Email Address</Label>
                            <Input
                                id="email"
                                name="email"
                                type="email"
                                placeholder="one@example.com"
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="password">Password</Label>
                            <Input
                                id="password"
                                name="password"
                                type="password"
                                placeholder="••••••••"
                            />
                        </div>

                        <Button type="submit" className="w-full">
                            Create Organization
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