import { ImageResponse } from "next/og";

export const alt = "7Greens — Field-fresh produce from Tyler, Texas";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: "72px",
          background:
            "linear-gradient(135deg, #FAF6EE 0%, #F4EFE3 50%, #E8DFCB 100%)",
          color: "#1C1A14",
          fontFamily: "system-ui, sans-serif",
          position: "relative",
        }}
      >
        <div
          style={{
            position: "absolute",
            top: -120,
            right: -120,
            width: 480,
            height: 480,
            borderRadius: "50%",
            background: "rgba(92, 122, 61, 0.18)",
            filter: "blur(30px)",
          }}
        />
        <div
          style={{
            position: "absolute",
            bottom: -100,
            left: -80,
            width: 360,
            height: 360,
            borderRadius: "50%",
            background: "rgba(200, 163, 92, 0.18)",
            filter: "blur(30px)",
          }}
        />

        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          <span
            style={{
              fontSize: 32,
              letterSpacing: "0.18em",
              textTransform: "uppercase",
              fontWeight: 600,
              color: "#3F5828",
            }}
          >
            7Greens · UPAEC
          </span>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <div
            style={{
              fontSize: 96,
              lineHeight: 1.0,
              letterSpacing: "-0.02em",
              fontWeight: 700,
              fontFamily: "Georgia, serif",
            }}
          >
            Healthy Land.
          </div>
          <div
            style={{
              fontSize: 96,
              lineHeight: 1.0,
              letterSpacing: "-0.02em",
              fontWeight: 700,
              fontFamily: "Georgia, serif",
              color: "#3F5828",
              fontStyle: "italic",
            }}
          >
            Healthy Greens.
          </div>
          <div
            style={{
              fontSize: 96,
              lineHeight: 1.0,
              letterSpacing: "-0.02em",
              fontWeight: 700,
              fontFamily: "Georgia, serif",
            }}
          >
            Healthy People.
          </div>
        </div>

        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end" }}>
          <span style={{ fontSize: 24, color: "#5A5347" }}>
            Field-fresh boxes · Tyler, TX → DFW · No subscription
          </span>
          <span
            style={{
              fontSize: 18,
              padding: "12px 28px",
              border: "1px solid #1C1A14",
              borderRadius: 999,
            }}
          >
            7greens.farm/boxes
          </span>
        </div>
      </div>
    ),
    size
  );
}
