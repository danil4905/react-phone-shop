"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { AuthCredentialsSchema, type AuthCredentials, type UserPublic } from "@repo/shared";
import { ROUTES } from "@/config/routes";
import { useAuthStore } from "@/store/auth";
import Button from "../ui/Button";

type LoginSuccessResponse = {
  user: UserPublic;
  csrfToken?: string | null;
};

type ApiIssue = {
  path?: Array<string | number>;
  message?: string;
};

type LoginErrorResponse = {
  message?: string;
  issues?: ApiIssue[];
};

const INPUT_CLASSNAME =
  "mt-1 w-full rounded-xl border border-zinc-200 bg-white px-3 py-2 text-sm outline-none transition focus:border-zinc-400 focus:ring-2 focus:ring-zinc-200";

export default function LoginForm() {
  const router = useRouter();
  const setUser = useAuthStore((s) => s.setUser);
  const setCsrfToken = useAuthStore((s) => s.setCsrfToken);

  const {
    register,
    handleSubmit,
    setError,
    clearErrors,
    formState: { errors, isSubmitting },
  } = useForm<AuthCredentials>({
    resolver: zodResolver(AuthCredentialsSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const onSubmit = async (values: AuthCredentials) => {
    clearErrors("root");

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        credentials: "include",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(values),
      });

      const data = (await res.json().catch(() => null)) as
        | LoginSuccessResponse
        | LoginErrorResponse
        | null;

      if (!res.ok) {
        if (res.status === 401) {
          setError("root.serverError", {
            type: "server",
            message: "Invalid email or password",
          });
          return;
        }

        if (data && "issues" in data && Array.isArray(data.issues)) {
          let hasFieldError = false;
          for (const issue of data.issues) {
            const field = issue.path?.[0];
            const message = issue.message ?? "Invalid value";

            if (field === "email" || field === "password") {
              hasFieldError = true;
              setError(field, { type: "server", message });
            }
          }

          if (hasFieldError) {
            return;
          }
        }

        setError("root.serverError", {
          type: "server",
          message: data && "message" in data && data.message ? data.message : "Unable to login. Try again.",
        });
        return;
      }

      if (!data || !("user" in data) || !data.user) {
        setError("root.serverError", {
          type: "server",
          message: "Unexpected server response",
        });
        return;
      }

      setUser(data.user);
      setCsrfToken(data.csrfToken ?? null);
      router.push(ROUTES.home);
      router.refresh();
    } catch {
      setError("root.serverError", {
        type: "network",
        message: "Network error. Please try again.",
      });
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="mt-6 space-y-4" noValidate>
      <div>
        <label htmlFor="email" className="text-sm text-zinc-700">
          Email
        </label>
        <input
          id="email"
          type="email"
          autoComplete="email"
          className={INPUT_CLASSNAME}
          aria-invalid={Boolean(errors.email)}
          {...register("email")}
        />
        {errors.email && <p className="mt-1 text-xs text-red-600">{errors.email.message}</p>}
      </div>

      <div>
        <label htmlFor="password" className="text-sm text-zinc-700">
          Password
        </label>
        <input
          id="password"
          type="password"
          autoComplete="current-password"
          className={INPUT_CLASSNAME}
          aria-invalid={Boolean(errors.password)}
          {...register("password")}
        />
        {errors.password && <p className="mt-1 text-xs text-red-600">{errors.password.message}</p>}
      </div>

      {errors.root?.serverError?.message && (
        <p className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-600">
          {errors.root.serverError.message}
        </p>
      )}

      <Button
        type="submit"
        disabled={isSubmitting}
        className="w-full rounded-xl bg-zinc-900 px-4 py-2 text-sm font-medium text-white transition hover:bg-zinc-700 cursor-pointer disabled:cursor-not-allowed disabled:opacity-60"
      >
        {isSubmitting ? "Signing in..." : "Login"}
      </Button>

      <p className="text-center text-sm text-zinc-500">
        No account yet?{" "}
        <Link href={ROUTES.auth.register} className="text-zinc-900 underline underline-offset-4">
          Register
        </Link>
      </p>
    </form>
  );
}
