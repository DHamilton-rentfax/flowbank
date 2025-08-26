
import LoginButton from "@/app/components/LoginButton";
import Link from "next/link";

export default function LoginPage({
  searchParams,
}: { searchParams?: { next?: string } }) {
  const next = searchParams?.next ?? "/dashboard";

  return (
    <div className="mx-auto flex min-h-[60vh] max-w-md flex-col justify-center px-6 py-16">
       <h1 className="text-2xl font-semibold">Welcome</h1>
      <p className="mt-2 text-sm text-gray-600">Sign in to continue to your dashboard.</p>
      <div className="mt-6">
        <LoginButton returnUrl={next} className="w-full rounded-xl border px-4 py-2.5 text-sm font-medium hover:bg-gray-50 disabled:opacity-60" />
      </div>
       <p className="mt-4 text-center text-sm text-gray-600">
        This is a demo. Use the Google login button.
      </p>
    </div>
  );
}
