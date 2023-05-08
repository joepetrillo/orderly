import { ClerkProvider } from "@clerk/nextjs";
import type { NextPage } from "next";
import type { AppProps } from "next/app";
import { Lexend, Golos_Text } from "next/font/google";
import type { ReactElement, ReactNode } from "react";
import { Toaster } from "react-hot-toast";
import Footer from "@/components/Footer";
import Header from "@/components/Header";
import RootLayout from "@/components/RootLayout";
import "@/styles/globals.css";

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
