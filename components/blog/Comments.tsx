"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import Image from "next/image";
import { format, parseISO } from "date-fns";
import type { WPComment } from "@/lib/wordpress/types";

interface CommentFormData {
  authorName: string;
  authorEmail: string;
  authorUrl?: string;
  content: string;
  parentId?: number;
}

interface CommentsProps {
  postId: number;
}

export default function Comments({ postId }: CommentsProps) {
  const [comments, setComments] = useState<WPComment[]>([]);
  const [replyingTo, setReplyingTo] = useState<number | null>(null);
  const [status, setStatus] = useState<"idle" | "submitting" | "success" | "error">("idle");

  useEffect(() => {
    fetch(`/api/comments?postId=${postId}`)
      .then(r => r.json())
      .then(d => setComments(d.comments ?? []));
  }, [postId]);

  return (
    <section className="mx-auto mt-10 max-w-screen-md" aria-label="Comments">
      <h2 className="mb-6 text-2xl font-semibold dark:text-white">
        {comments.length > 0 ? `${comments.length} Comment${comments.length !== 1 ? "s" : ""}` : "Leave a Comment"}
      </h2>

      {/* Existing comments */}
      <div className="space-y-6">
        {comments.map(comment => (
          <CommentThread
            key={comment.id}
            comment={comment}
            onReply={id => setReplyingTo(id)}
          />
        ))}
      </div>

      {/* Submit form */}
      <CommentForm
        postId={postId}
        parentId={replyingTo ?? undefined}
        replyingTo={replyingTo}
        onCancelReply={() => setReplyingTo(null)}
        onSubmitted={(newComment) => {
          setComments(prev => [...prev, newComment]);
          setReplyingTo(null);
          setStatus("success");
        }}
      />
    </section>
  );
}

function CommentThread({
  comment,
  onReply,
}: {
  comment: WPComment;
  onReply: (id: number) => void;
}) {
  const authorName = comment.author?.node?.name ?? "Anonymous";
  const avatarUrl = comment.author?.node?.avatar?.url;

  return (
    <div className="flex gap-4">
      <div className="relative h-10 w-10 flex-shrink-0">
        {avatarUrl ? (
          <Image
            src={avatarUrl}
            alt={authorName}
            fill
            className="rounded-full object-cover"
            sizes="40px"
          />
        ) : (
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gray-200 text-gray-600 dark:bg-gray-700 dark:text-gray-300">
            {authorName.charAt(0).toUpperCase()}
          </div>
        )}
      </div>
      <div className="flex-1">
        <div className="flex items-center gap-2">
          <span className="font-medium text-gray-900 dark:text-white">{authorName}</span>
          <time className="text-xs text-gray-500" dateTime={comment.date}>
            {format(parseISO(comment.date), "MMM d, yyyy")}
          </time>
        </div>
        <div
          className="prose prose-sm mt-1 dark:prose-invert"
          dangerouslySetInnerHTML={{ __html: comment.content }}
        />
        <button
          onClick={() => onReply(comment.databaseId)}
          className="mt-1 text-xs text-blue-600 hover:underline dark:text-blue-400">
          Reply
        </button>

        {/* Nested replies */}
        {comment.replies?.nodes?.length ? (
          <div className="mt-4 space-y-4 border-l-2 border-gray-100 pl-4 dark:border-gray-800">
            {comment.replies.nodes.map(reply => (
              <CommentThread key={reply.id} comment={reply} onReply={onReply} />
            ))}
          </div>
        ) : null}
      </div>
    </div>
  );
}

function CommentForm({
  postId,
  parentId,
  replyingTo,
  onCancelReply,
  onSubmitted,
}: {
  postId: number;
  parentId?: number;
  replyingTo: number | null;
  onCancelReply: () => void;
  onSubmitted: (comment: WPComment) => void;
}) {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<CommentFormData>();
  const [submitError, setSubmitError] = useState("");
  const [submitted, setSubmitted] = useState(false);

  async function onSubmit(data: CommentFormData) {
    setSubmitError("");
    const res = await fetch("/api/comments", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...data, postId, parentId }),
    });

    if (!res.ok) {
      setSubmitError("Failed to submit. Please try again.");
      return;
    }

    reset();
    setSubmitted(true);
  }

  if (submitted) {
    return (
      <p className="mt-6 rounded-lg bg-green-50 p-4 text-green-700 dark:bg-green-900/20 dark:text-green-400" role="status">
        Your comment has been submitted and is pending moderation. Thank you!
      </p>
    );
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="mt-8 space-y-4" noValidate>
      <h3 className="text-lg font-semibold dark:text-white">
        {replyingTo ? (
          <>
            Replying to comment{" "}
            <button
              type="button"
              onClick={onCancelReply}
              className="ml-2 text-sm text-gray-400 hover:text-red-500">
              (cancel)
            </button>
          </>
        ) : (
          "Leave a Comment"
        )}
      </h3>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="mb-1 block text-sm font-medium dark:text-gray-300" htmlFor="authorName">
            Name <span aria-hidden>*</span>
          </label>
          <input
            id="authorName"
            type="text"
            {...register("authorName", { required: "Name is required" })}
            className="w-full rounded-lg border border-gray-300 px-4 py-2 text-sm outline-none focus:border-blue-500 dark:border-gray-700 dark:bg-gray-900 dark:text-white"
          />
          {errors.authorName && (
            <p className="mt-1 text-xs text-red-500" role="alert">{errors.authorName.message}</p>
          )}
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium dark:text-gray-300" htmlFor="authorEmail">
            Email <span aria-hidden>*</span>
          </label>
          <input
            id="authorEmail"
            type="email"
            {...register("authorEmail", {
              required: "Email is required",
              pattern: { value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/, message: "Invalid email" },
            })}
            className="w-full rounded-lg border border-gray-300 px-4 py-2 text-sm outline-none focus:border-blue-500 dark:border-gray-700 dark:bg-gray-900 dark:text-white"
          />
          {errors.authorEmail && (
            <p className="mt-1 text-xs text-red-500" role="alert">{errors.authorEmail.message}</p>
          )}
        </div>
      </div>

      <div>
        <label className="mb-1 block text-sm font-medium dark:text-gray-300" htmlFor="content">
          Comment <span aria-hidden>*</span>
        </label>
        <textarea
          id="content"
          rows={5}
          {...register("content", { required: "Comment cannot be empty", minLength: { value: 3, message: "Too short" } })}
          className="w-full rounded-lg border border-gray-300 px-4 py-2 text-sm outline-none focus:border-blue-500 dark:border-gray-700 dark:bg-gray-900 dark:text-white"
        />
        {errors.content && (
          <p className="mt-1 text-xs text-red-500" role="alert">{errors.content.message}</p>
        )}
      </div>

      {submitError && (
        <p className="text-sm text-red-500" role="alert">{submitError}</p>
      )}

      <button
        type="submit"
        disabled={isSubmitting}
        className="rounded-full bg-blue-600 px-6 py-2.5 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50">
        {isSubmitting ? "Submitting…" : "Post Comment"}
      </button>
    </form>
  );
}
