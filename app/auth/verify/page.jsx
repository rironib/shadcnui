import {siteConfig} from "@/config/siteConfig";
import {GalleryVerticalEnd} from "lucide-react";
import {VerifyForm} from "@/components/auth/verify-form";
import {Suspense} from "react";
import Loading from "@/components/Loading";

export const generateMetadata = async () => {
    const {verify: metadata} = siteConfig;
    const {title, description, link, keywords, robots} = metadata;
    return {
        title: title || siteConfig.title,
        description: description || siteConfig.description,
        keywords: keywords || siteConfig.keywords,
        robots: robots || siteConfig.robots,
        alternates: {
            canonical: siteConfig.baseUrl + link
        },
    }
};

const VerifyPage = () => {
    return (
        <div
            className="bg-muted flex min-h-svh flex-col items-center justify-center gap-6 p-6 md:p-10">
            <div className="flex w-full max-w-sm flex-col gap-6">
                <a href="#" className="flex items-center gap-2 self-center font-medium">
                    <div
                        className="bg-primary text-primary-foreground flex size-6 items-center justify-center rounded-md">
                        <GalleryVerticalEnd className="size-4"/>
                    </div>
                    Acme Inc.
                </a>
                <Suspense fallback={<Loading/>}>
                    <VerifyForm/>
                </Suspense>
            </div>
        </div>
    );
}

export default VerifyPage;