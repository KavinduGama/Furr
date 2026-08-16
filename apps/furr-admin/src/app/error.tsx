"use client";

export default function AdminError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div style={{ padding: "48px 24px", textAlign: "center", maxWidth: 480, margin: "0 auto" }}>
      <div style={{ fontSize: 48, marginBottom: 16 }}>⚠️</div>
      <h2 style={{ fontSize: 20, fontWeight: 900, color: "#10242D", marginBottom: 8 }}>
        Something went wrong
      </h2>
      <p style={{ fontSize: 14, color: "#66757C", marginBottom: 24, lineHeight: 1.6 }}>
        {error.message || "An unexpected error occurred in the admin portal."}
      </p>
      <button
        onClick={reset}
        style={{
          padding: "10px 24px",
          backgroundColor: "#006B78",
          color: "#FFF",
          border: "none",
          borderRadius: 12,
          fontSize: 14,
          fontWeight: 800,
          cursor: "pointer",
        }}
      >
        Try again
      </button>
    </div>
  );
}
