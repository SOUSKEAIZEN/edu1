"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import Link from "next/link";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // API Call
    setSubmitted(true);
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1 text-center">
          <CardTitle className="text-2xl font-semibold tracking-tight">Reset password</CardTitle>
          <CardDescription>
            {submitted ? "Check your email for a reset link" : "Enter your email address and we will send you a password reset link"}
          </CardDescription>
        </CardHeader>
        {!submitted ? (
          <form onSubmit={handleSubmit}>
            <CardContent className="grid gap-4">
              <div className="grid gap-2">
                <Label htmlFor="email">Email</Label>
                <Input id="email" type="email" placeholder="m@example.com" value={email} onChange={(e) => setEmail(e.target.value)} required />
              </div>
            </CardContent>
            <CardFooter className="flex flex-col gap-4">
              <Button className="w-full" type="submit">Send Reset Link</Button>
              <div className="text-center text-sm">
                <Link href="/login" className="text-primary hover:underline">Back to login</Link>
              </div>
            </CardFooter>
          </form>
        ) : (
          <CardFooter>
             <Link href="/login" className="w-full">
               <Button variant="outline" className="w-full">Return to login</Button>
             </Link>
          </CardFooter>
        )}
      </Card>
    </div>
  );
}
