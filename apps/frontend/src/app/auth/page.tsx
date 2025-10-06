// app/auth/page.tsx
"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { signup, login } from "@/services/api/auth";
import { useRouter } from "next/navigation";

async function handleAuth(isSignUp: boolean, data: { username: string; password: string; type?: string }): Promise<boolean> {
    data.type = data.type ?? 'user';
    if (isSignUp) {
        const signupRes = await signup(data);
        if (signupRes.success) {
            const loginRes = await login(data);
            if (loginRes.success) {
                return loginRes.success;
            }
            return loginRes.success;
        }
        alert("Unable to SignUp")
        return signupRes.success
    } else {
        const loginRes = await login(data);
        console.log(loginRes)
        if (loginRes.success) {

            return loginRes.success
        }
        alert("Unable to SignIn")
        return loginRes.success

    }
}
export default function AuthPage() {
    const [isSignup, setIsSignup] = useState(false);
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');

    const router = useRouter()


    const handleSubmit = async () => {
        const res = await handleAuth(isSignup, { username, password });
        // if (res) {
        //     router.push("/")
        // }
    };

    return (
        <main className="flex min-h-screen items-center justify-center">
            <Card className="w-[350px]">
                <CardHeader>
                    <CardTitle>{isSignup ? "Sign Up" : "Sign In"}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <Input
                        placeholder="Username"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                    />
                    <Input
                        placeholder="Password"
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                    />
                    <Button className="w-full" onClick={handleSubmit}>
                        {isSignup ? "Create Account" : "Login"}
                    </Button>
                    <Button
                        variant="ghost"
                        className="w-full"
                        onClick={() => {
                            setIsSignup(!isSignup)
                        }}
                    >
                        {isSignup
                            ? "Already have an account? Sign In"
                            : "Don’t have an account? Sign Up"}
                    </Button>
                </CardContent>
            </Card>
        </main>
    );
}