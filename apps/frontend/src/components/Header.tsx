import { useEffect, useState } from "react";
import { Dialog } from "@headlessui/react";
import { Bars3Icon, XMarkIcon } from "@heroicons/react/24/outline";
import { SignedIn, SignedOut, UserButton, useUser } from "@clerk/nextjs";
import Link from "next/link";
import { useRouter } from "next/router";
import Button from "@/components/ui/Button";
import { Container } from "@/components/Container";
import { LogoWithText, LogoWithoutText } from "@/components/Logo";
import { cn } from "@/lib/utils";

export default function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const router = useRouter();
  const { user } = useUser();

  useEffect(() => {
    setMobileMenuOpen(false);
  }, [router.pathname]);

  return (
    <header className="z-10 border-b border-b-gray-200 bg-white text-gray-950">
      <Container>
        {/* consistent header */}
        <nav className="flex h-24 items-center justify-between">
          {/* logo and links (links only visible medium and up) */}
          <div className="flex items-center gap-4">
            <Link
              href="/"
              className="-m-2.5 p-2.5 focus-visible:rounded focus-visible:outline focus-visible:outline-4 focus-visible:outline-indigo-400"
            >
              <SignedOut>
                <LogoWithText />
              </SignedOut>
              <SignedIn>
                <LogoWithText className="md:hidden" />
                <LogoWithoutText className="hidden md:flex" />
              </SignedIn>
            </Link>
            <SignedIn>
              <div className="hidden text-sm font-medium leading-7 md:flex md:gap-x-2">
                <Link
                  className={cn(
                    router.pathname === "/courses"
                      ? "bg-gray-200/70 hover:bg-gray-200/70"
                      : "hover:bg-gray-100",
                    "inline-block rounded px-3 py-1.5"
                  )}
                  href="/courses"
                >
                  Courses
                </Link>
                <Link
                  className={cn(
                    router.pathname === "/scheduled"
                      ? "bg-gray-200/70 hover:bg-gray-200/70"
                      : "hover:bg-gray-100",
                    "inline-block rounded px-3 py-1.5"
                  )}
                  href="/scheduled"
                >
                  Scheduled
                </Link>
              </div>
            </SignedIn>
          </div>

          {/* sign in button */}
          <SignedOut>
            <Button as="link" variant="outline" href="/signin" size="lg">
              Sign in
            </Button>
          </SignedOut>

          {/* hamburger button or user avatar button */}
          <SignedIn>
            <button
              type="button"
              className="-m-2.5 inline-flex items-center justify-center rounded-md p-2.5 md:hidden"
              onClick={() => setMobileMenuOpen(true)}
            >
              <span className="sr-only">Open main menu</span>
              <Bars3Icon className="h-7 w-7" aria-hidden="true" />
            </button>
            <div className="hidden md:flex">
              <UserButton
                appearance={{
                  elements: {
                    userButtonAvatarBox: "h-11 w-11",
                  },
                  variables: {
                    colorPrimary: "#4E46E5",
                    colorText: "#030712",
                    colorTextOnPrimaryBackground: "#F9FAFB",
                  },
                }}
                userProfileMode="navigation"
                userProfileUrl="/account"
                afterSignOutUrl="/"
              />
            </div>
          </SignedIn>
        </nav>

        {/* mobile menu */}
        <SignedIn>
          <Dialog
            as="div"
            className="text-gray-950 md:hidden"
            open={mobileMenuOpen}
            onClose={setMobileMenuOpen}
          >
            <Dialog.Panel className="fixed inset-y-0 right-0 z-10 w-full overflow-y-auto bg-white p-6 px-4 pt-0 sm:px-6 sm:ring-1 sm:ring-gray-900/10 lg:px-8">
              <div className="flex h-[97px] items-center justify-between border-b border-b-gray-200">
                <Link
                  href="/"
                  className="-m-2.5 p-2.5 focus-visible:rounded focus-visible:outline focus-visible:outline-4 focus-visible:outline-indigo-400"
                >
                  <LogoWithText />
                </Link>
                <button
                  type="button"
                  className="-m-2.5 rounded p-2.5"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <span className="sr-only">Close menu</span>
                  <XMarkIcon className="h-7 w-7" aria-hidden="true" />
                </button>
              </div>
              <div className="py-6">
                <div className="divide-y divide-gray-200">
                  <div className="space-y-2 pb-6 font-medium leading-7">
                    <Link
                      href="/courses"
                      className={cn(
                        router.pathname === "/courses"
                          ? "bg-gray-200/70 hover:bg-gray-200/70"
                          : "hover:bg-gray-100",
                        "-mx-2.5 block rounded px-2.5 py-4"
                      )}
                    >
                      Courses
                    </Link>
                    <Link
                      href="/scheduled"
                      className={cn(
                        router.pathname === "/scheduled"
                          ? "bg-gray-200/70 hover:bg-gray-200/70"
                          : "hover:bg-gray-100",
                        "-mx-2.5 block rounded px-2.5 py-4"
                      )}
                    >
                      Scheduled
                    </Link>
                  </div>
                  <div className="flex gap-4 pt-6">
                    <UserButton
                      appearance={{
                        elements: {
                          userButtonAvatarBox: "h-11 w-11",
                        },
                        variables: {
                          colorPrimary: "#4E46E5",
                          colorText: "#030712",
                          colorTextOnPrimaryBackground: "#F9FAFB",
                        },
                      }}
                      userProfileMode="navigation"
                      userProfileUrl="/account"
                      afterSignOutUrl="/"
                    />
                    <div className="text-sm">
                      <p className="font-medium">{user?.fullName}</p>
                      <p className="text-gray-500">
                        {user?.primaryEmailAddress?.emailAddress}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </Dialog.Panel>
          </Dialog>
        </SignedIn>
      </Container>
    </header>
  );
}
