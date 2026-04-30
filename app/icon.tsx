import { ImageResponse } from "next/og";

export const size = { width: 64, height: 64 };
export const contentType = "image/png";

export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#3F5828",
          color: "#FAF6EE",
          fontFamily: "Georgia, serif",
          fontWeight: 700,
          fontSize: 36,
          letterSpacing: "-0.02em",
        }}
      >
        7
      </div>
    ),
    size
  );
}
