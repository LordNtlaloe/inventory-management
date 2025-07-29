import { useCallback } from 'react';

export function useInitials() {
    return useCallback((user?: { first_name?: string; last_name?: string }): string => {
        if (!user) return '';

        const firstName = user.first_name?.trim() || '';
        const lastName = user.last_name?.trim() || '';

        if (!firstName && !lastName) return '';

        const firstInitial = firstName.charAt(0).toUpperCase();
        const lastInitial = lastName.charAt(0).toUpperCase();

        return `${firstInitial}${lastInitial}`;
    }, []);
}