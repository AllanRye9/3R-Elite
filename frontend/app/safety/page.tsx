import { ContentPage } from '@/components/ui/ContentPage';

export default function SafetyPage() {
  return (
    <ContentPage
      eyebrow="Safety"
      title="Use the marketplace with stronger trust checks"
      intro="Most marketplace problems are avoidable if buyers and sellers slow down, verify details, and keep communication grounded in the listing itself."
      sections={[
        {
          title: 'Before you pay',
          body: [
            'Review photos closely, ask direct questions about condition, and be cautious of listings priced far below realistic market value.',
            'If a seller avoids basic verification or tries to move the conversation into a suspicious payment flow immediately, walk away.',
          ],
        },
        {
          title: 'Before you meet',
          body: [
            'Prefer public meeting places during the day and let someone else know where you are going. For high-value items, do not meet alone if you can avoid it.',
          ],
        },
        {
          title: 'For sellers',
          body: [
            'Be precise in your listing details, disclose faults upfront, and avoid releasing an item until payment is confirmed through a method you trust.',
          ],
        },
      ]}
      ctaHref="/help"
      ctaLabel="Open help center"
    />
  );
}