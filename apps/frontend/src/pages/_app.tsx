import type { AppProps } from "next/app";
import { ClerkProvider } from "@clerk/nextjs";
import { Lexend, Golos_Text } from "next/font/google";
import "@/styles/globals.css";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import RootLayout from "@/components/RootLayout";

const primaryFont = Golos_Text({ subsets: ["latin"] });
const secondaryFont = Lexend({ subsets: ["latin"] });

export default function App({ Component, pageProps }: AppProps) {
  return (
    <>
      <style jsx global>{`
				:root {
					--font-primary: ${primaryFont.style.fontFamily};
          --font-secondary: ${secondaryFont.style.fontFamily};
				}
			}`}</style>
      <ClerkProvider {...pageProps}>
        <RootLayout>
          <Header />
          <Component {...pageProps} />
          <Footer />
        </RootLayout>
      </ClerkProvider>
    </>
  );
}
