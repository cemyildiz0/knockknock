"use client";

import { useState } from "react";
import { ThumbsUp } from "lucide-react";

interface LikeButtonProps {
  initialCount?: number;
}

export default function LikeButton({ initialCount = 0 }: LikeButtonProps) {
  const [likes, setLikes] = useState(initialCount);
  const [isLiked, setIsLiked] = useState(false);

  const handleClick = () => {
    setIsLiked(!isLiked);
    setLikes((prev) => (isLiked ? prev - 1 : prev + 1));
  };

  return (
    <button
      onClick={handleClick}
      className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
        isLiked
          ? "bg-brand-orange/10 text-brand-orange"
          : "bg-gray-50 text-brand-teal hover:bg-gray-100"
      }`}
    >
      <ThumbsUp size={14} className={isLiked ? "fill-current" : ""} />
      <span>{likes}</span>
    </button>
  );
}
