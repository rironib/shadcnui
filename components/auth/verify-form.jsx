"use client";

import Link from "next/link";
import {cn} from "@/lib/utils";
import {useRef, useState} from "react";
import {siteConfig} from "@/config/siteConfig";
import {Card, CardContent, CardDescription, CardHeader, CardTitle} from "@/components/ui/card";
import {Label} from "@/components/ui/label";
import {Input} from "@/components/ui/input";
import Turnstile from "react-turnstile";
import {Button} from "@/components/ui/button";
import {useForm} from "react-hook-form";
import toast from "react-hot-toast";
import {redirect, useSearchParams} from "next/navigation";
import {Loader2Icon} from "lucide-react";

export const VerifyForm = ({className, ...props}) => {
    const params = useSearchParams();
    const token = params.get("token");
    const [loading, setLoading] = useState(false);
    const [captchaToken, setCaptchaToken] = useState("");
    const turnstileRef = useRef();
    const {register, handleSubmit, reset, formState: {errors}} = useForm();

    const onSubmit = async (data) => {
        if (!captchaToken) {
            toast.error("Captcha verification is required");
            return;
        }
        setLoading(true);
        try {
            const res = await fetch("/api/verify", {
                method: "POST",
                headers: {"Content-Type": "application/json"},
                body: JSON.stringify({token: data.token, captchaToken}),
            });
            const resData = await res.json();
            if (!res.ok) {
                toast.error(resData?.message || "Invalid token! Check your email and try again.");
            } else {
                reset();
                redirect("/auth/login");
                toast.success(resData.message || "Verification successful, try to login.");
            }
        } catch {
            toast.error("Something went wrong! Try again.");
        } finally {
            setLoading(false);
            setCaptchaToken("");
            if (turnstileRef.current) {
                turnstileRef.current.reset();
            }
        }
    };

    return (
        <div className={cn("flex flex-col gap-6", className)} {...props}>
            <Card>
                <CardHeader className="text-center">
                    <CardTitle className="text-xl">User verification</CardTitle>
                    <CardDescription>
                        Please wait while we verify your account. This may take a few seconds.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleSubmit(onSubmit)}>
                        <div className="grid gap-6">
                            <div className="grid gap-6">
                                <div className="grid gap-3">
                                    <Label htmlFor="token">Token</Label>
                                    <Input
                                        defaultValue={token}
                                        placeholder="********************"
                                        type="text" {...register("token", {
                                        required: "Token is required.",
                                    })}/>
                                    {errors?.token && <p className="text-red-500 text-xs">{errors.token.message}</p>}
                                </div>
                                <div className="grid gap-3">
                                    <Label htmlFor="name">Let us know you're human</Label>
                                    <Turnstile
                                        key={captchaToken ? "captcha-token" : "captcha-empty"}
                                        ref={turnstileRef}
                                        sitekey={process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY}
                                        onSuccess={setCaptchaToken}
                                        onExpire={() => setCaptchaToken("")}
                                        size="flexible"
                                        theme="auto"
                                        appearance="always"
                                        className="w-full"
                                    />
                                </div>
                                <Button disabled={loading} type="submit"
                                        className="w-full cursor-pointer">
                                    {loading && <Loader2Icon className="animate-spin"/>} Verify
                                </Button>
                            </div>
                            <div className="text-center text-sm">
                                Remember your password?{" "}
                                <Link href={siteConfig.login.link} className="underline underline-offset-4">
                                    Login
                                </Link>
                            </div>
                        </div>
                    </form>
                </CardContent>
            </Card>
            <div
                className="text-muted-foreground *:[a]:hover:text-primary text-center text-xs text-balance *:[a]:underline *:[a]:underline-offset-4">
                By clicking continue, you agree to our <Link
                href={siteConfig.tos.link}>{siteConfig.tos.title}</Link>{" "}
                and <Link href={siteConfig.privacy.link}>{siteConfig.privacy.title}</Link>.
            </div>
        </div>
    );
}
