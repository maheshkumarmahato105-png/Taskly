"use client";

import React from "react";

interface BrandMarkProps {
  size?: number;
  className?: string;
  glow?: boolean;
}

export function BrandMark({ size = 36, className = "", glow = true }: BrandMarkProps) {
  return (
    <div
      className={`brand-mark-wrapper ${className}`}
      style={{
        width: `${size}px`,
        height: `${size}px`,
        position: "relative",
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        flexShrink: 0,
      }}
    >
      <svg
        width={size}
        height={size}
        viewBox="0 0 44 44"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        style={{
          filter: glow ? "drop-shadow(0 4px 12px rgba(255, 170, 0, 0.28))" : "none",
          transition: "transform 0.2s ease, filter 0.2s ease",
        }}
      >
        <defs>
          <linearGradient id="eml-shield-grad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#1E293B" />
            <stop offset="100%" stopColor="#0B1120" />
          </linearGradient>
          <linearGradient id="eml-amber-grad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#FFC837" />
            <stop offset="50%" stopColor="#FFAA00" />
            <stop offset="100%" stopColor="#E67E00" />
          </linearGradient>
          <linearGradient id="eml-check-grad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#FFF7E6" />
            <stop offset="50%" stopColor="#FFAA00" />
            <stop offset="100%" stopColor="#FF8800" />
          </linearGradient>
          <radialGradient id="eml-amber-glow" cx="50%" cy="35%" r="55%">
            <stop offset="0%" stopColor="#FFAA00" stopOpacity="0.32" />
            <stop offset="100%" stopColor="#FFAA00" stopOpacity="0" />
          </radialGradient>
        </defs>

        {/* Squircle Background Base */}
        <rect
          x="2"
          y="2"
          width="40"
          height="40"
          rx="11"
          fill="url(#eml-shield-grad)"
          stroke="#FFAA00"
          strokeWidth="1.5"
          strokeOpacity="0.45"
        />

        {/* Ambient Amber Glow inside */}
        <circle cx="22" cy="20" r="16" fill="url(#eml-amber-glow)" />

        {/* Academic Mortarboard Cap */}
        <g>
          {/* Top Diamond */}
          <path d="M 22 9 L 36 16 L 22 23 L 8 16 Z" fill="url(#eml-amber-grad)" />
          {/* Subtle Highlight Facet */}
          <path d="M 22 9 L 8 16 L 22 23 Z" fill="#FFFFFF" fillOpacity="0.22" />

          {/* Skull Cap Lower Band */}
          <path
            d="M 14 19.5 V 23.5 C 14 26.5 30 26.5 30 23.5 V 19.5"
            stroke="url(#eml-amber-grad)"
            strokeWidth="1.8"
            strokeLinecap="round"
            fill="none"
          />

          {/* Flowing Graduation Tassel */}
          <path
            d="M 33 17 C 34.5 19.5 34.5 22.5 32.5 24.5"
            stroke="#FFEBA8"
            strokeWidth="1.4"
            strokeLinecap="round"
          />
          <circle cx="32" cy="25" r="1.3" fill="#FFEBA8" />
        </g>

        {/* Modern Dynamic Task Checkmark */}
        <path
          d="M 12 25 L 18.5 31.5 L 33 17"
          stroke="#0B1120"
          strokeWidth="4.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M 12 25 L 18.5 31.5 L 33 17"
          stroke="url(#eml-check-grad)"
          strokeWidth="2.8"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </div>
  );
}

interface BrandLogoProps {
  brandName?: string;
  subTitle?: string;
  badge?: string;
  size?: number;
  showBadge?: boolean;
  showSubtitle?: boolean;
  collapsed?: boolean;
  className?: string;
}

export function BrandLogo({
  brandName = "EasyMyLearning",
  subTitle = "Task Manager",
  badge = "ENTERPRISE",
  size = 38,
  showBadge = true,
  showSubtitle = true,
  collapsed = false,
  className = "",
}: BrandLogoProps) {
  // If brandName is "EasyMyLearning", split and style for high visual impact
  const isDefaultBrand = brandName.toLowerCase() === "easymylearning";

  return (
    <div className={`brand-container ${className}`} style={{ display: "flex", alignItems: "center", gap: "10px", minWidth: 0 }}>
      <BrandMark size={size} glow />

      {!collapsed && (
        <>
          <div className="brand-info" style={{ display: "flex", flexDirection: "column", minWidth: 0 }}>
            <span
              className="brand-name"
              style={{
                fontSize: "15px",
                fontWeight: 900,
                letterSpacing: "-0.2px",
                lineHeight: "1.2",
                whiteSpace: "nowrap",
              }}
            >
              {isDefaultBrand ? (
                <>
                  <span style={{ color: "#F8FAFC" }}>EasyMy</span>
                  <span
                    style={{
                      background: "linear-gradient(135deg, #FFC837 0%, #FFAA00 100%)",
                      WebkitBackgroundClip: "text",
                      WebkitTextFillColor: "transparent",
                    }}
                  >
                    Learning
                  </span>
                </>
              ) : (
                <span style={{ color: "#F8FAFC" }}>{brandName}</span>
              )}
            </span>

            {showSubtitle && (
              <span
                className="brand-sub"
                style={{
                  color: "#FFAA00",
                  fontSize: "9px",
                  fontWeight: 700,
                  letterSpacing: "1px",
                  textTransform: "uppercase",
                  marginTop: "2px",
                }}
              >
                {subTitle}
              </span>
            )}
          </div>

          {showBadge && (
            <span
              className="brand-badge"
              style={{
                marginLeft: "auto",
                background: "rgba(255, 170, 0, 0.12)",
                color: "#FFD36B",
                border: "1px solid rgba(255, 170, 0, 0.28)",
                fontSize: "8.5px",
                fontWeight: 900,
                letterSpacing: "0.8px",
                padding: "2px 6px",
                borderRadius: "4px",
                flexShrink: 0,
              }}
            >
              {badge}
            </span>
          )}
        </>
      )}
    </div>
  );
}
