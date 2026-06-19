"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";

interface FormData {
  username: string;
  password: string;
}

interface LoginModalProps {
  onClose: () => void;
  onSuccess: () => void;
}

export default function LoginModal({ onClose, onSuccess }: LoginModalProps) {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormData>();
  const [authError, setAuthError] = useState("");

  async function onSubmit(data: FormData) {
    setAuthError("");
    const res = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });

    if (!res.ok) {
      setAuthError("Invalid username or password.");
      return;
    }

    onSuccess();
    onClose();
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="login-modal-title">
      <div className="w-full max-w-sm rounded-2xl bg-white p-8 shadow-2xl dark:bg-gray-900">
        <button
          onClick={onClose}
          className="absolute right-4 top-4 text-gray-400 hover:text-gray-600"
          aria-label="Close">
          ✕
        </button>

        <h2
          id="login-modal-title"
          className="mb-1 text-xl font-semibold dark:text-white">
          Members only
        </h2>
        <p className="mb-6 text-sm text-gray-500">
          Sign in to read the full article.
        </p>

        <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-4">
          <div>
            <label className="mb-1 block text-sm font-medium dark:text-gray-300" htmlFor="username">
              Username or Email
            </label>
            <input
              id="username"
              type="text"
              autoComplete="username"
              {...register("username", { required: "Username is required" })}
              className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm outline-none focus:border-blue-500 dark:border-gray-700 dark:bg-gray-800 dark:text-white"
            />
            {errors.username && (
              <p className="mt-1 text-xs text-red-500" role="alert">{errors.username.message}</p>
            )}
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium dark:text-gray-300" htmlFor="password">
              Password
            </label>
            <input
              id="password"
              type="password"
              autoComplete="current-password"
              {...register("password", { required: "Password is required" })}
              className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm outline-none focus:border-blue-500 dark:border-gray-700 dark:bg-gray-800 dark:text-white"
            />
            {errors.password && (
              <p className="mt-1 text-xs text-red-500" role="alert">{errors.password.message}</p>
            )}
          </div>

          {authError && (
            <p className="text-sm text-red-500" role="alert">{authError}</p>
          )}

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full rounded-full bg-blue-600 py-2.5 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50">
            {isSubmitting ? "Signing in…" : "Sign In"}
          </button>
        </form>
      </div>
    </div>
  );
}
