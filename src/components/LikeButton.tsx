"use client"
import React, { useState } from "react";

interface LikeButtonProps {
  initialCount?: number;
}

const LikeButton: React.FC<LikeButtonProps> = ({ initialCount = 0 }) => {
  const [likes, setLikes] = useState(initialCount);
  const [isLiked, setIsLiked] = useState(false);

  const handleClick = () => {
    setIsLiked(!isLiked);
    setLikes(prev => (isLiked ? prev - 1 : prev + 1));
  };

  return (
    <button
      onClick={handleClick}
      style={{
        position: "relative",
        padding: "10px 20px",
        fontSize: "16px",
        borderRadius: "8px",
        border: "none",
        cursor: "pointer",
        backgroundColor: isLiked ? "#1E90FF" : "#f0f0f0",
        color: isLiked ? "#fff" : "#333",
        overflow: "hidden",
        transition: "background-color 0.3s ease"
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.backgroundColor = "#1E90FF";
        e.currentTarget.style.color = "#fff";
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.backgroundColor = isLiked ? "#1E90FF" : "#f0f0f0";
        e.currentTarget.style.color = isLiked ? "#fff" : "#333";
      }}
    >
      <span
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          width: "100%",
          height: "100%",
          backgroundColor: "rgba(30, 144, 255, 0.3)",
          opacity: isLiked ? 1 : 0,
          transition: "opacity 0.3s ease",
          pointerEvents: "none"
        }}
      />
      👍 {likes}
    </button>
  );
};

export default LikeButton;
