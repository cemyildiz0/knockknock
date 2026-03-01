"use client";

import { useState, useRef, useCallback } from "react";
import { useRouter, useParams } from "next/navigation";
import Image from "next/image";
import { Star, Upload, X, ArrowLeft, ImagePlus, Loader2 } from "lucide-react";
import { createClient } from "@/lib/supabase-browser";

// ─── Star Picker ──────────────────────────────────────────────────────────────

function StarPicker({
  value,
  onChange,
}: {
  value: number;
  onChange: (v: number) => void;
}) {
  const [hovered, setHovered] = useState(0);
  const display = hovered || value;

  const labels = ["", "Poor", "Fair", "Good", "Very Good", "Excellent"];

  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type="button"
            onMouseEnter={() => setHovered(star)}
            onMouseLeave={() => setHovered(0)}
            onClick={() => onChange(star)}
            className="focus:outline-none transition-transform hover:scale-110"
            aria-label={`Rate ${star} star${star > 1 ? "s" : ""}`}
          >
            <Star
              size={32}
              className={`transition-colors ${
                star <= display
                  ? "text-brand-orange fill-brand-orange"
                  : "text-gray-200 fill-gray-200"
              }`}
            />
          </button>
        ))}
        {display > 0 && (
          <span className="ml-2 text-sm font-medium text-gray-500">
            {labels[display]}
          </span>
        )}
      </div>
    </div>
  );
}

// ─── Photo Upload Area ────────────────────────────────────────────────────────

interface PhotoFile {
  id: string;
  file: File;
  preview: string;
}

function PhotoUpload({
  photos,
  onAdd,
  onRemove,
}: {
  photos: PhotoFile[];
  onAdd: (files: FileList) => void;
  onRemove: (id: string) => void;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragging, setDragging] = useState(false);

  function handleDrop(e: React.DragEvent) {
    e.preventDefault();
    setDragging(false);
    if (e.dataTransfer.files.length) onAdd(e.dataTransfer.files);
  }

  return (
    <div className="space-y-3">
      {/* Drop zone */}
      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
        onDragLeave={() => setDragging(false)}
        onDrop={handleDrop}
        className={`w-full border-2 border-dashed rounded-xl py-8 px-6 flex flex-col items-center gap-2 transition-colors cursor-pointer ${
          dragging
            ? "border-brand-orange bg-orange-50"
            : "border-gray-200 hover:border-brand-teal/50 hover:bg-gray-50"
        }`}
      >
        <ImagePlus size={28} className="text-gray-300" />
        <p className="text-sm font-medium text-gray-500">
          Drag & drop photos, or <span className="text-brand-teal">browse</span>
        </p>
        <p className="text-xs text-gray-400">PNG, JPG, WEBP up to 10 MB each · Max 5 photos</p>
      </button>
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        multiple
        className="hidden"
        onChange={(e) => e.target.files && onAdd(e.target.files)}
      />

      {/* Preview grid */}
      {photos.length > 0 && (
        <div className="grid grid-cols-3 sm:grid-cols-5 gap-3">
          {photos.map(({ id, preview }) => (
            <div key={id} className="relative group aspect-square rounded-lg overflow-hidden border border-gray-100">
              <Image
                src={preview}
                alt="Upload preview"
                fill
                className="object-cover"
                unoptimized
              />
              <button
                type="button"
                onClick={() => onRemove(id)}
                className="absolute top-1 right-1 w-5 h-5 rounded-full bg-black/60 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                aria-label="Remove photo"
              >
                <X size={11} className="text-white" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function WriteReviewPage() {
  const router = useRouter();
  const params = useParams();
  const neighborhoodId = Number(params.id);
  const neighborhoodName = (params.name as string | undefined)
    ? decodeURIComponent(params.name as string)
    : "this neighborhood";

  const supabase = createClient();

  // Form state
  const [rating, setRating] = useState(0);
  const [title, setTitle] = useState("");
  const [comment, setComment] = useState("");
  const [photos, setPhotos] = useState<PhotoFile[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [ratingError, setRatingError] = useState(false);

  // ── Photo handlers ──
  function addPhotos(files: FileList) {
    const remaining = 5 - photos.length;
    const toAdd = Array.from(files).slice(0, remaining);
    const newPhotos: PhotoFile[] = toAdd.map((file) => ({
      id: `${Date.now()}-${Math.random()}`,
      file,
      preview: URL.createObjectURL(file),
    }));
    setPhotos((prev) => [...prev, ...newPhotos]);
  }

  function removePhoto(id: string) {
    setPhotos((prev) => {
      const photo = prev.find((p) => p.id === id);
      if (photo) URL.revokeObjectURL(photo.preview);
      return prev.filter((p) => p.id !== id);
    });
  }

  // ── Submit ──
  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (rating === 0) {
      setRatingError(true);
      return;
    }
    setRatingError(false);

    if (!comment.trim()) {
      setError("Please write your review before submitting.");
      return;
    }

    setSubmitting(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        router.push("/auth");
        return;
      }

      // Upload photos (if any)
      const photoUrls: string[] = [];
      for (const photo of photos) {
        const ext = photo.file.name.split(".").pop();
        const path = `reviews/${user.id}/${Date.now()}.${ext}`;
        const { error: uploadError } = await supabase.storage
          .from("review-photos")
          .upload(path, photo.file, { upsert: false });

        if (!uploadError) {
          const { data: { publicUrl } } = supabase.storage
            .from("review-photos")
            .getPublicUrl(path);
          photoUrls.push(publicUrl);
        }
      }

      // Insert review
      const { error: insertError } = await supabase.from("reviews").insert({
        neighborhood_id: neighborhoodId,
        user_id: user.id,
        rating,
        title: title.trim() || null,
        comment: comment.trim(),
        photo_urls: photoUrls.length > 0 ? photoUrls : null,
      });

      if (insertError) {
        setError("Something went wrong saving your review. Please try again.");
        setSubmitting(false);
        return;
      }

      // Navigate back to the neighborhood page
      router.push(`/neighborhoods/${neighborhoodId}`);
      router.refresh();
    } catch (err) {
      console.error(err);
      setError("An unexpected error occurred. Please try again.");
      setSubmitting(false);
    }
  }

  function handleCancel() {
    router.back();
  }

  // ── Character count ──
  const MAX_CHARS = 1000;
  const charsLeft = MAX_CHARS - comment.length;

  return (
    <div className="min-h-screen bg-[#f5f3ee] font-[Inter,sans-serif]">

      {/* ── Top bar ── */}
      <div className="bg-white border-b border-gray-100 sticky top-0 z-10">
        <div className="max-w-3xl mx-auto px-6 h-14 flex items-center gap-3">
          <button
            type="button"
            onClick={handleCancel}
            className="flex items-center gap-1.5 text-gray-400 hover:text-brand-navy transition-colors text-sm font-medium"
          >
            <ArrowLeft size={15} />
            Back
          </button>
          <span className="text-gray-200">·</span>
          <span className="text-sm text-gray-400 font-normal truncate">
            Writing a review for <span className="text-brand-navy font-semibold">{neighborhoodName}</span>
          </span>
        </div>
      </div>

      {/* ── Form ── */}
      <div className="max-w-3xl mx-auto px-6 py-10">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-brand-navy">Write a Review</h1>
          <p className="text-sm text-gray-500 mt-1 font-normal">
            Share your experience living in or visiting {neighborhoodName}. Your honest review helps others make informed decisions.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">

          {/* Rating */}
          <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
            <label className="block text-sm font-semibold text-brand-navy mb-3">
              Overall Rating <span className="text-brand-orange">*</span>
            </label>
            <StarPicker value={rating} onChange={(v) => { setRating(v); setRatingError(false); }} />
            {ratingError && (
              <p className="mt-2 text-xs text-red-500 font-medium">Please select a star rating.</p>
            )}
          </div>

          {/* Review title */}
          <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
            <label className="block text-sm font-semibold text-brand-navy mb-2" htmlFor="review-title">
              Review Title <span className="text-gray-400 font-normal">(optional)</span>
            </label>
            <input
              id="review-title"
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              maxLength={100}
              placeholder="Summarize your experience in a few words"
              className="w-full rounded-lg border border-gray-200 px-4 py-2.5 text-sm text-brand-navy placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-brand-teal/30 focus:border-brand-teal transition"
            />
          </div>

          {/* Review body */}
          <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
            <label className="block text-sm font-semibold text-brand-navy mb-2" htmlFor="review-comment">
              Your Review <span className="text-brand-orange">*</span>
            </label>
            <p className="text-xs text-gray-400 font-normal mb-3">
              Tell others about the walkability, safety, community vibe, noise levels, amenities, or anything that shaped your experience.
            </p>
            <textarea
              id="review-comment"
              value={comment}
              onChange={(e) => setComment(e.target.value.slice(0, MAX_CHARS))}
              placeholder="I've lived here for two years and..."
              rows={7}
              className="w-full rounded-lg border border-gray-200 px-4 py-3 text-sm text-brand-navy placeholder-gray-300 resize-none focus:outline-none focus:ring-2 focus:ring-brand-teal/30 focus:border-brand-teal transition leading-relaxed"
            />
            <div className="flex justify-end mt-1.5">
              <span className={`text-xs font-medium ${charsLeft < 50 ? "text-brand-orange" : "text-gray-300"}`}>
                {charsLeft} characters remaining
              </span>
            </div>
          </div>

          {/* Photo upload */}
          <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
            <label className="block text-sm font-semibold text-brand-navy mb-1">
              Add Photos <span className="text-gray-400 font-normal">(optional)</span>
            </label>
            <p className="text-xs text-gray-400 font-normal mb-4">
              Photos help others get a feel for the neighborhood. Up to 5 images.
            </p>
            <PhotoUpload
              photos={photos}
              onAdd={addPhotos}
              onRemove={removePhoto}
            />
          </div>

          {/* Error message */}
          {error && (
            <div className="bg-red-50 border border-red-100 rounded-xl px-4 py-3">
              <p className="text-sm text-red-600 font-medium">{error}</p>
            </div>
          )}

          {/* Actions */}
          <div className="flex flex-col sm:flex-row gap-3 pt-2 pb-10">
            <button
              type="submit"
              disabled={submitting}
              className="flex items-center justify-center gap-2 bg-brand-orange hover:bg-[#f0a44e] disabled:opacity-60 disabled:cursor-not-allowed text-brand-navy font-bold text-sm px-8 py-3.5 rounded-full transition-colors"
            >
              {submitting ? (
                <>
                  <Loader2 size={15} className="animate-spin" />
                  Saving Review…
                </>
              ) : (
                "Save Review"
              )}
            </button>
            <button
              type="button"
              onClick={handleCancel}
              disabled={submitting}
              className="flex items-center justify-center border border-gray-200 hover:border-gray-300 text-gray-500 hover:text-brand-navy font-semibold text-sm px-8 py-3.5 rounded-full transition-colors disabled:opacity-50"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
