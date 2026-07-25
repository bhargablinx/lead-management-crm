"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { useAppSelector } from "@/lib/store/store";

export default function RootPage() {
    const router = useRouter();
    const { isAuthenticated, loading } = useAppSelector((state) => state.auth);

    useEffect(() => {
        if (!loading) {
            if (isAuthenticated) {
                router.replace("/dashboard");
            } else {
                router.replace("/login");
            }
        }
    }, [isAuthenticated, loading, router]);

    // Premium full-page loader while determining auth redirection
    return (
        <div className="flex min-h-screen flex-col items-center justify-center bg-background">
            <div className="flex flex-col items-center space-y-4">
                <div className="relative h-10 w-10">
                    <div className="absolute inset-0 rounded-full border-4 border-muted" />
                    <div className="absolute inset-0 rounded-full border-4 border-primary border-t-transparent animate-spin" />
                </div>
                <p className="text-xs text-muted-foreground font-medium animate-pulse">
                    Routing session...
                </p>
            </div>
        </div>
    );
}
