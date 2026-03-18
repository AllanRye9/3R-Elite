import { ContentPage } from '@/components/ui/ContentPage';

export default function BlogPage() {
  return (
    <ContentPage
      eyebrow="Blog"
      title="Marketplace insights and product updates"
      intro="The editorial section is being prepared for launch. Until then, this route stays live so shared links, footer navigation, and route prefetches resolve cleanly."
      sections={[
        {
          title: 'What to expect',
          body: [
            'We will publish safety guides, selling tips, local market observations, and feature announcements for buyers and sellers using the platform daily.',
          ],
        },
        {
          title: 'In the meantime',
          body: [
            'You can keep browsing live inventory, save listings, and create your own listing immediately from the main marketplace experience.',
          ],
        },
      ]}
      ctaHref="/listings"
      ctaLabel="Explore listings"
    />
  );
}