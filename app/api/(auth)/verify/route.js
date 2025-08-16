// FILE: src/app/api/verify/route.js

import {NextResponse} from "next/server";
import {getDb} from "@/lib/mongodb";

export async function POST(req) {
    try {
        const {token, captchaToken} = await req.json();
        switch (true) {
            case !captchaToken:
                return NextResponse.json({message: "Captcha verification is required."}, {status: 400});
            case !token:
                return NextResponse.json({message: "Verification token is required."}, {status: 400});
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
            return NextResponse.json({message: "Captcha verification service is unavailable."}, {status: 503});
        }
        const captchaData = await captchaRes.json();
        if (!captchaData.success) {
            return NextResponse.json({message: "Captcha verification was unsuccessful. Please refresh the page and try again."}, {status: 403});
        }

        const db = await getDb();
        const user = await db.collection("users").findOne({verifyToken: token});
        if (!user) {
            return NextResponse.json({message: "Invalid verification token."}, {status: 400});
        }
        if (user?.emailVerified) {
            return NextResponse.json({message: "Email is already verified."}, {status: 200});
        }
        await db.collection("users").updateOne(
            {_id: user._id},
            {
                $set: {emailVerified: new Date()},
                $unset: {verifyToken: ""},
            },
        );
        return NextResponse.json({
            message: "Your verification has been successful. Try to login your account.",
        }, {status: 201});
    } catch (e) {
        return NextResponse.json({message: e.message || "Something went wrong! Try again."}, {status: 500});
    }
}
