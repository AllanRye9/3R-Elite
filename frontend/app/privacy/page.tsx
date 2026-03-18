import { ContentPage } from '@/components/ui/ContentPage';

export default function PrivacyPage() {
  return (
    <ContentPage
      eyebrow="Privacy"
      title="How account and listing data is handled"
      intro="This summary explains the basic categories of information the platform needs in order to authenticate users, display listings, and operate marketplace features."
      sections={[
        {
          title: 'Information you provide',
          body: [
            'Account registration details, listing content, profile updates, and messages sent through the product may be processed so the marketplace can function correctly.',
          ],
        },
        {
          title: 'How the data is used',
          body: [
            'Data is used to authenticate your account, render your listings, support moderation workflows, and improve the reliability and safety of the marketplace.',
          ],
        },
        {
          title: 'Questions or requests',
          body: [
            'If you need help related to account data or profile information, contact support@3relite.com and include the email associated with your account.',
          ],
        },
      ]}
      ctaHref="mailto:support@3relite.com"
      ctaLabel="Contact support"
    />
  );
}