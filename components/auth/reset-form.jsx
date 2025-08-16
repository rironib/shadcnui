"use client";

import Link from "next/link";
import {cn} from "@/lib/utils"
import {Button} from "@/components/ui/button"
import {Card, CardContent, CardDescription, CardHeader, CardTitle,} from "@/components/ui/card"
import {Input} from "@/components/ui/input"
import {Label} from "@/components/ui/label"
import {siteConfig} from "@/config/siteConfig";
import {RiEyeLine, RiEyeOffLine} from "react-icons/ri";
import {useRef, useState} from "react";
import {useRouter, useSearchParams} from "next/navigation";
import toast from "react-hot-toast";
import {useForm} from "react-hook-form";
import Turnstile from "react-turnstile";
import {Loader2Icon} from "lucide-react";

export const ResetForm = ({className, ...props}) => {
    const router = useRouter();
    const params = useSearchParams();
    const token = params.get("token");
    const [showPassword, setShowPassword] = useState(false);
    const [showRePassword, setShowRePassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [captchaToken, setCaptchaToken] = useState("");
    const turnstileRef = useRef();
    const {register, handleSubmit, watch, reset, formState: {errors}} = useForm();
    const password = watch("password", "");

    const onSubmit = async (data) => {
        switch (true) {
            case !token:
                return toast.error("Verification token is required");
            case !captchaToken:
                return toast.error("Captcha verification is required");
            case data.password !== data.rePassword:
                return toast.error("Password did not match");
        }
        setLoading(true);
        try {
            const res = await fetch("/api/reset", {
                method: "POST",
                headers: {"Content-Type": "application/json"},
                body: JSON.stringify({token, newPassword: data.password, captchaToken}),
            });
            const resData = await res.json();
            if (!res.ok) {
                toast.error(resData?.message || "An error occurred while resetting your password. Try again.");
            } else {
                reset();
                toast.success(resData.message || "Your password has been reset successfully");
                setTimeout(() => router.push("/auth/login"), 1500);
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
                    <CardTitle className="text-xl">Reset Password</CardTitle>
                    <CardDescription>
                        Password must be at least 8 characters long and contain at least one uppercase letter, one
                        lowercase letter, one number, and one special character.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleSubmit(onSubmit)}>
                        <div className="grid gap-6">
                            <div className="grid gap-6">
                                <div className="grid gap-3 relative">
                                    <Label htmlFor="password">Password</Label>
                                    <Input placeholder="*********"
                                           type={showPassword ? "text" : "password"} {...register("password", {
                                        required: "Password is required.",
                                        pattern: {
                                            value: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[ !"#$%&'()*+,\-./:;<=>?@[\\\]^_`{|}~])[A-Za-z\d !"#$%&'()*+,\-./:;<=>?@[\\\]^_`{|}~]{8,64}$/,
                                            message: "Password must be 8–64 characters long and include uppercase, lowercase, number, and special character.",
                                        },
                                        minLength: {value: 8, message: "Password must be at least 8 characters long."},
                                        maxLength: {value: 64, message: "Password cannot exceed 64 characters"},
                                    })}/>
                                    <span className="absolute right-3 top-9 cursor-pointer"
                                          onClick={() => setShowPassword(!showPassword)}>
                                        {showPassword ? <RiEyeLine/> : <RiEyeOffLine/>}
                                    </span>
                                    {errors?.password &&
                                        <p className="text-red-500 text-xs">{errors.password.message}</p>}
                                </div>
                                <div className="grid gap-3 relative">
                                    <Label htmlFor="password">Confirm Password</Label>
                                    <Input placeholder="*********"
                                           type={showRePassword ? "text" : "password"} {...register("rePassword", {
                                        required: "Confirm password is required.",
                                        validate: (value) => value === password || "Passwords do not match."
                                    })}/>
                                    <span className="absolute right-3 top-9 cursor-pointer"
                                          onClick={() => setShowRePassword(!showRePassword)}>
                                        {showRePassword ? <RiEyeLine/> : <RiEyeOffLine/>}
                                    </span>
                                    {errors?.rePassword &&
                                        <p className="text-red-500 text-xs">{errors.rePassword.message}</p>}
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
                                    {loading && <Loader2Icon className="animate-spin"/>} Reset Password
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
