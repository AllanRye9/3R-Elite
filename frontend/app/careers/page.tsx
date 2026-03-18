import { ContentPage } from '@/components/ui/ContentPage';

export default function CareersPage() {
  return (
    <ContentPage
      eyebrow="Careers"
      title="Work on marketplace tools for real local commerce"
      intro="We are building a marketplace that has to work for buyers, sellers, and moderators in two very different operating environments. That requires practical product thinking and disciplined execution."
      sections={[
        {
          title: 'Areas of interest',
          body: [
            'We are interested in people who can improve product experience, trust and safety workflows, marketplace operations, and platform reliability.',
          ],
        },
        {
          title: 'How to apply',
          body: [
            'Send a short introduction, your area of expertise, and relevant work samples to support@3relite.com. We review applicants based on demonstrated execution, not inflated job titles.',
          ],
        },
      ]}
      ctaHref="mailto:support@3relite.com"
      ctaLabel="Send an introduction"
    />
  );
}