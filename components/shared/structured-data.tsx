export function StructuredData() {
  const structuredData = {
    '@context': 'https://schema.org',
    '@type': 'WebApplication',
    name: 'Track Verse',
    description:
      'Track and organize your favorite movies, TV shows, books, and video games all in one place. Discover new content, share reviews, and connect with friends.',
    url: 'https://track-verse.vercel.app',
    applicationCategory: 'Entertainment',
    operatingSystem: 'Web Browser',
    offers: {
      '@type': 'Offer',
      price: '0',
      priceCurrency: 'USD',
    },
    aggregateRating: {
      '@type': 'AggregateRating',
      ratingValue: '4.8',
      ratingCount: '150',
    },
    featureList: [
      'Track movies and TV shows',
      'Track books and video games',
      'Create custom watchlists',
      'Write and share reviews',
      'Connect with friends',
      'Discover new content',
      'Personalized recommendations',
    ],
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
    />
  );
}
