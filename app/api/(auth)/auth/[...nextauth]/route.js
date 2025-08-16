import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import GoogleProvider from "next-auth/providers/google";
import {MongoDBAdapter} from "@auth/mongodb-adapter";
import clientPromise, {getDb} from "@/lib/mongodb";
import {compare} from "bcrypt";
import {ObjectId} from "mongodb";

const dbName = process.env.DB_NAME;

const authOptions = {
    adapter: MongoDBAdapter(clientPromise, {databaseName: dbName}),
    secret: process.env.NEXTAUTH_SECRET,
    providers: [CredentialsProvider({
        name: "Credentials", credentials: {
            email: {label: "Email or Username", type: "text"},
            password: {label: "Password", type: "password"},
            captchaToken: {label: "Captcha Token", type: "text"},
        }, async authorize(credentials) {
            if (!credentials?.email || !credentials?.password || !credentials?.captchaToken) {
                throw new Error("All fields are required.");
            }

            // Captcha verification
            const captchaRes = await fetch("https://challenges.cloudflare.com/turnstile/v0/siteverify", {
                method: "POST",
                headers: {"Content-Type": "application/x-www-form-urlencoded"},
                body: new URLSearchParams({
                    secret: process.env.TURNSTILE_SECRET_KEY, response: credentials.captchaToken,
                }),
            });
            if (!captchaRes.ok) {
                throw new Error("Captcha verification request failed.");
            }

            const captchaData = await captchaRes.json();
            if (!captchaData.success) {
                throw new Error("Captcha verification was unsuccessful. Please try again.");
            }

            // Find user by email or username
            const input = credentials.email.trim().toLowerCase();
            const db = await getDb();
            const user = await db.collection("users").findOne({
                $or: [{email: input}, {username: input}],
            });

            if (!user || !user.password) {
                throw new Error("Invalid email/username or password.");
            }

            // Compare password
            const isValid = await compare(credentials.password, user.password);
            if (!isValid) {
                throw new Error("Invalid email/username or password.");
            }

            // Require verified email
            if (!user.emailVerified) {
                throw new Error("Please verify your email address before logging in.");
            }

            return {id: user._id.toString(), email: user.email};
        },
    }), GoogleProvider({
        clientId: process.env.GOOGLE_ID,
        clientSecret: process.env.GOOGLE_SECRET,
        profile(profile) {
            return {
                id: profile.sub,
                name: profile.name,
                email: profile.email,
                image: profile.picture,
                isAdmin: false,
                createdAt: new Date(),
                updatedAt: new Date()
            };
        },
    })],
    session: {strategy: "jwt"},
    callbacks: {
        // Runs on initial sign-in + every token refresh
        async jwt({token, user}) {
            const db = await getDb();

            // On first login, merge DB user data into token
            if (user) {
                let dbUser = null;

                // Try to fetch by ObjectId if valid
                if (user.id && ObjectId.isValid(user.id)) {
                    dbUser = await db.collection("users").findOne({_id: new ObjectId(user.id)});
                }

                // // For OAuth (Google) users who might not be in DB yet
                // if (!dbUser && user.email) {
                //     dbUser = await db.collection("users").findOne({email: user.email});
                // }
                //
                // // If still no DB user (e.g., new Google login), create one
                // if (!dbUser) {
                //     const result = await db.collection("users").insertOne({
                //         email: user.email,
                //         name: user.name || "",
                //         username: "",
                //         isAdmin: false,
                //         emailVerified: user.emailVerified || false,
                //         createdAt: new Date(),
                //     });
                //     dbUser = await db.collection("users").findOne({_id: result.insertedId});
                // }

                // Store data in token
                token.id = dbUser._id.toString();
                token.email = dbUser.email;
                token.isAdmin = dbUser.isAdmin || false;
                token.name = dbUser.name || "";
                token.username = dbUser.username || "";
                token.emailVerified = dbUser.emailVerified || false;
            }
            // Optional: Enforce email verification every session
            // if (!token.emailVerified) {
            //     throw new Error("Please verify your email address before logging in.");
            // }
            return token;
        },

        // Sends token data to the client session
        async session({session, token}) {
            session.user = {
                id: token.id,
                email: token.email,
                name: token.name,
                username: token.username,
                isAdmin: token.isAdmin,
                emailVerified: token.emailVerified,
            };
            return session;
        },
    },
    pages: {
        signIn: "/auth/login", error: "/auth/login",
    },
};

const handler = NextAuth(authOptions);
export {handler as GET, handler as POST};
