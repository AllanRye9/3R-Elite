import { ContentPage } from '@/components/ui/ContentPage';

export default function TermsPage() {
  return (
    <ContentPage
      eyebrow="Terms"
      title="Marketplace usage expectations"
      intro="Using 3R-Elite means using the platform in good faith: accurate listings, lawful conduct, and respectful interaction with other users."
      sections={[
        {
          title: 'Your responsibilities',
          body: [
            'Do not post misleading listings, illegal goods, stolen content, or fraudulent offers. Keep account details accurate and do not attempt to abuse platform features.',
          ],
        },
        {
          title: 'Platform moderation',
          body: [
            'Listings, reviews, and user activity may be moderated when content appears unsafe, deceptive, abusive, or inconsistent with marketplace rules.',
          ],
        },
        {
          title: 'Transactions',
          body: [
            'Buyers and sellers are responsible for verifying transaction details directly. The platform helps users connect, but each party still needs to exercise normal commercial judgment.',
          ],
        },
      ]}
      ctaHref="/safety"
      ctaLabel="Review safety guidance"
    />
  );
}