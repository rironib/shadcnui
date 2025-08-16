// FILE: src/app/api/reset/route.js

import {NextResponse} from "next/server";
import {getDb} from "@/lib/mongodb";
import {hash} from "bcrypt";

// Password strength checker
function isStrongPassword(password) {
    return /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).{8,}$/.test(password);
}

export async function POST(req) {
    try {
        const {token, newPassword, captchaToken} = await req.json();
        switch (true) {
            case !captchaToken:
                return NextResponse.json({message: "Captcha verification is required."}, {status: 400});
            case !token:
                return NextResponse.json({message: "Verification token is required."}, {status: 400});
            case !newPassword:
                return NextResponse.json({message: "New password is required."}, {status: 400});
            case !isStrongPassword(newPassword):
                return NextResponse.json({message: "Password must include at least one lowercase letter, one uppercase letter, one number, and one special character."}, {status: 400})
        }

        // 🔐 Verify Cloudflare Turnstile token
        const captchaRes = await fetch(
            "https://challenges.cloudflare.com/turnstile/v0/siteverify",
            {
                method: "POST",
                headers: {"Content-Type": "application/x-www-form-urlencoded"},
                body: new URLSearchParams({
                    secret: process.env.TURNSTILE_SECRET_KEY,
                    response: captchaToken,
                }),
            },
        );
        if (!captchaRes.ok) {
            return NextResponse.json(
                {message: "Captcha verification service is unavailable."},
                {status: 503}
            );
        }
        const captchaData = await captchaRes.json();
        if (!captchaData.success) {
            return NextResponse.json(
                {
                    message:
                        "Captcha verification was unsuccessful. Please refresh the page and try again.",
                },
                {status: 403},
            );
        }

        const db = await getDb();
        const user = await db.collection("users").findOne({resetToken: token});
        switch (true) {
            case !user:
                return NextResponse.json({message: "The provided token is invalid."}, {status: 400});
            case !user.resetTokenExpiry:
                return NextResponse.json({message: "The provided token is invalid."}, {status: 400});
            case new Date(user.resetTokenExpiry) < new Date():
                return NextResponse.json({message: "The provided token has been expired."}, {status: 400});
        }

        const hashedPassword = await hash(newPassword, 10);

        // Update user with new password and reset token
        await db.collection("users").updateOne(
            {_id: user._id},
            {$set: {password: hashedPassword}, $unset: {resetToken: "", resetTokenExpiry: ""}},
        );

        return NextResponse.json({
            message: "Your password has been reset successfully.",
        }, {status: 201});
    } catch (e) {
        return NextResponse.json({message: e.message || "Something went wrong! Try again."}, {status: 500});
    }
}
