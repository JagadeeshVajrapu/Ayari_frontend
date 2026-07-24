import { ContentPageShell, aboutMetadata } from '@/components/common/content-page-shell';

export const metadata = aboutMetadata;

export default function AboutPage() {
  return (
    <ContentPageShell
      eyebrow="Our story"
      title="About Ayari Creations"
      description="We design and craft thoughtful home décor and gifts — pieces that feel personal, handmade, and ready to gift."
    >
      <section>
        <h2 className="font-display text-2xl text-foreground">Why Ayari</h2>
        <p className="mt-3">
          Ayari is built around small-batch craftsmanship: wall hangings, candles, keychains,
          mirrors, bouquets, and table décor made to brighten everyday spaces.
        </p>
      </section>

      <section id="craft">
        <h2 className="font-display text-2xl text-foreground">Our craft</h2>
        <p className="mt-3">
          Every product is curated for finish, colour, and gifting ease. From mandala plates to
          resin keepsakes, we focus on details that photograph well and feel special in person.
        </p>
      </section>

      <section>
        <h2 className="font-display text-2xl text-foreground">Made for gifting</h2>
        <p className="mt-3">
          Looking for housewarming, festival, or personalised presents? Browse our Gift Shop and
          Featured collections — each item ships carefully packed.
        </p>
      </section>
    </ContentPageShell>
  );
}
