import { ContentPage } from '@/components/ui/ContentPage';

export default function AdvertisingPage() {
  return (
    <ContentPage
      eyebrow="Advertising"
      title="Promote products to active local shoppers"
      intro="Advertising on 3R-Elite is aimed at merchants and brands that want direct visibility inside a marketplace already built around buyer intent."
      sections={[
        {
          title: 'Who this is for',
          body: [
            'Retailers, service providers, distributors, and local businesses can use placements to reach users already browsing by category, location, and product intent.',
          ],
        },
        {
          title: 'How to get started',
          body: [
            'Send your campaign goals, target market, and preferred timing to support@3relite.com. Include whether you want visibility in UAE, Uganda, or both.',
            'We will use that information to recommend placement options and rollout timing.',
          ],
        },
      ]}
      ctaHref="mailto:support@3relite.com"
      ctaLabel="Contact advertising"
    />
  );
}