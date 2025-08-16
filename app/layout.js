import "./globals.css";
import {Toaster} from "react-hot-toast";
import {siteConfig} from "@/config/siteConfig";
import GoogleAnalytics from "@/hooks/GoogleAnalytics";
import {ThemeProvider} from "@/components/theme-provider";
import AuthProvider from "@/hooks/AuthProvider";

export const generateMetadata = async () => {
    return {
        title: siteConfig.title,
        description: siteConfig.description,
        keywords: siteConfig.keywords,
        robots: siteConfig.robots,
        alternates: {
            canonical: siteConfig.baseUrl
        },
    }
};

export default function RootLayout({children}) {
    return (
        <>
            <html lang="en" suppressHydrationWarning>
            <head>
                <GoogleAnalytics/>
            </head>
            <body>
            <Toaster position="top-center" toastOptions={{ duration: 5000 }} />
            <ThemeProvider
                attribute="class"
                defaultTheme="system"
                enableSystem
                disableTransitionOnChange
            >
                <AuthProvider>{children}</AuthProvider>
            </ThemeProvider>
            </body>
            </html>
        </>
    );
}
