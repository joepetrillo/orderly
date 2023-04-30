import type { AppProps } from "next/app";
import type { NextPage } from "next";
import type { ReactElement, ReactNode } from "react";
import { ClerkProvider } from "@clerk/nextjs";
import { Lexend, Golos_Text } from "next/font/google";
import "@/styles/globals.css";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import RootLayout from "@/components/RootLayout";
import { Toaster } from "react-hot-toast";

const primaryFont = Golos_Text({ subsets: ["latin"] });
const secondaryFont = Lexend({ subsets: ["latin"] });

export type NextPageWithLayout<P = {}, IP = P> = NextPage<P, IP> & {
  getLayout?: (page: ReactElement) => ReactNode;
};

type AppPropsWithLayout = AppProps & {
  Component: NextPageWithLayout;
};

export default function App({ Component, pageProps }: AppPropsWithLayout) {
  const getLayout = Component.getLayout ?? ((page) => page);

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
          {getLayout(<Component {...pageProps} />)}
          <Footer />
        </RootLayout>
        <Toaster />
      </ClerkProvider>
    </>
  );
}
