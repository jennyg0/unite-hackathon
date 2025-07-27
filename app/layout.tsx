import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { WalletProvider } from "@/components/WalletProvider";
import { OnboardingProvider } from "@/components/OnboardingProvider";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "DeFi Savings - Smart Financial Freedom",
  description:
    "Build your financial future with DeFi savings that work for you. Learn while you earn with automated deposits and educational content.",
  keywords:
    "DeFi, savings, financial freedom, cryptocurrency, 1inch, blockchain",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <WalletProvider>
          <OnboardingProvider>
            <div className="min-h-screen bg-gray-50">{children}</div>
          </OnboardingProvider>
        </WalletProvider>
      </body>
    </html>
  );
}
