const homeURL = process.env.NEXT_PUBLIC_BASE_URL;
const siteName = process.env.NEXT_PUBLIC_SITENAME;

export const siteConfig = {
    name: siteName,
    title: siteName,
    description:
        "Boilerplate for Next.js 13, NextAuth, ShadcnUI, Tailwind CSS, React Hook Form, React Icons, and more.",
    keywords:
        "nextauth, shadcnui, react, next, react-hook-form, react-icons, tailwindcss",
    baseUrl: homeURL,
    author: "rironib",
    robots: "index, follow",
    icon: homeURL + "/favicon.ico",
    fallback: homeURL + "/images/error.png",
    links: {
        facebook: "https://web.facebook.com/rironib",
        twitter: "#",
        youtube: "#",
        telegram: "https://t.me/rironib",
    },
    // Home
    home: {
        title: siteName,
        description:
            "Boilerplate for Next.js 13, NextAuth, ShadcnUI, Tailwind CSS, React Hook Form, React Icons, and more.",
        keywords:
            "nextauth, shadcnui, react, next, react-hook-form, react-icons, tailwindcss"
    },
    // Login
    login: {
        title: "Login",
        description: "Login to your account to continue.",
        link: "/auth/login"
    },
    // Register
    register: {
        title: "Sign up",
        description: "Create an account to continue.",
        link: "/auth/register"
    },
    // Forgot Password
    forgot: {
        title: "Forgot Password",
        description: "Forgot your password? No problem. Just let us know your email address and we will email you a link to reset your password.",
        link: "/auth/forgot"
    },
    // Reset Password
    reset: {
        title: "Reset Password",
        description: "Reset your password to continue.",
        link: "/auth/reset"
    },
    // Verify Email
    verify: {
        title: "User verification",
        description: "Verify yourself address to continue.",
        link: "/auth/verify"
    },
    // Terms of Service
    tos: {
        title: "Terms of Service",
        description: "By using our service, you agree to our terms and conditions. Please read them carefully.",
        link: "/tos"
    },
    // Privacy Policy
    privacy: {
        title: "Privacy Policy",
        description: "Your privacy is important to us. This policy explains how we collect, use, and protect your information.",
        link: "/privacy"
    },
    // Admin
    admin: {
        title: "Admin Panel",
        description: "Access the admin panel to manage the site.",
        link: "/admin"
    },
    // Dashboard
    dashboard: {
        title: "Dashboard",
        description: "Your personal dashboard to manage your account and settings.",
        link: "/dashboard"
    },
};
