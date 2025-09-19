import type { Metadata } from "next";
import { Poppins, Space_Grotesk, Quicksand  } from "next/font/google";
import "./globals.css";


const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  variable: "--font-space-grotesk",
});

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"], // adjust as needed
  variable: "--font-poppins",
});

const quicksand = Quicksand({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"], // adjust as needed
  variable: "--font-quicksand",
});

export const metadata: Metadata = {
  title: "Nexa - Web3 Investment Platform",
  description: "Empowering real-world businesses with Web3 investments. Tokenized opportunities starting from $1,000.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${spaceGrotesk.variable} ${poppins.variable} ${quicksand.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
