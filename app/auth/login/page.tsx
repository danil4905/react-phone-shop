import LoginForm from "@/components/auth/LoginForm";

export default function LoginPage() {
  return (
    <main className="mx-auto w-full max-w-md px-6 py-10">
      <h1 className="text-2xl font-semibold">Login</h1>
      <p className="mt-2 text-sm text-zinc-500">Sign in to access your profile and orders.</p>
      <LoginForm />
    </main>
  );
}
