"use client";

import { useRef, useState, useTransition } from "react";
import AppLayout from "@/layouts/app-layout";
import SettingsLayout from "@/layouts/settings/layout";
import HeadingSmall from "@/components/general/heading-small";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import InputError from "@/components/general/input-error";
import { useCurrentUser } from "@/hooks/use-current-user";
import { updatePassword } from "@/actions/auth.actions";

export default function ChangePassword() {
    const user = useCurrentUser();
    const passwordInput = useRef<HTMLInputElement>(null);
    const currentPasswordInput = useRef<HTMLInputElement>(null);

    const [currentPassword, setCurrentPassword] = useState("");
    const [password, setPassword] = useState("");
    const [passwordConfirmation, setPasswordConfirmation] = useState("");
    const [errors, setErrors] = useState<Record<string, string[]>>({});
    const [success, setSuccess] = useState(false);
    const [isPending, startTransition] = useTransition();

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        startTransition(async () => {
            setErrors({});
            setSuccess(false);

            const formData = new FormData();
            formData.append("current_password", currentPassword);
            formData.append("password", password);
            formData.append("password_confirmation", passwordConfirmation);

            const result = await updatePassword(formData);

            if (result && 'error' in result) {
                if (typeof result.error === 'object' && result.error !== null) {
                    setErrors(result.error as Record<string, string[]>);
    
                } else {
                    setErrors({ general: ["An unexpected error occurred"] });
                }
                
                if (result.error && typeof result.error === 'object') {
                    const errorObj = result.error as Record<string, string[]>;
                    if (errorObj.password) {
                        setPassword("");
                        setPasswordConfirmation("");
                        passwordInput.current?.focus();
                    }
                    if (errorObj.current_password) {
                        setCurrentPassword("");
                        currentPasswordInput.current?.focus();
                    }
                }
            } else if (result && 'success' in result) {
                setSuccess(true);
                setCurrentPassword("");
                setPassword("");
                setPasswordConfirmation("");
            }
        });
    };

    if (!user) {
        return (
            <AppLayout breadcrumbs={[{ title: "Change Password", href: "/settings/password" }]}>
                <SettingsLayout>
                    <p>Loading...</p>
                </SettingsLayout>
            </AppLayout>
        );
    }

    return (
        <AppLayout breadcrumbs={[{ title: "Change Password", href: "/settings/password" }]}>
            <SettingsLayout>
                <div className="space-y-6">
                    <HeadingSmall
                        title="Change Password"
                        description="Update your password to keep your account secure"
                    />
                    
                    {/* Success Message */}
                    {success && (
                        <div className="bg-green-50 border border-green-200 rounded-md p-4">
                            <p className="text-green-800">
                                Password changed successfully!
                            </p>
                        </div>
                    )}

                    {/* General Error Message */}
                    {errors.general && (
                        <div className="bg-red-50 border border-red-200 rounded-md p-4">
                            <p className="text-red-800">{errors.general[0]}</p>
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="grid gap-2">
                            <Label htmlFor="current_password">Current Password</Label>
                            <Input
                                id="current_password"
                                ref={currentPasswordInput}
                                value={currentPassword}
                                onChange={(e) => setCurrentPassword(e.target.value)}
                                type="password"
                                autoComplete="current-password"
                                placeholder="Enter your current password"
                                disabled={isPending}
                            />
                            <InputError message={errors.current_password?.[0]} />
                        </div>

                        <div className="grid gap-2">
                            <Label htmlFor="password">New Password</Label>
                            <Input
                                id="password"
                                ref={passwordInput}
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                type="password"
                                autoComplete="new-password"
                                placeholder="Enter your new password"
                                disabled={isPending}
                            />
                            <InputError message={errors.password?.[0]} />
                        </div>

                        <div className="grid gap-2">
                            <Label htmlFor="password_confirmation">Confirm New Password</Label>
                            <Input
                                id="password_confirmation"
                                value={passwordConfirmation}
                                onChange={(e) => setPasswordConfirmation(e.target.value)}
                                type="password"
                                autoComplete="new-password"
                                placeholder="Confirm your new password"
                                disabled={isPending}
                            />
                            <InputError message={errors.password_confirmation?.[0]} />
                        </div>

                        <div className="flex items-center gap-4">
                            <Button 
                                type="submit" 
                                disabled={isPending || !currentPassword || !password || !passwordConfirmation}
                            >
                                {isPending ? "Changing Password..." : "Change Password"}
                            </Button>
                            {success && <p className="text-sm text-green-600">Password changed successfully!</p>}
                        </div>
                    </form>
                </div>
            </SettingsLayout>
        </AppLayout>
    );
}