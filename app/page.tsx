"use client"
import Link from "next/link";
import Image from "next/image"; // Added Next.js Image component
import CustomHead from "@/components/general/head";
import { useCurrentUser } from "@/hooks/use-current-user";

export default function Welcome() {
  const auth = useCurrentUser()

  return (
    <div>
      <CustomHead title="Welcome" description="Welcome Page For TD Holdings Inventory" keywords="None" />
      <div className="flex min-h-screen flex-col items-center bg-[#FDFDFC] p-6 text-[#1b1b18] lg:justify-center lg:p-8 dark:bg-[#0a0a0a]">
        <header className="mb-6 w-full max-w-[335px] text-sm not-has-[nav]:hidden lg:max-w-4xl">
          <nav className="flex items-center justify-end gap-4">
            {auth ? (
              <Link
                href='/dashboard'
                className="inline-block rounded-sm border border-[#19140035] px-5 py-1.5 text-sm leading-normal text-[#1b1b18] hover:border-[#1915014a] dark:border-[#3E3E3A] dark:text-[#EDEDEC] dark:hover:border-[#62605b]"
              >
                Dashboard
              </Link>
            ) : (
              <>
                <Link
                  href='/login'
                  className="inline-block rounded-sm border border-transparent px-5 py-1.5 text-sm leading-normal text-[#1b1b18] hover:border-[#19140035] dark:text-[#EDEDEC] dark:hover:border-[#3E3E3A]"
                >
                  Log in
                </Link>
              </>
            )}
          </nav>
        </header>
        <div className="flex w-full items-center justify-center opacity-100 transition-opacity duration-750 lg:grow starting:opacity-0">
          <main className="flex w-full max-w-[335px] flex-col-reverse lg:max-w-4xl lg:flex-row">
            <div className="flex-1 rounded-br-lg rounded-bl-lg bg-white p-6 pb-12 text-[13px] leading-[20px] shadow-[inset_0px_0px_0px_1px_rgba(26,26,0,0.16)] lg:rounded-tl-lg lg:rounded-br-none lg:p-20 dark:bg-[#161615] dark:text-[#EDEDEC] dark:shadow-[inset_0px_0px_0px_1px_#fffaed2d]">
              <h1 className="mb-1 font-medium">Let&apos;s get started</h1>
              <p className="mb-2 text-[#706f6c] dark:text-[#A1A09A]">
                TD Holdings Company Inventory Management System.
                <br />
                Only Authorized Personnel Can Use This System.
              </p>
              <div className="relative w-full h-full">
                <Image
                  src="/Images/TD-Logo.png"
                  alt="TD Holdings Logo"
                  width={500} // Set appropriate width
                  height={300} // Set appropriate height
                  className="object-contain"
                  loading="lazy"
                />
              </div>
            </div>
            <div className="relative -mb-px aspect-[335/376] w-full shrink-0 overflow-hidden rounded-t-lg bg-[#fff2f2] lg:mb-0 lg:-ml-px lg:aspect-auto lg:w-[438px] lg:rounded-t-none lg:rounded-r-lg dark:bg-[#1D0002]">
              <div className="relative w-full h-full">
                <Image
                  src="https://images.unsplash.com/photo-1578844251758-2f71da64c96f?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8dHlyZXN8ZW58MHx8MHx8fDA%3D"
                  alt="Tires"
                  fill
                  className="object-cover"
                  loading="lazy"
                />
              </div>
              <div className="absolute inset-0 rounded-t-lg shadow-[inset_0px_0px_0px_1px_rgba(26,26,0,0.16)] lg:rounded-t-none lg:rounded-r-lg dark:shadow-[inset_0px_0px_0px_1px_#fffaed2d]" />
            </div>
          </main>
        </div>
        <div className="hidden h-14.5 lg:block"></div>
      </div>
    </div>
  );
}