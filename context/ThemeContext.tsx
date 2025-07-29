// contexts/ThemeContext.tsx
'use client';

import { createContext, useContext, useEffect, useState, ReactNode } from 'react';

export type Appearance = 'light' | 'dark' | 'system';

interface ThemeContextType {
    appearance: Appearance;
    updateAppearance: (mode: Appearance) => void;
    isDark: boolean;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

// Helper functions
const prefersDark = (): boolean => {
    if (typeof window === 'undefined') {
        return false;
    }
    return window.matchMedia('(prefers-color-scheme: dark)').matches;
};

const setCookie = (name: string, value: string, days = 365): void => {
    if (typeof document === 'undefined') {
        return;
    }
    const maxAge = days * 24 * 60 * 60;
    document.cookie = `${name}=${value};path=/;max-age=${maxAge};SameSite=Lax`;
};

const getCookie = (name: string): string | null => {
    if (typeof document === 'undefined') {
        return null;
    }
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) {
        return parts.pop()?.split(';').shift() || null;
    }
    return null;
};

const applyTheme = (appearance: Appearance): boolean => {
    const isDark = appearance === 'dark' || (appearance === 'system' && prefersDark());

    if (typeof document !== 'undefined') {
        document.documentElement.classList.toggle('dark', isDark);
    }

    return isDark;
};

const getStoredAppearance = (): Appearance => {
    // Try localStorage first (client-side)
    if (typeof window !== 'undefined') {
        const stored = localStorage.getItem('appearance') as Appearance;
        if (stored && ['light', 'dark', 'system'].includes(stored)) {
            return stored;
        }
    }

    // Fallback to cookie (works on server-side too)
    const cookieValue = getCookie('appearance') as Appearance;
    if (cookieValue && ['light', 'dark', 'system'].includes(cookieValue)) {
        return cookieValue;
    }

    return 'system';
};

interface ThemeProviderProps {
    children: ReactNode;
}

export function ThemeProvider({ children }: ThemeProviderProps) {
    const [appearance, setAppearance] = useState<Appearance>('system');
    const [isDark, setIsDark] = useState(false);
    const [mounted, setMounted] = useState(false);

    const updateAppearance = (mode: Appearance) => {
        setAppearance(mode);
        const dark = applyTheme(mode);
        setIsDark(dark);

        // Store in localStorage for client-side persistence
        if (typeof window !== 'undefined') {
            localStorage.setItem('appearance', mode);
        }

        // Store in cookie for SSR
        setCookie('appearance', mode);
    };

    const handleSystemThemeChange = () => {
        if (appearance === 'system') {
            const dark = applyTheme('system');
            setIsDark(dark);
        }
    };

    useEffect(() => {
        setMounted(true);

        // Initialize theme from stored preference
        const savedAppearance = getStoredAppearance();
        setAppearance(savedAppearance);
        const dark = applyTheme(savedAppearance);
        setIsDark(dark);

        // Listen for system theme changes
        const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
        mediaQuery.addEventListener('change', handleSystemThemeChange);

        return () => {
            mediaQuery.removeEventListener('change', handleSystemThemeChange);
        };
    }, []);

    useEffect(() => {
        if (mounted) {
            const dark = applyTheme(appearance);
            setIsDark(dark);
        }
    }, [appearance, mounted]);

    // Prevent hydration mismatch by not rendering until mounted
    if (!mounted) {
        return null;
    }

    return (
        <ThemeContext.Provider value={{ appearance, updateAppearance, isDark }}>
            {children}
        </ThemeContext.Provider>
    );
}

export function useTheme(): ThemeContextType {
    const context = useContext(ThemeContext);
    if (context === undefined) {
        throw new Error('useTheme must be used within a ThemeProvider');
    }
    return context;
}

// Optional: Theme toggle component
export function ThemeToggle() {
    const { appearance, updateAppearance } = useTheme();

    const toggleTheme = () => {
        if (appearance === 'light') {
            updateAppearance('dark');
        } else if (appearance === 'dark') {
            updateAppearance('system');
        } else {
            updateAppearance('light');
        }
    };

    return (
        <button
            onClick={toggleTheme}
            className="p-2 rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
            aria-label={`Switch to ${appearance === 'light' ? 'dark' : appearance === 'dark' ? 'system' : 'light'} mode`}
        >
            {appearance === 'light' && '☀️'}
            {appearance === 'dark' && '🌙'}
            {appearance === 'system' && '💻'}
        </button>
    );
}