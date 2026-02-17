"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { RegisterSchema, type RegisterInput, type UserPublic } from "@repo/shared";
import { ROUTES } from "@/config/routes";
import { useAuthStore } from "@/store/auth";
import Button from "../ui/Button";

const RegisterFormSchema = RegisterSchema.extend({
  confirmPassword: RegisterSchema.shape.password,
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords do not match",
  path: ["confirmPassword"],
});

type RegisterFormValues = RegisterInput & {
  confirmPassword: string;
};

type RegisterSuccessResponse = {
  user: UserPublic;
  csrfToken?: string | null;
};

type ApiIssue = {
  path?: Array<string | number>;
  message?: string;
};

type RegisterErrorResponse = {
  message?: string;
  issues?: ApiIssue[];
};

export const INPUT_CLASSNAME =
  "mt-1 w-full rounded-xl border border-zinc-200 bg-white px-3 py-2 text-sm outline-none transition focus:border-zinc-400 focus:ring-2 focus:ring-zinc-200";

export default function RegisterForm() {
  const router = useRouter();
  const setUser = useAuthStore((s) => s.setUser);
  const setCsrfToken = useAuthStore((s) => s.setCsrfToken);

  const {
    register,
    handleSubmit,
    setError,
    clearErrors,
    formState: { errors, isSubmitting },
  } = useForm<RegisterFormValues>({
    resolver: zodResolver(RegisterFormSchema),
    defaultValues: {
      email: "",
      password: "",
      name: "",
      lastName: "",
      confirmPassword: "",
    },
  });

  const onSubmit = async (values: RegisterFormValues) => {
    clearErrors("root");

    const payload: RegisterInput = {
      email: values.email,
      password: values.password,
      name: values.name || undefined,
      lastName: values.lastName || undefined,
    };

    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        credentials: "include",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = (await res.json().catch(() => null)) as
        | RegisterSuccessResponse
        | RegisterErrorResponse
        | null;

      if (!res.ok) {
        if (res.status === 409) {
          setError("email", {
            type: "server",
            message: "This email is already registered",
          });
          return;
        }

        if (data && "issues" in data && Array.isArray(data.issues)) {
          let hasFieldError = false;
          for (const issue of data.issues) {
            const field = issue.path?.[0];
            const message = issue.message ?? "Invalid value";

            if (field === "email" || field === "password" || field === "name" || field === "lastName") {
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
          message: data && "message" in data && data.message ? data.message : "Unable to register. Try again.",
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
        <label htmlFor="name" className="text-sm text-zinc-700">
          First name
        </label>
        <input
          id="name"
          type="text"
          autoComplete="given-name"
          className={INPUT_CLASSNAME}
          aria-invalid={Boolean(errors.name)}
          {...register("name")}
        />
        {errors.name && <p className="mt-1 text-xs text-red-600">{errors.name.message}</p>}
      </div>

      <div>
        <label htmlFor="lastName" className="text-sm text-zinc-700">
          Last name
        </label>
        <input
          id="lastName"
          type="text"
          autoComplete="family-name"
          className={INPUT_CLASSNAME}
          aria-invalid={Boolean(errors.lastName)}
          {...register("lastName")}
        />
        {errors.lastName && <p className="mt-1 text-xs text-red-600">{errors.lastName.message}</p>}
      </div>

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
          autoComplete="new-password"
          className={INPUT_CLASSNAME}
          aria-invalid={Boolean(errors.password)}
          {...register("password")}
        />
        {errors.password && <p className="mt-1 text-xs text-red-600">{errors.password.message}</p>}
      </div>

      <div>
        <label htmlFor="confirmPassword" className="text-sm text-zinc-700">
          Confirm password
        </label>
        <input
          id="confirmPassword"
          type="password"
          autoComplete="new-password"
          className={INPUT_CLASSNAME}
          aria-invalid={Boolean(errors.confirmPassword)}
          {...register("confirmPassword")}
        />
        {errors.confirmPassword && (
          <p className="mt-1 text-xs text-red-600">{errors.confirmPassword.message}</p>
        )}
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
        {isSubmitting ? "Creating account..." : "Create account"}
      </Button>

      <p className="text-center text-sm text-zinc-500">
        Already have an account?{" "}
        <Link href={ROUTES.auth.login} className="text-zinc-900 underline underline-offset-4">
          Login
        </Link>
      </p>
    </form>
  );
}
