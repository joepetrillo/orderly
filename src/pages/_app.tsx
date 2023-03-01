import type { AppProps } from "next/app";
import {
  ClerkProvider,
  SignedIn,
  SignedOut,
  SignInButton,
  UserButton,
} from "@clerk/nextjs";
import { Inter } from "next/font/google";
import "@/styles/globals.css";

const inter = Inter({ subsets: ["latin"] });

function Header() {
  return (
    <header className="mx-auto box-content flex h-11 max-w-screen-lg items-center justify-between py-8 px-4">
      <h1>Orderly</h1>
      <SignedIn>
        <UserButton
          appearance={{
            elements: {
              userButtonAvatarBox: "h-11 w-11",
            },
          }}
          userProfileMode="navigation"
          userProfileUrl="/account"
          afterSignOutUrl="/"
        />
      </SignedIn>
      <SignedOut>
        <SignInButton />
      </SignedOut>
    </header>
  );
}

export default function App({ Component, pageProps }: AppProps) {
  return (
    <>
      <style jsx global>{`
				:root {
					--font-inter: ${inter.style.fontFamily};
				}
			}`}</style>
      <ClerkProvider {...pageProps}>
        <Header />
        <Component {...pageProps} />
      </ClerkProvider>
    </>
  );
}
