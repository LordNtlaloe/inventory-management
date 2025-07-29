"use client";

import { useState, useEffect, useTransition } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import AppLayout from "@/layouts/app-layout";
import SettingsLayout from "@/layouts/settings/layout";
import HeadingSmall from "@/components/general/heading-small";
import InputError from "@/components/general/input-error";
import DeleteUser from "@/components/general/delete-user";
import { updateUser } from "@/actions/user.actions";
import { useCurrentUser } from "@/hooks/use-current-user";

export default function Profile() {
    const user = useCurrentUser();
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [errors, setErrors] = useState<{ name?: string[]; email?: string[] }>({});
    const [success, setSuccess] = useState(false);
    const [isPending] = useTransition();
    const [mustVerifyEmail, setMustVerifyEmail] = useState(false);
    const [status, setStatus] = useState<string | undefined>();

    useEffect(() => {
        if (user) {
            setName(user.name || "");
            setEmail(user.email || "");
            setMustVerifyEmail(!user.email_verified_at);
        }
    }, [user]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        setErrors({});
        setSuccess(false);

        const formData = new FormData();
        formData.append("first_name", name);
        formData.append("email", email);

        try {
            const result = await updateUser(user.id, formData);

            if (result.error) {
                setErrors(result.error);
                return {}
            } else {
                setSuccess(true);
                // TypeScript now knows result might have changedEmail
                if (result) {
                    setMustVerifyEmail(true);
                    setStatus(undefined);
                }
            }
        } catch (error) {
            setErrors({ email: [`An unexpected error occurred, ${error}`] });
        }
    };

    if (!user) {
        return (
            <AppLayout breadcrumbs={[{ title: "Profile settings", href: "/settings/profile" }]}>
                <SettingsLayout>
                    <p>Loading...</p>
                </SettingsLayout>
            </AppLayout>
        );
    }
    return (
        <AppLayout breadcrumbs={[{ title: "Profile settings", href: "/settings/profile" }]}>
            <SettingsLayout>
                <div className="space-y-6">
                    <HeadingSmall title="Profile information" description="Update your name and email address" />
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="grid gap-2">
                            <Label htmlFor="name">Name</Label>
                            <Input id="name" value={name} onChange={(e) => setName(e.target.value)} required />
                            <InputError className="mt-2" message={errors.name?.[0]} />
                        </div>

                        <div className="grid gap-2">
                            <Label htmlFor="email">Email address</Label>
                            <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
                            <InputError className="mt-2" message={errors.email?.[0]} />
                        </div>

                        {mustVerifyEmail && (
                            <div>
                                <p className="text-muted-foreground -mt-4 text-sm">
                                    Your email address is unverified.{" "}
                                    <Button variant="link" className="p-0">
                                        Click here to resend the verification email.
                                    </Button>
                                </p>
                                {status === "verification-link-sent" && (
                                    <div className="mt-2 text-sm font-medium text-green-600">
                                        A new verification link has been sent to your email address.
                                    </div>
                                )}
                            </div>
                        )}

                        <div className="flex items-center gap-4">
                            <Button type="submit" disabled={isPending}>
                                {isPending ? "Saving..." : "Save"}
                            </Button>
                            {success && <p className="text-sm text-neutral-600">Saved</p>}
                        </div>
                    </form>
                </div>
                <DeleteUser userId={user.id} />
            </SettingsLayout>
        </AppLayout>
    );
}