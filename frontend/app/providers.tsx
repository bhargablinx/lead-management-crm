"use client";

import { Provider } from "react-redux";
import { store, useAppDispatch } from "@/lib/store/store";
import { checkAuth } from "@/lib/store/authSlice";
import { useEffect } from "react";

function AuthInitializer({ children }: { children: React.ReactNode }) {
    const dispatch = useAppDispatch();

    useEffect(() => {
        dispatch(checkAuth());
    }, [dispatch]);

    return <>{children}</>;
}

export function Providers({ children }: { children: React.ReactNode }) {
    return (
        <Provider store={store}>
            <AuthInitializer>{children}</AuthInitializer>
        </Provider>
    );
}
