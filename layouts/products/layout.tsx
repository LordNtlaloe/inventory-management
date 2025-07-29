"use client"
import { getAllBranches } from '@/actions/branches.actions';
import Heading from '@/components/general/heading';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { useCurrentRole } from '@/hooks/use-current-role';
import { cn } from '@/lib/utils';
import Link from 'next/link';
import { useEffect, useState, type PropsWithChildren } from 'react';

type Branch = {
    id: string;
    branch_name: string;
};

export default function ProductsLayout({ children }: PropsWithChildren) {

    const [branches, setBranches] = useState<Branch[]>([]);
    const user_role = useCurrentRole();

    const getBranches = async () => {
        const fetchedBranches = await getAllBranches();
        setBranches(fetchedBranches)
    }

    useEffect(() => {
        getBranches()
    }, []);

    if (typeof window === 'undefined') {
        return null;
    }

    const currentPath = window.location.pathname + window.location.search;
    const isAdmin = user_role === 'Admin';

    return (
        <div className="px-4 w-full">
            <Heading title="Products" description="Manage products across branches" />

            <div className="flex flex-col space-y-8 lg:flex-row lg:space-y-0 lg:space-x-12 w-full">
                {/* Sidebar - Only show for admin users */}
                {isAdmin && (
                    <aside className="w-full max-w-xl lg:w-48">
                        <nav className="flex flex-col space-y-1 space-x-0">
                            <Button
                                size="sm"
                                variant="ghost"
                                asChild
                                className={cn('w-full justify-start', {
                                    'bg-muted': currentPath === '/products',
                                })}
                            >
                                <Link href="/products" prefetch>All Products</Link>
                            </Button>
                            {branches.map((branch) => (
                                <Button
                                    key={branch.id}
                                    size="sm"
                                    variant="ghost"
                                    asChild
                                    className={cn('w-full justify-start', {
                                        'bg-muted': currentPath.includes(`branch_id=${branch.id}`),
                                    })}
                                >
                                    <Link href={`/products?branch_id=${branch.id}`} prefetch>
                                        {branch.branch_name}
                                    </Link>
                                </Button>
                            ))}
                        </nav>
                    </aside>
                )}

                {/* Separator for mobile */}
                {isAdmin && <Separator className="my-6 md:hidden" />}

                {/* Main Content - Full Width */}
                <div className="flex-1 w-full">
                    <section className="flex flex-col w-full h-full">{children}</section>
                </div>
            </div>
        </div>
    );
}
