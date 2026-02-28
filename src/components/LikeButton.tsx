"use client";

import React, { useState } from "react";
import Image from "next/image";

interface LikeButtonProps {
  initialCount?: number;
}

const LikeButton: React.FC<LikeButtonProps> = ({ initialCount = 0, size = 40 }) => {
  const [likes, setLikes] = useState(initialCount);
  const [isLiked, setIsLiked] = useState(false);

  const handleClick = () => {
    setIsLiked(!isLiked);
    setLikes(prev => (isLiked ? prev - 1 : prev + 1));
  };

  return (
    <div
      onClick={handleClick}
      className="relative inline-flex items-center cursor-pointer select-none"
    >
      <Image
        src="/assets/like-button.png" 
        alt="Like button"
        width={20}
        height={20}
        className={`transition-all duration-300 ${
          isLiked ? "filter invert-100 sepia-100 saturate-1000 hue-rotate-180 brightness-100" : ""
        }`}
      />

      <span className="ml-2 text-white font-bold select-none">{likes}</span>
    </div>
  );
};

export default LikeButton;