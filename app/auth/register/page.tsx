import RegisterForm from "@/components/auth/RegisterForm";

export default function RegisterPage() {
  return (
    <div className="h-full flex flex-col items-center justify-center">
      <div className="container max-md:px-5 md:max-w-5/12">
        <h1 className="text-2xl font-semibold">Register</h1>
        <p className="mt-2 text-sm text-zinc-500">Create your account to save orders and checkout faster.</p>
        <RegisterForm />
      </div>
    </div> 
  );
}
