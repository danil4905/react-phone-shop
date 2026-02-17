import RegisterForm from "@/components/auth/RegisterForm";

export default function RegisterPage() {
  return (
    <main className="mx-auto w-full max-w-md px-6 py-10">
      <h1 className="text-2xl font-semibold">Register</h1>
      <p className="mt-2 text-sm text-zinc-500">Create your account to save orders and checkout faster.</p>
      <RegisterForm />
    </main>
  );
}
