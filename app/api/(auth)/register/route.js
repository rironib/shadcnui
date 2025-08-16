// app/api/register/route.js

import {NextResponse} from "next/server";
import {getDb} from "@/lib/mongodb";
import {sendVerificationEmail} from "@/lib/mailer";
import {hash} from "bcrypt";
import crypto from "node:crypto";

const EMAIL_REGEX = /^[a-z0-9._-]+@[a-z0-9.-]+\.[a-z]{2,}$/;
export const isValidEmail = (email) => {
    return EMAIL_REGEX.test(email);
};

// Username Validation Regex
export const isValidUsername = (username) => {
    return /^[a-z0-9]+$/.test(username);
};

export async function POST(req) {
    try {
        const {name, username, email, password, captchaToken} = await req.json();

        // Check if all required fields are provided
        switch (true) {
            case !captchaToken:
                return NextResponse.json({message: "Captcha token is required"}, {status: 400});
            case !username:
                return NextResponse.json({message: "Username is required"}, {status: 400});
            case !name:
                return NextResponse.json({message: "Name is required"}, {status: 400});
            case !email:
                return NextResponse.json({message: "Email is required"}, {status: 400});
            case !password:
                return NextResponse.json({message: "Password is required"}, {status: 400});
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

        // Check Password & Email Validation
        switch (true) {
            case password.length < 8:
                return NextResponse.json({message: "Password must be at least 8 characters long."}, {status: 400});
            case !/[a-z]/.test(password):
                return NextResponse.json(
                    {message: "Password must contain at least one lowercase letter."},
                    {status: 400}
                );
            case !/[A-Z]/.test(password):
                return NextResponse.json(
                    {message: "Password must contain at least one uppercase letter."},
                    {status: 400}
                );
            case !/[0-9]/.test(password):
                return NextResponse.json(
                    {message: "Password must contain at least one number."},
                    {status: 400}
                );
            case !/[ !"#$%&'()*+,\-./:;<=>?@[\\\]^_`{|}~]/.test(password):
                return NextResponse.json(
                    {message: "Password must contain at least one special character."},
                    {status: 400}
                );
            case !isValidEmail(email):
                return NextResponse.json({message: "Enter a valid email address."}, {status: 400});
            case !isValidUsername(username):
                return NextResponse.json({message: "Username must be lowercase letters and numbers only."}, {status: 400});
        }

        const normalizedEmail = email.trim().toLowerCase();
        const normalizedUsername = username.trim().toLowerCase();

        const db = await getDb();
        const user = await db.collection("users").findOne({
            $or: [
                {email: {$regex: `^${normalizedEmail}$`, $options: "i"}},
                {username: {$regex: `^${normalizedUsername}$`, $options: "i"}},
            ],
        });

        if (user) {
            if (user.email.toLowerCase() === normalizedEmail) {
                return NextResponse.json({message: "This email is already registered."}, {status: 409});
            }
            if (user.username.toLowerCase() === normalizedUsername) {
                return NextResponse.json({message: "Sorry, that username is not available."}, {status: 409});
            }
        }

        // Hash password
        const hashedPassword = await hash(password, 10);
        // Generate a secure email verification token
        const token = crypto.randomBytes(32).toString("hex");
        // Send email verification
        await sendVerificationEmail(email, token);

        // Insert new user
        await db.collection("users").insertOne({
            name,
            username: normalizedUsername,
            email: normalizedEmail,
            password: hashedPassword,
            isAdmin: false,
            role: "user",
            emailVerified: null,
            verifyToken: token,
            createdAt: new Date(),
            updatedAt: new Date(),
        });

        return NextResponse.json(
            {message: "Registration successful. A verification email has been sent to your email."}, {status: 201}
        );
    } catch (e) {
        return NextResponse.json({message: e.message || "Something went wrong! Try again."}, {status: 500});
    }
}