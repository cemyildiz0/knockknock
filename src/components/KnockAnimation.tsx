"use client";

import { useEffect } from "react";

interface Props {
  side: "A" | "B" | "both";
  onComplete: () => void;
}

const TOTAL_DURATION = 2200;

function DoorPanel({ from }: { from: "left" | "right" }) {
  return (
    <div
      className="knock-door-wrapper"
      style={{ [from === "left" ? "left" : "right"]: 0 }}
    >
      <div className="knock-door-slide">
        <div className="knock-door-open">
          <svg
            width="90"
            height="160"
            viewBox="0 0 90 160"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            {/* Door frame */}
            <rect x="2" y="2" width="86" height="156" rx="4" fill="#172A3A" stroke="#508991" strokeWidth="3" />
            {/* Door panel inset */}
            <rect x="10" y="10" width="70" height="68" rx="2" fill="#1e3a4a" />
            <rect x="10" y="84" width="70" height="68" rx="2" fill="#1e3a4a" />
            {/* Handle */}
            <circle cx="68" cy="82" r="5" fill="#FFB563" />
            <rect x="66" y="82" width="10" height="3" rx="1.5" fill="#FFB563" />
          </svg>
        </div>

        {/* Fist knocking */}
        <div className="knock-fist">
          <svg
            width="48"
            height="48"
            viewBox="0 0 48 48"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            {/* Fist body */}
            <rect x="8" y="18" width="32" height="22" rx="6" fill="#FFE066" />
            {/* Fingers */}
            <rect x="10" y="10" width="8" height="14" rx="4" fill="#FFE066" />
            <rect x="20" y="8" width="8" height="14" rx="4" fill="#FFE066" />
            <rect x="30" y="10" width="8" height="14" rx="4" fill="#FFE066" />
            {/* Thumb */}
            <rect x="4" y="22" width="8" height="10" rx="4" fill="#FFE066" />
            {/* Knuckle lines */}
            <line x1="10" y1="22" x2="10" y2="30" stroke="#172A3A" strokeWidth="1.5" strokeLinecap="round" />
            <line x1="20" y1="22" x2="20" y2="30" stroke="#172A3A" strokeWidth="1.5" strokeLinecap="round" />
            <line x1="30" y1="22" x2="30" y2="30" stroke="#172A3A" strokeWidth="1.5" strokeLinecap="round" />
          </svg>
        </div>
      </div>
    </div>
  );
}

export default function KnockAnimation({ side, onComplete }: Props) {
  useEffect(() => {
    const timer = setTimeout(onComplete, TOTAL_DURATION);
    return () => clearTimeout(timer);
  }, [onComplete]);

  return (
    <>
      <style>{`
        .knock-overlay {
          position: absolute;
          inset: 0;
          z-index: 30;
          display: flex;
          align-items: center;
          justify-content: center;
          pointer-events: none;
          animation: knock-fade-out 300ms ease-in ${TOTAL_DURATION - 300}ms both;
        }

        .knock-door-wrapper {
          position: absolute;
          top: 50%;
          transform: translateY(-50%);
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .knock-door-slide {
          display: flex;
          align-items: center;
          gap: 12px;
          animation: knock-slide-in 300ms cubic-bezier(0.22, 1, 0.36, 1) forwards;
        }

        .knock-door-wrapper[style*="left: 0"] .knock-door-slide {
          animation-name: knock-slide-in-left;
          flex-direction: row-reverse;
        }

        .knock-door-wrapper[style*="right: 0"] .knock-door-slide {
          animation-name: knock-slide-in-right;
        }

        .knock-door-open {
          animation: knock-door-open 400ms ease-in-out 1300ms both;
          transform-origin: left center;
        }

        .knock-fist {
          animation:
            knock-appear 100ms ease-out 350ms both,
            knock-bounce 300ms ease-in-out 350ms 3;
        }

        @keyframes knock-slide-in-left {
          from { transform: translateX(-120px); opacity: 0; }
          to   { transform: translateX(0);      opacity: 1; }
        }

        @keyframes knock-slide-in-right {
          from { transform: translateX(120px); opacity: 0; }
          to   { transform: translateX(0);     opacity: 1; }
        }

        @keyframes knock-appear {
          from { opacity: 0; transform: scale(0.7); }
          to   { opacity: 1; transform: scale(1); }
        }

        @keyframes knock-bounce {
          0%   { transform: translateX(0); }
          40%  { transform: translateX(-10px); }
          100% { transform: translateX(0); }
        }

        .knock-door-wrapper[style*="left: 0"] .knock-fist {
          animation:
            knock-appear 100ms ease-out 350ms both,
            knock-bounce-right 300ms ease-in-out 350ms 3;
        }

        @keyframes knock-bounce-right {
          0%   { transform: translateX(0); }
          40%  { transform: translateX(10px); }
          100% { transform: translateX(0); }
        }

        @keyframes knock-door-open {
          from { transform: perspective(400px) rotateY(0deg); }
          to   { transform: perspective(400px) rotateY(-70deg); }
        }

        @keyframes knock-fade-out {
          from { opacity: 1; }
          to   { opacity: 0; }
        }
      `}</style>

      <div className="knock-overlay">
        {(side === "A" || side === "both") && <DoorPanel from="left" />}
        {(side === "B" || side === "both") && <DoorPanel from="right" />}
      </div>
    </>
  );
}
