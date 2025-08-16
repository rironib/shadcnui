"use client";

import Link from "next/link";
import {cn} from "@/lib/utils";
import {Button} from "@/components/ui/button";
import {Card, CardContent, CardDescription, CardHeader, CardTitle} from "@/components/ui/card";
import {Input} from "@/components/ui/input";
import {Label} from "@/components/ui/label";
import {siteConfig} from "@/config/siteConfig";
import {RiEyeLine, RiEyeOffLine, RiGoogleFill} from "react-icons/ri";
import {useEffect, useRef, useState} from "react";
import {useRouter, useSearchParams} from "next/navigation";
import toast from "react-hot-toast";
import {signIn} from "next-auth/react";
import {useForm} from "react-hook-form";
import Turnstile from "react-turnstile";

export const LoginForm = ({className, ...props}) => {
    const [showPassword, setShowPassword] = useState(false);
    const {register, handleSubmit, reset, formState: {errors}} = useForm();
    const searchParams = useSearchParams();
    const authError = searchParams.get("error");
    const [loading, setLoading] = useState(false);
    const router = useRouter();
    const [captchaToken, setCaptchaToken] = useState("");
    const turnstileRef = useRef();

    useEffect(() => {
        switch (authError) {
            case "CredentialsSignin":
                toast.error("Invalid email or password.",);
                break;
            case "OAuthAccountNotLinked":
                toast.error("This email is already registered using another method. Please login using email and password.");
                break;
            case "OAuthSignin":
                toast.error("Google sign-in failed. Please try again.");
                break;
            case "OAuthCallback":
                toast.error("OAuth callback failed. Try again.");
                break;
            case "OAuthCreateAccount":
                toast.error("Could not create account. Please try again.");
                break;
            case "EmailSignin":
                toast.error("Sign-in link could not be sent. Please try again.");
                break;
            case "Verification":
                toast.error("Invalid or expired verification link.");
                break;
            case "AccessDenied":
                toast.error("Access denied. Contact support");
                break;
            case "Configuration":
                toast.error("Server misconfiguration. Contact admin");
                break;
            case "Default":
            default:
                if (authError)
                    toast.error("An unexpected error occurred. Please try again.");
                break;
        }
    }, [authError]);

    const handleGoogleLogin = () => signIn("google", {callbackUrl: "/dashboard"});

    const onSubmit = async (data) => {
        if (!captchaToken) {
            toast.error("Captcha verification is required");
            return;
        }
        setLoading(true);
        try {
            const res = await signIn("credentials", {
                redirect: false,
                email: data.email,
                password: data.password,
                captchaToken,
            });
            if (!res.ok) {
                switch (res?.error) {
                    case "CredentialsSignin":
                        return toast.error("Invalid email or password.");
                    case "EmailNotVerified":
                        return toast.error("Please verify your email before logging in.");
                    case "UserNotFound":
                        return toast.error("No account found with this email or username.");
                    case "ServerError":
                        return toast.error("Internal server error. Please try again later.");
                    default:
                        return toast.error(
                            res.error || "Something went wrong! Try again.");
                }
            } else {
                reset();
                router.push("/dashboard");
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
                    <CardTitle className="text-xl">Welcome back</CardTitle>
                    <CardDescription>
                        Login with your Apple or Google account
                    </CardDescription>
                </CardHeader>
                <CardContent>

                    <div className="grid gap-6">
                        <div className="flex flex-col gap-4">
                            <Button
                                variant="outline"
                                className="w-full cursor-pointer"
                                onClick={handleGoogleLogin}
                            >
                                <RiGoogleFill/>
                                Login with Google
                            </Button>
                        </div>
                        <div
                            className="after:border-border relative text-center text-sm after:absolute after:inset-0 after:top-1/2 after:z-0 after:flex after:items-center after:border-t">
                <span className="bg-card text-muted-foreground relative z-10 px-2">
                  Or continue with
                </span>
                        </div>
                        <form onSubmit={handleSubmit(onSubmit)}>
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
                                <div className="grid gap-3 relative">
                                    <div className="flex items-center">
                                        <Label htmlFor="password">Password</Label>
                                        <Link href={siteConfig.forgot.link}
                                              className="ml-auto text-sm underline-offset-4 hover:underline">
                                            Forgot your password?
                                        </Link>
                                    </div>
                                    <Input placeholder="*********"
                                           type={showPassword ? "text" : "password"} {...register("password", {
                                        required: "Password is required."
                                    })}/>
                                    <span className="absolute right-3 top-10.5 cursor-pointer"
                                          onClick={() => setShowPassword(!showPassword)}>
                                        {showPassword ? <RiEyeLine/> : <RiEyeOffLine/>}
                                    </span>
                                    {errors?.password &&
                                        <p className="text-red-500 text-xs">{errors.password.message}</p>}
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
                                    {loading ? "Login..." : "Login"}
                                </Button>
                            </div>
                        </form>
                        <div className="text-center text-sm">
                            Don&apos;t have an account?{" "}
                            <Link href={siteConfig.signup.link} className="underline underline-offset-4">
                                Sign up
                            </Link>
                        </div>
                    </div>
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
