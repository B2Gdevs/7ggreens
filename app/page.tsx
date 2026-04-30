import { Hero } from "@/components/sections/Hero";
import { Differentiators } from "@/components/sections/Differentiators";
import { FounderStory } from "@/components/sections/FounderStory";
import { ColdChain } from "@/components/sections/ColdChain";
import { BoxesPreview } from "@/components/sections/BoxesPreview";
import { GetOnTheList } from "@/components/sections/GetOnTheList";

export default function HomePage() {
  return (
    <>
      <Hero />
      <hr className="divider-sage mx-auto max-w-[var(--content-max)]" />
      <Differentiators />
      <FounderStory />
      <ColdChain />
      <BoxesPreview />
      <GetOnTheList />
    </>
  );
}
