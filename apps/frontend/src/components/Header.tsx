import { useEffect, useState } from "react";
import { Dialog } from "@headlessui/react";
import { Bars3Icon, XMarkIcon } from "@heroicons/react/24/outline";
import { SignedIn, SignedOut, UserButton } from "@clerk/nextjs";
import Link from "next/link";
import { useRouter } from "next/router";
import LinkButton from "@/components/UI/LinkButton";

export default function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const router = useRouter();

  useEffect(() => {
    setMobileMenuOpen(false);
  }, [router.pathname]);

  return (
    <header className="z-10 pb-4">
      <nav className="mx-auto flex h-24 max-w-7xl items-center justify-between p-6 lg:px-8">
        <div className="flex lg:flex-1">
          <Link href="/" className="-m-1.5 p-1.5">
            <span className="sr-only">Orderly</span>
            <span className="font-semibold leading-6">Orderly</span>
          </Link>
        </div>
        <SignedOut>
          <LinkButton variant="outline" href="/signin">
            Sign in
          </LinkButton>
        </SignedOut>
        <SignedIn>
          <div className="flex lg:hidden">
            <button
              type="button"
              className="-m-2.5 inline-flex items-center justify-center rounded-md p-2.5"
              onClick={() => setMobileMenuOpen(true)}
            >
              <span className="sr-only">Open main menu</span>
              <Bars3Icon className="h-6 w-6" aria-hidden="true" />
            </button>
          </div>
          <div className="hidden text-sm font-semibold leading-6 lg:flex lg:gap-x-12">
            <Link href="/dashboard">Dashboard</Link>
            <Link href="/upcoming">Upcoming</Link>
            <Link href="/prof">Professor View</Link>
          </div>
          <div className="hidden lg:flex lg:flex-1 lg:justify-end">
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

      <SignedIn>
        <Dialog
          as="div"
          className="text-gray-950 lg:hidden"
          open={mobileMenuOpen}
          onClose={setMobileMenuOpen}
        >
          <div className="fixed inset-0 z-10" />
          <Dialog.Panel className="fixed inset-y-0 right-0 z-10 w-full overflow-y-auto bg-white p-6 sm:max-w-sm sm:ring-1 sm:ring-gray-900/10">
            <div className="flex h-12 items-center justify-between">
              <Link href="/" className="-m-1.5 p-1.5">
                <span className="sr-only">Orderly</span>
                <span className="font-semibold leading-6">Orderly</span>
              </Link>
              <button
                type="button"
                className="-m-2.5 rounded-md p-2.5"
                onClick={() => setMobileMenuOpen(false)}
              >
                <span className="sr-only">Close menu</span>
                <XMarkIcon className="h-6 w-6" aria-hidden="true" />
              </button>
            </div>
            <div className="mt-6 flow-root">
              <div className="-my-6 divide-y divide-gray-500/10">
                <div className="space-y-2 py-6 font-semibold leading-7">
                  <Link
                    href="/dashboard"
                    className="-mx-3 block rounded-lg px-3 py-2 hover:bg-gray-50"
                  >
                    Dashboard
                  </Link>
                  <Link
                    href="/upcoming"
                    className="-mx-3 block rounded-lg px-3 py-2 hover:bg-gray-50"
                  >
                    Upcoming
                  </Link>

                  <Link
                    href="/prof"
                    className="-mx-3 block rounded-lg px-3 py-2 hover:bg-gray-50"
                  >
                    ProfessorView
                  </Link>
                </div>
                <div className="py-6">
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
              </div>
            </div>
          </Dialog.Panel>
        </Dialog>
      </SignedIn>
    </header>
  );
}
