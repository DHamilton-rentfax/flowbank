
import { AuthForm } from "@/components/auth/auth-form";
import { Logo } from "@/components/icons";
import Link from "next/link";

export default function SignupPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-4">
      <div className="w-full max-w-sm">
        <div className="mb-8 flex justify-center">
          <Link href="/" className="flex items-center gap-2">
            <Logo className="size-8 text-primary" />
            <h1 className="text-2xl font-semibold">FlowBank</h1>
          </Link>
        </div>
        <AuthForm mode="signup" />
         <p className="mt-6 text-center text-sm text-muted-foreground">
          Already have an account?{" "}
          <Link href="/login" className="font-medium text-primary hover:underline">
            Log in
          </Link>
        </p>
      </div>
    </div>
  );
}
