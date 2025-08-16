// src/app/api/forgot/route.js

import {NextResponse} from "next/server";
import {getDb} from "@/lib/mongodb";
import {sendPasswordResetEmail} from "@/lib/mailer";
import crypto from "node:crypto";

const EMAIL_REGEX = /^[a-z0-9._-]+@[a-z0-9.-]+\.[a-z]{2,}$/;
const RESET_TOKEN_EXPIRY_MS = 24 * 60 * 60 * 1000; // 24 hours
const RESET_REQUEST_COOLDOWN_MS = 24 * 60 * 60 * 1000; // 24 hours

// Email validation regex
export const isValidEmail = (email) => {
    return EMAIL_REGEX.test(email);
};

export async function POST(req) {
    try {
        const {email, captchaToken} = await req.json();
        switch (true) {
            case !captchaToken:
                return NextResponse.json({message: "Captcha token is required"}, {status: 400});
            case !email:
                return NextResponse.json({message: "Email is required"}, {status: 400});
            case !isValidEmail(email):
                return NextResponse.json({message: "Enter a valid email address."}, {status: 400});
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
            return NextResponse.json({message: "Captcha verification was unsuccessful. Please refresh the page and try again."}, {status: 403});
        }

        const db = await getDb();
        const users = db.collection("users");
        const normalizedEmail = email.trim().toLowerCase();

        // Check if a User exists with the provided email
        const user = await users.findOne({email: normalizedEmail});

        if (!user) {
            return NextResponse.json({message: "If the email is registered, you will receive a password reset link."}, {status: 200});
        }
        if (!user.emailVerified) {
            return NextResponse.json({message: "Your account is not verified."}, {status: 403});
        }

        const lastSent = user.resetLastSent ? new Date(user.resetLastSent) : null;
        const now = new Date();

        // 30-day cooldown on reset requests
        if (lastSent && now - lastSent < RESET_REQUEST_COOLDOWN_MS) {
            const remaining = RESET_REQUEST_COOLDOWN_MS - (now - lastSent);
            const hours = Math.floor(remaining / (60 * 60 * 1000));
            const minutes = Math.floor((remaining % (60 * 60 * 1000)) / (60 * 1000));
            return NextResponse.json(
                {message: `Please wait ${hours} hour(s) and ${minutes} minute(s) before requesting again.`},
                {status: 429}
            );
        }

        // Generate reset token and expiry (24 hours from now)
        const resetToken = crypto.randomBytes(32).toString("hex");
        const resetTokenExpiry = new Date(now.getTime() + RESET_TOKEN_EXPIRY_MS);

        // Send reset email
        await sendPasswordResetEmail(normalizedEmail, resetToken);

        // Update user with new token and timestamp
        await users.updateOne(
            {_id: user._id},
            {$set: {resetToken, resetTokenExpiry, resetLastSent: now}}
        );

        return NextResponse.json({
            message: "Password reset email has been sent to your mail address.",
        }, {status: 201});
    } catch (e) {
        return NextResponse.json({message: e.message || "Something went wrong! Try again."}, {status: 500});
    }
}