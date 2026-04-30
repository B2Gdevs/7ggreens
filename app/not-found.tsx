import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { cid } from "@/lib/vcs/cid";

export default function NotFound() {
  return (
    <section
      data-cid={cid("404")}
      className="grain-overlay relative flex min-h-[70vh] items-center justify-center px-[var(--section-px)]"
    >
      <div className="text-center">
        <p className="eyebrow">Off the trail</p>
        <h1
          className="font-display mt-4 leading-[0.9]"
          style={{ fontSize: "var(--text-display-xl)" }}
        >
          404
        </h1>
        <p className="mt-6 max-w-md text-base text-[var(--color-charcoal-soft)] mx-auto">
          We don't grow that here. Try the home page or head straight for the boxes.
        </p>
        <div className="mt-10 flex items-center justify-center gap-4">
          <Link href="/" className="btn-primary">
            <ArrowLeft size={16} />
            Home
          </Link>
          <Link href="/boxes" className="btn-secondary">
            See the boxes
          </Link>
        </div>
      </div>
    </section>
  );
}
