import type { AppProps } from "next/app";
import { ClerkProvider } from "@clerk/nextjs";
import { Inter } from "next/font/google";
import Header from "@/components/Header";
import "@/styles/globals.css";

const inter = Inter({ subsets: ["latin"] });

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
