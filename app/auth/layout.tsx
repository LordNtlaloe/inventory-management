// app/auth/layout.tsx
import AuthLayoutTemplate from '@/layouts/auth/auth-split-layout';

export default function AuthLayout({ children }: { children: React.ReactNode }) {
    return (
        <AuthLayoutTemplate
            title="Authentication"
            description="Welcome back! Please enter your details."
        >
            {children}
        </AuthLayoutTemplate>
    );
}