"use client";

/**
 * Payment Method Icon Component
 *
 * Renders icons for common payment methods.
 * Falls back to text badge for methods without icons.
 */

import { cn } from "@/lib/utils";

// SVG icons for common payment methods
const PAYMENT_ICONS: Record<string, React.ReactNode> = {
  visa: (
    <svg viewBox="0 0 48 32" className="h-full w-full">
      <rect width="48" height="32" rx="4" fill="#1A1F71" />
      <path
        d="M19.5 21.5h-2.8l1.7-10.5h2.8L19.5 21.5zM15.2 11l-2.7 7.2-.3-1.5-.9-4.7s-.1-.8-.9-.8h-4.7l-.1.3s1 .2 2.2.8l2.5 9.2h2.9l4.4-10.5H15.2zM33.6 21.5h2.6l-2.2-10.5h-2.4c-.7 0-1.2.4-1.4 1l-4 9.5h2.8l.6-1.6h3.4l.6 1.6zM31.1 17.5l1.4-3.9.8 3.9h-2.2zM28.2 13.9l.4-2.2s-1.2-.5-2.5-.5c-1.4 0-4.7.6-4.7 3.5 0 2.8 3.9 2.8 3.9 4.3 0 1.5-3.5 1.2-4.6.3l-.4 2.3s1.2.6 3.1.6c1.9 0 4.8-1 4.8-3.6 0-2.8-4-3.1-4-4.2 0-1.2 2.7-1 4-.5z"
        fill="#fff"
      />
    </svg>
  ),
  mastercard: (
    <svg viewBox="0 0 48 32" className="h-full w-full">
      <rect width="48" height="32" rx="4" fill="#000" />
      <circle cx="18" cy="16" r="9" fill="#EB001B" />
      <circle cx="30" cy="16" r="9" fill="#F79E1B" />
      <path
        d="M24 9.5c2.2 1.5 3.6 4 3.6 6.5s-1.4 5-3.6 6.5c-2.2-1.5-3.6-4-3.6-6.5s1.4-5 3.6-6.5z"
        fill="#FF5F00"
      />
    </svg>
  ),
  paypal: (
    <svg viewBox="0 0 48 32" className="h-full w-full">
      <rect width="48" height="32" rx="4" fill="#003087" />
      <path
        d="M18.1 12h3.8c2.5 0 3.7 1.2 3.4 3.4-.4 2.8-2.2 4.3-4.7 4.3h-1.2c-.3 0-.6.3-.7.7l-.5 3.1c0 .2-.2.4-.4.4h-2.2c-.2 0-.4-.2-.3-.5l1.5-10.8c.1-.4.4-.6.8-.6h.5z"
        fill="#fff"
      />
      <path
        d="M32.4 12h3.8c2.5 0 3.7 1.2 3.4 3.4-.4 2.8-2.2 4.3-4.7 4.3h-1.2c-.3 0-.6.3-.7.7l-.5 3.1c0 .2-.2.4-.4.4h-2.2c-.2 0-.4-.2-.3-.5l1.5-10.8c.1-.4.4-.6.8-.6h.5z"
        fill="#009CDE"
      />
    </svg>
  ),
  amex: (
    <svg viewBox="0 0 48 32" className="h-full w-full">
      <rect width="48" height="32" rx="4" fill="#006FCF" />
      <path
        d="M6 16h4l2-5 2 5h4v-1l.4 1h2.2l.4-1v1h8.8v-2h-.2c.7 0 1-.4 1-1v-.5h2.2v1.5c0 1.3-.7 2-2 2h-1.6v2h-2v-2h-2v-2h2v-.5h-2v-.5h-2v.5h-.6l.6-1.5h2l.6 1.5v-1.5h2v3c-.4-.4-1-.6-1.6-.6h-1.4l-.6-1.5-.6 1.5h-2.4L14 13h-.6l-.4 1H6v2zm9.4-3l-1.8 4h1.3l.3-.8h1.8l.3.8h1.3l-1.8-4h-1.4zm.7 1.2l.5 1.2h-1l.5-1.2z"
        fill="#fff"
      />
    </svg>
  ),
  klarna: (
    <svg viewBox="0 0 48 32" className="h-full w-full">
      <rect width="48" height="32" rx="4" fill="#FFB3C7" />
      <path
        d="M15 21h-3V11h3v10zm5.5-10c-.8 0-1.6.2-2.3.5A5.5 5.5 0 0015 16c0 1.9.9 3.5 2.2 4.5.7.3 1.5.5 2.3.5h1.5V11h-1.5zm6 0v10h3V11h-3zm7.5 10c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2z"
        fill="#0A0B09"
      />
    </svg>
  ),
  giropay: (
    <svg viewBox="0 0 48 32" className="h-full w-full">
      <rect width="48" height="32" rx="4" fill="#fff" />
      <rect x="8" y="8" width="32" height="16" rx="2" fill="#003A7D" />
      <circle cx="18" cy="16" r="4" fill="#EF0020" />
      <rect x="24" y="12" width="12" height="8" rx="1" fill="#fff" />
    </svg>
  ),
  sofort: (
    <svg viewBox="0 0 48 32" className="h-full w-full">
      <rect width="48" height="32" rx="4" fill="#EF809F" />
      <path
        d="M12 16c0-3.3 2.7-6 6-6h12c3.3 0 6 2.7 6 6s-2.7 6-6 6H18c-3.3 0-6-2.7-6-6z"
        fill="#2E3235"
      />
      <text
        x="24"
        y="19"
        textAnchor="middle"
        fill="#fff"
        fontSize="8"
        fontWeight="bold"
      >
        SOFORT
      </text>
    </svg>
  ),
};

// Methods that should show as text-only badges (no icon)
const TEXT_ONLY_METHODS = [
  "rechnung",
  "vorkasse",
  "lastschrift",
  "nachnahme",
  "banküberweisung",
  "überweisung",
];

interface PaymentMethodIconProps {
  method: string;
  className?: string;
}

export function PaymentMethodIcon({
  method,
  className,
}: PaymentMethodIconProps) {
  const normalizedMethod = method.toLowerCase().replace(/\s+/g, "");
  const icon = PAYMENT_ICONS[normalizedMethod];

  // Check if it's a text-only method
  const isTextOnly = TEXT_ONLY_METHODS.some((m) =>
    normalizedMethod.includes(m),
  );

  if (icon && !isTextOnly) {
    return (
      <div
        className={cn(
          "inline-flex h-[17px] w-[26px] min-w-[26px] items-center justify-center overflow-hidden rounded-[2px] border border-[#e6e6e6] bg-white",
          className,
        )}
        title={method}
      >
        {icon}
      </div>
    );
  }

  // Fallback: text badge
  return (
    <div
      className={cn(
        "inline-block h-[17px] max-w-[64px] min-w-[52px] overflow-hidden rounded-[2px] border border-[#e6e6e6] bg-white px-1 text-center text-[0.5625rem] leading-[15px] text-ellipsis whitespace-nowrap",
        className,
      )}
    >
      <span className="text-[#2d2d2d]">{method}</span>
    </div>
  );
}
