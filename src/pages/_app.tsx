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
    <header className="flex justify-between p-8">
      <h1>Office Hours</h1>
      <SignedIn>
        <UserButton
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
