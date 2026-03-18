import { ContentPage } from '@/components/ui/ContentPage';

export default function PressPage() {
  return (
    <ContentPage
      eyebrow="Press"
      title="Media information and marketplace background"
      intro="For journalists, researchers, and partners looking for a direct contact point, this page provides a stable press route and a clear path for outreach."
      sections={[
        {
          title: 'Press inquiries',
          body: [
            'Please send interview requests, product questions, and story context requests to support@3relite.com with press in the subject line.',
          ],
        },
        {
          title: 'What 3R-Elite covers',
          body: [
            'The marketplace supports buying and selling across categories relevant to day-to-day local commerce, with country-aware browsing for UAE and Uganda.',
          ],
        },
      ]}
      ctaHref="mailto:support@3relite.com"
      ctaLabel="Contact press"
    />
  );
}