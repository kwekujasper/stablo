"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";

interface FormData {
  email: string;
  firstName?: string;
}

interface NewsletterFormProps {
  heading?: string;
  subheading?: string;
  compact?: boolean; // true = inline single-line form, false = stacked
}

export default function NewsletterForm({
  heading = "Stay in the loop",
  subheading = "Get new articles delivered to your inbox.",
  compact = false,
}: NewsletterFormProps) {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<FormData>();
  const [status, setStatus] = useState<"idle" | "success" | "error">("idle");
  const [message, setMessage] = useState("");

  async function onSubmit(data: FormData) {
    setStatus("idle");
    const res = await fetch("/api/newsletter", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    const json = await res.json();

    if (!res.ok) {
      setStatus("error");
      setMessage(json.error || "Something went wrong. Please try again.");
      return;
    }

    setStatus("success");
    setMessage(
      json.alreadySubscribed
        ? "You're already subscribed! Check your inbox."
        : "Almost done! Check your email to confirm your subscription."
    );
    reset();
  }

  if (status === "success") {
    return (
      <div className="rounded-2xl bg-green-50 p-6 text-center dark:bg-green-900/20" role="status" aria-live="polite">
        <p className="font-medium text-green-700 dark:text-green-400">{message}</p>
      </div>
    );
  }

  return (
    <div className="rounded-2xl bg-gray-50 p-6 dark:bg-gray-800/50">
      <h3 className="mb-1 text-lg font-semibold dark:text-white">{heading}</h3>
      <p className="mb-4 text-sm text-gray-500 dark:text-gray-400">{subheading}</p>

      <form onSubmit={handleSubmit(onSubmit)} noValidate>
        {compact ? (
          <div className="flex gap-2">
            <input
              type="email"
              placeholder="your@email.com"
              {...register("email", {
                required: "Email is required",
                pattern: { value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/, message: "Invalid email" },
              })}
              className="flex-1 rounded-full border border-gray-300 px-4 py-2.5 text-sm outline-none focus:border-blue-500 dark:border-gray-700 dark:bg-gray-900 dark:text-white"
              aria-label="Email address"
            />
            <button
              type="submit"
              disabled={isSubmitting}
              className="rounded-full bg-blue-600 px-5 py-2.5 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50">
              {isSubmitting ? "…" : "Subscribe"}
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            <input
              type="text"
              placeholder="First name (optional)"
              {...register("firstName")}
              className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm outline-none focus:border-blue-500 dark:border-gray-700 dark:bg-gray-900 dark:text-white"
            />
            <input
              type="email"
              placeholder="your@email.com"
              {...register("email", {
                required: "Email is required",
                pattern: { value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/, message: "Invalid email" },
              })}
              className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm outline-none focus:border-blue-500 dark:border-gray-700 dark:bg-gray-900 dark:text-white"
              aria-label="Email address"
            />
            {errors.email && (
              <p className="text-xs text-red-500" role="alert">{errors.email.message}</p>
            )}
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full rounded-full bg-blue-600 py-2.5 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50">
              {isSubmitting ? "Subscribing…" : "Subscribe — it's free"}
            </button>
          </div>
        )}

        {status === "error" && (
          <p className="mt-2 text-xs text-red-500" role="alert">{message}</p>
        )}
        <p className="mt-2 text-xs text-gray-400">
          No spam, ever. Unsubscribe at any time.
        </p>
      </form>
    </div>
  );
}
