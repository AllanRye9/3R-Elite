import { ContentPage } from '@/components/ui/ContentPage';

export default function TermsPage() {
  return (
    <ContentPage
      eyebrow="Legal"
      title="Terms & Conditions of Use"
      intro="By accessing or using 3R-Elite Marketplace, you agree to be bound by these terms and conditions. Please read them carefully before using our platform."
      sections={[
        {
          title: '1. Acceptance of Terms',
          body: [
            'By creating an account or using the 3R-Elite platform, you confirm that you are at least 18 years of age and have read, understood, and agree to be legally bound by these Terms and Conditions. If you do not agree with any part of these terms, you must not use the platform.',
          ],
        },
        {
          title: '2. Platform Use & User Responsibilities',
          body: [
            'Users must provide accurate, truthful, and up-to-date information when creating listings and profiles. You are solely responsible for all content you post. Do not post misleading listings, counterfeit goods, illegal items, stolen content, or fraudulent offers.',
            'You must not attempt to circumvent platform features, engage in price manipulation, create multiple accounts to abuse the system, or use automated tools (bots, scrapers) without written permission.',
          ],
        },
        {
          title: '3. Listings & Product Standards',
          body: [
            'All listings must include accurate descriptions, genuine photos, and honest condition assessments. Pricing must be clear and in the supported currency for your region. Listings expire after 30 days unless renewed.',
            'Prohibited items include but are not limited to: illegal weapons, controlled substances, counterfeit branded goods, adult content, live animals, and items that infringe on intellectual property rights.',
          ],
        },
        {
          title: '4. Transactions & Payments',
          body: [
            'Buyers and sellers are responsible for verifying all transaction details, including item condition and delivery arrangements, directly with each other. 3R-Elite facilitates connections but does not guarantee the completion, quality, or safety of any transaction.',
            'When using the cart and checkout features, you agree to pay the full listed price plus any applicable taxes, fees, or shipping costs. Payment disputes must be raised within 7 days of the transaction.',
          ],
        },
        {
          title: '5. Fees & Commissions',
          body: [
            'Listing on 3R-Elite is free for standard users. Premium placements, featured deals, and store advertising are subject to fees as listed in our current fee schedule. We reserve the right to update fees with 30 days notice.',
          ],
        },
        {
          title: '6. Privacy & Data',
          body: [
            'Your personal data is processed in accordance with our Privacy Policy. By using the platform, you consent to our data collection and processing practices. We do not sell your personal data to third parties.',
          ],
        },
        {
          title: '7. Moderation & Account Suspension',
          body: [
            'We reserve the right to remove any listing, review, or content that violates these terms or is deemed unsafe, deceptive, abusive, or harmful at our sole discretion. Accounts found in serious or repeated violation may be suspended or permanently banned.',
            'If your account is suspended, you may appeal the decision by contacting our support team within 14 days.',
          ],
        },
        {
          title: '8. Intellectual Property',
          body: [
            '3R-Elite and its logo, design, and content are protected intellectual property. Users retain ownership of content they upload but grant 3R-Elite a non-exclusive, royalty-free license to display and promote that content on the platform.',
          ],
        },
        {
          title: '9. Limitation of Liability',
          body: [
            '3R-Elite is provided "as is" without warranties of any kind. We are not liable for any indirect, incidental, or consequential damages arising from your use of the platform, including any losses from transactions, disputes, or technical failures.',
          ],
        },
        {
          title: '10. Governing Law',
          body: [
            'These terms are governed by and construed in accordance with the laws of the United Arab Emirates. Disputes shall be resolved in the courts of Dubai, UAE, unless otherwise required by applicable local law in the user\'s jurisdiction.',
          ],
        },
        {
          title: '11. Changes to Terms',
          body: [
            'We may update these Terms and Conditions at any time. Continued use of the platform after changes are posted constitutes your acceptance of the new terms. We will notify users of significant changes via email or platform notifications.',
          ],
        },
        {
          title: '12. Contact Us',
          body: [
            'For questions about these terms, please contact us through the Help & FAQ section or via our official contact channels. We aim to respond to all enquiries within 3 business days.',
          ],
        },
      ]}
      ctaHref="/safety"
      ctaLabel="Review safety guidance"
    />
  );
}