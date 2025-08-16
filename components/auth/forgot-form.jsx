"use client";

import Link from "next/link";
import {cn} from "@/lib/utils";
import toast from "react-hot-toast";
import {useRef, useState} from "react";
import {useForm} from "react-hook-form";
import Turnstile from "react-turnstile";
import {Input} from "@/components/ui/input";
import {Label} from "@/components/ui/label";
import {Button} from "@/components/ui/button";
import {siteConfig} from "@/config/siteConfig";
import {Card, CardContent, CardDescription, CardHeader, CardTitle,} from "@/components/ui/card";
import {Loader2Icon} from "lucide-react";

export const ForgotForm = ({className, ...props}) => {
    const {register, handleSubmit, reset, formState: {errors}} = useForm();
    const [loading, setLoading] = useState(false);
    const [captchaToken, setCaptchaToken] = useState("");
    const turnstileRef = useRef();

    const onSubmit = async (data) => {
        if (!captchaToken) {
            toast.error("Captcha verification is required");
            return;
        }
        setLoading(true);
        try {
            const res = await fetch("/api/forgot", {
                method: "POST",
                headers: {"Content-Type": "application/json"},
                body: JSON.stringify({email: data.email, captchaToken}),
            });
            const resData = await res.json();
            if (!res.ok) {
                setCaptchaToken("");
                if (turnstileRef.current) {
                    turnstileRef.current.reset();
                }
                return toast.error(resData?.message || "An error occurred while resetting your password");
            } else {
                reset();
                toast.success(resData.message || "Check your email for reset link");
            }
        } catch {
            toast.error("Something went wrong! Try again.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className={cn("flex flex-col gap-6", className)} {...props}>
            <Card>
                <CardHeader className="text-center">
                    <CardTitle className="text-xl">Forgot Password</CardTitle>
                    <CardDescription>
                        You will receive an email with a link to reset your password
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleSubmit(onSubmit)}>
                        <div className="grid gap-6">
                            <div className="grid gap-6">
                                <div className="grid gap-3">
                                    <Label htmlFor="email">Email</Label>
                                    <Input placeholder="eg: email@example.com"
                                           type="email" {...register("email", {
                                        required: "Email is required.",
                                        pattern: {
                                            value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                                            message: "Enter a valid email address.",
                                        },
                                    })}/>
                                    {errors?.email && <p className="text-red-500 text-xs">{errors.email.message}</p>}
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
                                <Button disabled={loading} type="submit" className="w-full cursor-pointer">
                                    {loading && <Loader2Icon className="animate-spin"/>} Request reset link
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
