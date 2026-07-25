"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { useAppDispatch, useAppSelector } from "@/lib/store/store";
import { logoutUser } from "@/lib/store/authSlice";
import { Button } from "@/components/ui/button";
import { LogOut, User as UserIcon, Building } from "lucide-react";

export default function DashboardLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const router = useRouter();
    const dispatch = useAppDispatch();
    const { isAuthenticated, loading, user } = useAppSelector((state) => state.auth);

    useEffect(() => {
        if (!loading && !isAuthenticated) {
            router.push("/login");
        }
    }, [isAuthenticated, loading, router]);

    const handleLogout = () => {
        dispatch(logoutUser());
    };

    // Premium full-page loading spinner while verifying authentication
    if (loading) {
        return (
            <div className="flex min-h-screen flex-col items-center justify-center bg-background p-4">
                <div className="flex flex-col items-center space-y-4">
                    {/* Animated custom premium spinner */}
                    <div className="relative h-12 w-12">
                        <div className="absolute inset-0 rounded-full border-4 border-muted" />
                        <div className="absolute inset-0 rounded-full border-4 border-primary border-t-transparent animate-spin" />
                    </div>
                    <div className="space-y-1 text-center">
                        <p className="text-sm font-medium text-foreground">Verifying secure session...</p>
                        <p className="text-xs text-muted-foreground">Please wait a moment</p>
                    </div>
                </div>
            </div>
        );
    }

    // If not authenticated (and done loading), render nothing while redirecting
    if (!isAuthenticated) {
        return null;
    }

    return (
        <div className="min-h-screen bg-muted/20">
            {/* Top Navigation Header */}
            <header className="sticky top-0 z-40 w-full border-b border-border/80 bg-background/95 backdrop-blur-sm">
                <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
                    {/* Left: Brand/Logo */}
                    <div className="flex items-center space-x-3">
                        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary text-primary-foreground font-bold text-lg">
                            L
                        </div>
                        <span className="font-bold text-lg tracking-tight hidden sm:inline-block">
                            Lead Management CRM
                        </span>
                    </div>

                    {/* Right: User Profile & Actions */}
                    <div className="flex items-center space-x-4">
                        {/* User Profile Info Pill */}
                        <div className="flex items-center space-x-2 rounded-full border border-border bg-muted/40 py-1.5 px-3.5 text-xs font-medium max-w-[200px] sm:max-w-xs">
                            <UserIcon className="h-3.5 w-3.5 text-muted-foreground flex-shrink-0" />
                            <span className="truncate text-foreground font-semibold">
                                {user?.name}
                            </span>
                            <span className="h-3 w-[1px] bg-border hidden sm:inline" />
                            <Building className="h-3.5 w-3.5 text-muted-foreground flex-shrink-0 hidden sm:inline" />
                            <span className="truncate text-muted-foreground capitalize hidden sm:inline">
                                {user?.role}
                            </span>
                        </div>

                        {/* Sign Out Button */}
                        <Button
                            variant="ghost"
                            size="sm"
                            className="text-muted-foreground hover:text-destructive hover:bg-destructive/10 flex items-center gap-1.5 font-medium transition-colors"
                            onClick={handleLogout}
                        >
                            <LogOut className="h-4 w-4" />
                            <span className="hidden md:inline">Sign Out</span>
                        </Button>
                    </div>
                </div>
            </header>

            {/* Main Page Content Wrapper */}
            <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
                {children}
            </main>
        </div>
    );
}
