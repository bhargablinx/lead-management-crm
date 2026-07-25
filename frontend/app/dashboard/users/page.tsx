"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { useAppDispatch, useAppSelector } from "@/lib/store/store";
import { fetchUsers, addNewUser, editUser, removeUser, clearUsersError } from "@/lib/store/usersSlice";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import {
    UserPlus,
    Edit2,
    Trash2,
    ShieldAlert,
    UserCheck,
    UserX,
    Search,
    Loader2,
    X,
} from "lucide-react";
import Link from "next/link";
import type { CreateUserPayload, UpdateUserPayload, User } from "@/lib/types";

export default function UsersPage() {
    const dispatch = useAppDispatch();
    const currentUser = useAppSelector((state) => state.auth.user);
    const { users, loading, error } = useAppSelector((state) => state.users);

    const [searchQuery, setSearchQuery] = useState("");
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [editingUser, setEditingUser] = useState<User | null>(null);

    const {
        register: registerAdd,
        handleSubmit: handleAddSubmit,
        reset: resetAdd,
        formState: { errors: addErrors },
    } = useForm<CreateUserPayload>();

    const {
        register: registerEdit,
        handleSubmit: handleEditSubmit,
        reset: resetEdit,
        formState: { errors: editErrors },
    } = useForm<UpdateUserPayload>();

    // Load users on mount (if admin)
    useEffect(() => {
        if (currentUser?.role === "admin") {
            dispatch(fetchUsers({ search: searchQuery }));
        }
    }, [dispatch, currentUser, searchQuery]);

    // Handle editing state reset
    useEffect(() => {
        if (editingUser) {
            resetEdit({
                name: editingUser.name,
                email: editingUser.email,
                role: editingUser.role,
                isActive: editingUser.isActive,
            });
        }
    }, [editingUser, resetEdit]);

    // Permission check
    if (currentUser?.role !== "admin") {
        return (
            <div className="flex min-h-[70vh] items-center justify-center p-4">
                <Card className="w-full max-w-md border-destructive/20 shadow-xl text-center">
                    <CardHeader className="space-y-3">
                        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-destructive/10 text-destructive">
                            <ShieldAlert className="h-7 w-7" />
                        </div>
                        <CardTitle className="text-2xl font-bold tracking-tight text-foreground">
                            Access Denied
                        </CardTitle>
                        <CardDescription className="text-sm">
                            You must have administrator privileges to view or manage users in this organization.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Link href="/dashboard">
                            <Button className="w-full">Return to Dashboard</Button>
                        </Link>
                    </CardContent>
                </Card>
            </div>
        );
    }

    const onAddSubmit = async (data: CreateUserPayload) => {
        const result = await dispatch(addNewUser(data));
        if (addNewUser.fulfilled.match(result)) {
            setIsAddModalOpen(false);
            resetAdd();
        }
    };

    const onEditSubmit = async (data: UpdateUserPayload) => {
        if (!editingUser) return;
        const result = await dispatch(editUser({ id: editingUser._id, payload: data }));
        if (editUser.fulfilled.match(result)) {
            setEditingUser(null);
            resetEdit();
        }
    };

    const handleDeleteUser = (id: string) => {
        if (window.confirm("Are you sure you want to delete this user? This action cannot be undone.")) {
            dispatch(removeUser(id));
        }
    };

    const handleToggleStatus = (user: User) => {
        dispatch(editUser({ id: user._id, payload: { isActive: !user.isActive } }));
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">User Management</h1>
                    <p className="text-muted-foreground">
                        Manage roles, status, and credentials for your team.
                    </p>
                </div>
                <Button
                    onClick={() => {
                        dispatch(clearUsersError());
                        setIsAddModalOpen(true);
                    }}
                    className="flex items-center gap-2"
                >
                    <UserPlus className="h-4 w-4" /> Add User
                </Button>
            </div>

            {/* Controls */}
            <div className="flex items-center max-w-sm relative">
                <Search className="absolute left-3 h-4 w-4 text-muted-foreground" />
                <Input
                    placeholder="Search users..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-9"
                />
            </div>

            {/* Error Alert */}
            {error && (
                <div className="rounded-md bg-destructive/15 p-4 text-sm text-destructive border border-destructive/20 flex justify-between items-center">
                    <span>{error}</span>
                    <button onClick={() => dispatch(clearUsersError())} className="text-destructive/80 hover:text-destructive">
                        <X className="h-4 w-4" />
                    </button>
                </div>
            )}

            {/* Users Table */}
            <Card className="shadow-sm">
                <CardContent className="p-0">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Name</TableHead>
                                <TableHead>Email</TableHead>
                                <TableHead>Role</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead className="text-right">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {loading && users.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={5} className="h-32 text-center">
                                        <Loader2 className="mx-auto h-6 w-6 animate-spin text-muted-foreground" />
                                        <p className="text-xs text-muted-foreground mt-2">Loading users...</p>
                                    </TableCell>
                                </TableRow>
                            ) : users.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={5} className="h-32 text-center text-muted-foreground">
                                        No users found.
                                    </TableCell>
                                </TableRow>
                            ) : (
                                users.map((user) => (
                                    <TableRow key={user._id} className="hover:bg-muted/30 transition-colors">
                                        <TableCell className="font-semibold text-foreground">
                                            {user.name}
                                        </TableCell>
                                        <TableCell>{user.email}</TableCell>
                                        <TableCell>
                                            <Badge variant={user.role === "admin" ? "default" : "secondary"} className="capitalize">
                                                {user.role}
                                            </Badge>
                                        </TableCell>
                                        <TableCell>
                                            <Badge
                                                variant={user.isActive ? "default" : "destructive"}
                                                className="bg-emerald-500 hover:bg-emerald-600 text-white border-0 capitalize"
                                                style={!user.isActive ? { backgroundColor: "#ef4444" } : undefined}
                                            >
                                                {user.isActive ? "Active" : "Suspended"}
                                            </Badge>
                                        </TableCell>
                                        <TableCell className="text-right space-x-1.5">
                                            <Button
                                                variant="outline"
                                                size="icon"
                                                title={user.isActive ? "Suspend User" : "Activate User"}
                                                onClick={() => handleToggleStatus(user)}
                                                className="h-8 w-8 text-muted-foreground hover:text-foreground"
                                            >
                                                {user.isActive ? <UserX className="h-3.5 w-3.5" /> : <UserCheck className="h-3.5 w-3.5 text-emerald-500" />}
                                            </Button>
                                            <Button
                                                variant="outline"
                                                size="icon"
                                                title="Edit User"
                                                onClick={() => {
                                                    dispatch(clearUsersError());
                                                    setEditingUser(user);
                                                }}
                                                className="h-8 w-8 text-muted-foreground hover:text-foreground"
                                            >
                                                <Edit2 className="h-3.5 w-3.5" />
                                            </Button>
                                            <Button
                                                variant="outline"
                                                size="icon"
                                                title="Delete User"
                                                onClick={() => handleDeleteUser(user._id)}
                                                disabled={user._id === currentUser._id}
                                                className="h-8 w-8 text-muted-foreground hover:text-destructive hover:bg-destructive/5"
                                            >
                                                <Trash2 className="h-3.5 w-3.5" />
                                            </Button>
                                        </TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>

            {/* Add User Modal */}
            {isAddModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm animate-in fade-in duration-200">
                    <Card className="w-full max-w-md shadow-2xl border border-border/80">
                        <CardHeader className="flex flex-row items-center justify-between pb-2 border-b">
                            <div>
                                <CardTitle className="text-xl font-bold">Add Team Member</CardTitle>
                                <CardDescription>Create a new account in your organization.</CardDescription>
                            </div>
                            <Button variant="ghost" size="icon" onClick={() => setIsAddModalOpen(false)}>
                                <X className="h-4 w-4" />
                            </Button>
                        </CardHeader>
                        <CardContent className="pt-5">
                            <form onSubmit={handleAddSubmit(onAddSubmit)} className="space-y-4">
                                <div className="space-y-1">
                                    <Label htmlFor="add-name">Name</Label>
                                    <Input
                                        id="add-name"
                                        placeholder="Jane Smith"
                                        className={addErrors.name ? "border-destructive" : ""}
                                        {...registerAdd("name", { required: "Name is required" })}
                                    />
                                    {addErrors.name && <p className="text-xs text-destructive">{addErrors.name.message}</p>}
                                </div>

                                <div className="space-y-1">
                                    <Label htmlFor="add-email">Email</Label>
                                    <Input
                                        id="add-email"
                                        type="email"
                                        placeholder="jane@company.com"
                                        className={addErrors.email ? "border-destructive" : ""}
                                        {...registerAdd("email", {
                                            required: "Email is required",
                                            pattern: { value: /^\S+@\S+$/i, message: "Invalid email" },
                                        })}
                                    />
                                    {addErrors.email && <p className="text-xs text-destructive">{addErrors.email.message}</p>}
                                </div>

                                <div className="space-y-1">
                                    <Label htmlFor="add-password">Password</Label>
                                    <Input
                                        id="add-password"
                                        type="password"
                                        placeholder="••••••••"
                                        className={addErrors.password ? "border-destructive" : ""}
                                        {...registerAdd("password", {
                                            required: "Password is required",
                                            minLength: { value: 8, message: "Min 8 characters required" },
                                        })}
                                    />
                                    {addErrors.password && <p className="text-xs text-destructive">{addErrors.password.message}</p>}
                                </div>

                                <div className="space-y-1">
                                    <Label htmlFor="add-role">Role</Label>
                                    <select
                                        id="add-role"
                                        className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                                        {...registerAdd("role", { required: "Role is required" })}
                                        defaultValue="member"
                                    >
                                        <option value="member">Member</option>
                                        <option value="admin">Administrator</option>
                                    </select>
                                </div>

                                <div className="flex justify-end gap-2 pt-3 border-t">
                                    <Button type="button" variant="outline" onClick={() => setIsAddModalOpen(false)}>
                                        Cancel
                                    </Button>
                                    <Button type="submit" disabled={loading}>
                                        {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                        Save Member
                                    </Button>
                                </div>
                            </form>
                        </CardContent>
                    </Card>
                </div>
            )}

            {/* Edit User Modal */}
            {editingUser && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm animate-in fade-in duration-200">
                    <Card className="w-full max-w-md shadow-2xl border border-border/80">
                        <CardHeader className="flex flex-row items-center justify-between pb-2 border-b">
                            <div>
                                <CardTitle className="text-xl font-bold">Edit Member Account</CardTitle>
                                <CardDescription>Update name, email, or role permissions.</CardDescription>
                            </div>
                            <Button variant="ghost" size="icon" onClick={() => setEditingUser(null)}>
                                <X className="h-4 w-4" />
                            </Button>
                        </CardHeader>
                        <CardContent className="pt-5">
                            <form onSubmit={handleEditSubmit(onEditSubmit)} className="space-y-4">
                                <div className="space-y-1">
                                    <Label htmlFor="edit-name">Name</Label>
                                    <Input
                                        id="edit-name"
                                        placeholder="Jane Smith"
                                        className={editErrors.name ? "border-destructive" : ""}
                                        {...registerEdit("name", { required: "Name is required" })}
                                    />
                                    {editErrors.name && <p className="text-xs text-destructive">{editErrors.name.message}</p>}
                                </div>

                                <div className="space-y-1">
                                    <Label htmlFor="edit-email">Email</Label>
                                    <Input
                                        id="edit-email"
                                        type="email"
                                        placeholder="jane@company.com"
                                        className={editErrors.email ? "border-destructive" : ""}
                                        {...registerEdit("email", {
                                            required: "Email is required",
                                            pattern: { value: /^\S+@\S+$/i, message: "Invalid email" },
                                        })}
                                    />
                                    {editErrors.email && <p className="text-xs text-destructive">{editErrors.email.message}</p>}
                                </div>

                                <div className="space-y-1">
                                    <Label htmlFor="edit-password">Password (Optional)</Label>
                                    <Input
                                        id="edit-password"
                                        type="password"
                                        placeholder="Leave blank to keep unchanged"
                                        {...registerEdit("password", {
                                            validate: (val) => !val || val.length >= 8 || "Min 8 characters required",
                                        })}
                                    />
                                    {editErrors.password && <p className="text-xs text-destructive">{editErrors.password.message}</p>}
                                </div>

                                <div className="space-y-1">
                                    <Label htmlFor="edit-role">Role</Label>
                                    <select
                                        id="edit-role"
                                        className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                                        {...registerEdit("role", { required: "Role is required" })}
                                    >
                                        <option value="member">Member</option>
                                        <option value="admin">Administrator</option>
                                    </select>
                                </div>

                                <div className="flex justify-end gap-2 pt-3 border-t">
                                    <Button type="button" variant="outline" onClick={() => setEditingUser(null)}>
                                        Cancel
                                    </Button>
                                    <Button type="submit" disabled={loading}>
                                        {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                        Save Changes
                                    </Button>
                                </div>
                            </form>
                        </CardContent>
                    </Card>
                </div>
            )}
        </div>
    );
}
