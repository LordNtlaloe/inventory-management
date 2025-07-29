import Heading from '@/components/general/heading';
import { type PropsWithChildren } from 'react';


export default function EmployeesLayout({ children }: PropsWithChildren) {

    if (typeof window === 'undefined') {
        return null;
    }


    return (
        <div className="px-4 py-6">
            <Heading title="Employees" description="Manage Your Employees" />

            <div className="flex flex-col space-y-8 lg:flex-row lg:space-y-0 lg:space-x-12 w-full">
                <div className="flex-1 md:max-w-7xl lg:w-full lg:max-w-full px-4">
                    <section className="space-y-12 max-w-full">{children}</section>
                </div>
            </div>
        </div>
    );
}
