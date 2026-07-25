"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";

export default function LoginPage() {
    return (
        <div className="flex min-h-screen items-center justify-center bg-muted/30 px-4">
            <Card className="w-full max-w-md">
                <CardHeader className="space-y-2 text-center">
                    <CardTitle className="text-3xl font-bold">
                        Lead Management
                    </CardTitle>
                    <CardDescription>
                        Sign in to access your dashboard
                    </CardDescription>
                </CardHeader>

                <CardContent>
                    <form className="space-y-5">
                        <div className="space-y-2">
                            <Label htmlFor="email">Email</Label>
                            <Input
                                id="email"
                                type="email"
                                placeholder="john@example.com"
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="password">Password</Label>
                            <Input
                                id="password"
                                type="password"
                                placeholder="••••••••"
                            />
                        </div>

                        <div className="flex items-center justify-between text-sm">
                            <div className="flex items-center space-x-2">
                                <Checkbox id="remember" />
                                <Label
                                    htmlFor="remember"
                                    className="cursor-pointer font-normal"
                                >
                                    Remember me
                                </Label>
                            </div>

                            <Link
                                href="#"
                                className="text-primary hover:underline"
                            >
                                Forgot password?
                            </Link>
                        </div>

                        <Button className="w-full" type="submit">
                            Sign In
                        </Button>
                    </form>

                    <div className="mt-6 text-center text-sm text-muted-foreground">
                        Don&apos;t have an account?{" "}
                        <Link
                            href="/signup"
                            className="font-medium text-primary hover:underline"
                        >
                            Register
                        </Link>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}