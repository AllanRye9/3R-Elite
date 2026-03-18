import { ContentPage } from '@/components/ui/ContentPage';

export default function AboutPage() {
  return (
    <ContentPage
      eyebrow="About 3R-Elite"
      title="A marketplace built for trusted local trade"
      intro="3R-Elite connects buyers and sellers across UAE and Uganda with fast discovery, local relevance, and clearer trust signals for every listing."
      sections={[
        {
          title: 'What we do',
          body: [
            'We make it easier to sell everyday goods, premium inventory, and in-demand local products without getting buried in cluttered classified experiences.',
            'The platform is designed around practical actions: list quickly, filter by region, contact sellers directly, and manage your account from one place.',
          ],
        },
        {
          title: 'Where we operate',
          body: [
            '3R-Elite is currently focused on UAE and Uganda, with country-aware browsing that helps shoppers see listings relevant to their own market.',
            'That regional focus lets us keep the experience simpler and more useful than a generic global marketplace.',
          ],
        },
      ]}
      ctaHref="/listings/create"
      ctaLabel="Start selling"
    />
  );
}