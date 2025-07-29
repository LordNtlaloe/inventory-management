"use client";

import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import { getUserByEmail } from "@/actions/user.actions";

export const useCurrentUser = () => {
    const { data: session } = useSession();
    const [user, setUser] = useState<any>(session?.user || null);

    useEffect(() => {
        const fetchUser = async () => {
            if (session?.user?.email) {
                const res = await getUserByEmail(session?.user?.email)
                setUser(res)
            }
        };
        if (session?.user) fetchUser();
    }, [session]);

    return user;
};
