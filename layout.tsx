import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
    title: "PrintMitar",
    description: "Campus Print on Demand",
};

export default function RootLayout({
                                       children,
                                   }: {
    children: React.ReactNode;
}) {
    return (
        <html lang="en">
        <body>{children}</body>
        </html>
    );
}