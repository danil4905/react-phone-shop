import LoginForm from "@/components/auth/LoginForm";

export default function LoginPage() {
  return (
    <div className="h-full flex flex-col items-center justify-center">
      <div className="container max-md:px-5 md:max-w-4/12">
        <h1 className="text-2xl font-semibold">Login</h1>
        <p className="mt-2 text-sm text-zinc-500">Login to the system.</p>
        <LoginForm />
      </div>
    </div> 
  );
}
