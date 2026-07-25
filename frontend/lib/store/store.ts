import { configureStore } from "@reduxjs/toolkit";
import { useDispatch, useSelector, type TypedUseSelectorHook } from "react-redux";
import authReducer from "./authSlice";
import leadsReducer from "./leadsSlice";
import usersReducer from "./usersSlice";

export const store = configureStore({
    reducer: {
        auth: authReducer,
        leads: leadsReducer,
        users: usersReducer,
    },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

// Custom typed hooks for use in React components
export const useAppDispatch = () => useDispatch<AppDispatch>();
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;
