"use client"

import * as React from "react"

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  React.useEffect(() => {
    console.error("WedPlan root error:", error)
  }, [error])

  return (
    <html lang="en">
      <body
        style={{
          margin: 0,
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#f7f2e9",
          color: "#2b2118",
          fontFamily: "Georgia, 'Times New Roman', serif",
          padding: "24px",
        }}
      >
        <main
          style={{
            width: "100%",
            maxWidth: "460px",
            background: "#fffdf9",
            border: "1px solid #e8decd",
            borderRadius: "12px",
            padding: "36px 24px",
            textAlign: "center",
            boxShadow: "0 2px 12px rgba(60,40,25,0.04)",
          }}
        >
          <p
            style={{
              margin: 0,
              fontSize: "0.7rem",
              letterSpacing: "0.22em",
              textTransform: "uppercase",
              color: "#b08a3e",
              fontWeight: 600,
            }}
          >
            Error 500
          </p>
          <h1 style={{ fontSize: "2rem", fontWeight: 500, margin: "12px 0" }}>
            Something went wrong
          </h1>
          <p
            style={{
              margin: "0 auto",
              maxWidth: "22rem",
              fontSize: "0.9rem",
              lineHeight: 1.6,
              color: "rgba(43,33,24,0.6)",
            }}
          >
            We couldn&apos;t load the site. Please reload and try again.
          </p>
          {error.digest ? (
            <p
              style={{
                marginTop: "16px",
                fontSize: "0.65rem",
                color: "rgba(43,33,24,0.35)",
              }}
            >
              Reference: {error.digest}
            </p>
          ) : null}
          <button
            type="button"
            onClick={reset}
            style={{
              marginTop: "24px",
              height: "44px",
              padding: "0 22px",
              border: 0,
              borderRadius: "8px",
              background: "#7a1f3d",
              color: "#f8f2e7",
              fontSize: "0.875rem",
              cursor: "pointer",
            }}
          >
            Try again
          </button>
        </main>
      </body>
    </html>
  )
}
