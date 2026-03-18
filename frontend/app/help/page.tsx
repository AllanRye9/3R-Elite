import { ContentPage } from '@/components/ui/ContentPage';

export default function HelpPage() {
  return (
    <ContentPage
      eyebrow="Help Center"
      title="Answers for listing, buying, and account management"
      intro="If you are listing an item, contacting a seller, or managing your account, this page covers the core actions most users need before reaching support."
      sections={[
        {
          title: 'Creating and managing listings',
          body: [
            'Use the sell flow to add images, pricing, category details, and your preferred location. Keep titles specific and photos clear so buyers can judge the listing quickly.',
            'Once published, you can manage your own listings from your profile area and update availability as the item status changes.',
          ],
        },
        {
          title: 'Buying safely',
          body: [
            'Read the item description fully, confirm condition details with the seller, and avoid rushing into payment for listings that look incomplete or suspicious.',
            'For additional precautions, review the dedicated safety guidance before meeting or paying a seller.',
          ],
        },
        {
          title: 'Need direct support?',
          body: [
            'For account issues or listing problems that you cannot resolve in-app, contact support at support@3relite.com and include the email tied to your account.',
          ],
        },
      ]}
      ctaHref="/safety"
      ctaLabel="Read safety tips"
    />
  );
}