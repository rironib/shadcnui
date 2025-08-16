"use client";

import Link from "next/link";
import {cn} from "@/lib/utils";
import {useRef, useState} from "react";
import {Input} from "@/components/ui/input";
import {Label} from "@/components/ui/label";
import {siteConfig} from "@/config/siteConfig";
import {Button} from "@/components/ui/button";
import {RiEyeLine, RiEyeOffLine} from "react-icons/ri";
import {Card, CardContent, CardDescription, CardHeader, CardTitle,} from "@/components/ui/card";
import Turnstile from "react-turnstile";
import toast from "react-hot-toast";
import {useForm} from "react-hook-form";
import {Loader2Icon} from "lucide-react";

export const SignupForm = ({className, ...props}) => {
    const turnstileRef = useRef();
    const [loading, setLoading] = useState(false);
    const [captchaToken, setCaptchaToken] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [showRePassword, setShowRePassword] = useState(false);
    const {register, handleSubmit, watch, reset, formState: {errors}} = useForm();
    const password = watch("password", "");

    const onSubmit = async (data) => {
        if (!captchaToken) {
            toast.error("Captcha verification is required");
            return;
        }
        if (data.password !== data.rePassword) {
            toast.error("Passwords did not match.");
            return;
        }
        const formData = {
            name: data.name,
            username: data.username,
            email: data.email,
            password: data.password,
            rePassword: data.rePassword,
            captchaToken: captchaToken
        }
        setLoading(true);
        try {
            const res = await fetch("/api/register", {
                method: "POST",
                headers: {"Content-Type": "application/json"},
                body: JSON.stringify(formData),
            });
            const resData = await res.json();
            if (!res.ok) {
                toast.error(resData?.message || "Something went wrong! Try again.")
            } else {
                reset();
                toast.success(resData.message || "Registration successful. Check your email for verification");
            }
        } catch (e) {
            toast.error(e.message || "Something went wrong! Try again.")
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
                    <CardTitle className="text-xl mb-2">Welcome back</CardTitle>
                    <CardDescription>
                        Password must be at least 8 characters long and contain at least one uppercase letter, one
                        lowercase letter, one number, and one special character.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleSubmit(onSubmit)}>
                        <div className="grid gap-6">
                            <div className="grid gap-6">
                                <div className="grid gap-3">
                                    <Label htmlFor="name">Name</Label>
                                    <Input placeholder="eg: John Doe"
                                           type="text" {...register("name", {
                                        required: "Name is required.",
                                        maxLength: {value: 64, message: "Name cannot exceed 64 characters"},
                                    })}/>
                                    {errors?.name && <p className="text-red-500 text-xs">{errors.name.message}</p>}
                                </div>
                                <div className="grid gap-3">
                                    <Label htmlFor="name">Username</Label>
                                    <Input placeholder="johndoe123"
                                           type="text" {...register("username", {
                                        required: "Username is required.",
                                        pattern: {
                                            value: /^[a-z0-9]{6,32}$/,
                                            message: "Username must be lowercase letters and numbers only.",
                                        },
                                        minLength: {value: 6, message: "Username must be at least 6 characters long."},
                                        maxLength: {value: 32, message: "Username cannot exceed 32 characters"},
                                    })}/>
                                    {errors?.username &&
                                        <p className="text-red-500 text-xs">{errors.username.message}</p>}
                                </div>
                                <div className="grid gap-3">
                                    <Label htmlFor="email">Email</Label>
                                    <Input placeholder="eg: email@example.com"
                                           type="email" {...register("email", {
                                        required: "Email is required.",
                                        pattern: {
                                            value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                                            message: "Enter a valid email address.",
                                        },
                                        maxLength: {value: 64, message: "Email cannot exceed 32 characters"},
                                    })}/>
                                    {errors?.email && <p className="text-red-500 text-xs">{errors.email.message}</p>}
                                </div>
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
                                    <Label htmlFor="rePassword">Confirm Password</Label>
                                    <Input placeholder="*********"
                                           type={showRePassword ? "text" : "password"} {...register("rePassword", {
                                        required: "Confirm password is required.",
                                        validate: (value) => value === password || "Passwords do not match.",
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
                                    {loading && <Loader2Icon className="animate-spin"/>} Sign up
                                </Button>
                            </div>
                            <div className="text-center text-sm">
                                Already have an account?{" "}
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
