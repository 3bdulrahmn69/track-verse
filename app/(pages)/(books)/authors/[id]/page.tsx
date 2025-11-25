import Image from 'next/image';
import { FiCalendar, FiBookOpen } from 'react-icons/fi';
import {
  getAuthorDetails,
  getAuthorWorks,
  getAuthorPhotoUrl,
  formatBio,
} from '@/lib/books';
import { notFound } from 'next/navigation';
import BackButton from '@/components/shared/back-button';
import { BookCard } from '@/components/tabs/books/book-card';

interface AuthorPageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function AuthorPage({ params }: AuthorPageProps) {
  const { id: authorParam } = await params;
  const authorId = authorParam;

  if (!authorId) {
    notFound();
  }

  let author;
  let works;

  try {
    author = await getAuthorDetails(authorId);
  } catch (error) {
    console.error('Failed to fetch author details:', error);
    notFound();
  }

  try {
    works = await getAuthorWorks(authorId, 20);
  } catch (error) {
    console.error('Failed to fetch author works:', error);
    // If we can't fetch works, still show the author page but with empty works
    works = { numFound: 0, docs: [], start: 0 };
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Backdrop */}
      <div className="relative h-[50vh] md:h-[70vh] w-full bg-linear-to-br from-primary/20 to-secondary/20">
        {author.photos?.[0] && (
          <Image
            src={getAuthorPhotoUrl(author.photos[0], 'L')}
            alt={author.name}
            fill
            className="object-cover opacity-30"
            priority
            sizes="100vw"
          />
        )}
        <div className="absolute inset-0 bg-linear-to-t from-background via-background/60 to-transparent" />
      </div>

      {/* Content */}
      <div className="container mx-auto px-4 -mt-32 relative z-10 pb-12">
        <div className="mb-6">
          <BackButton variant="outline" />
        </div>
        <div className="flex flex-col md:flex-row gap-8">
          {/* Author Photo */}
          <div className="shrink-0">
            <div className="relative w-64 aspect-square rounded-lg overflow-hidden shadow-2xl bg-muted">
              {author.photos?.[0] ? (
                <Image
                  src={getAuthorPhotoUrl(author.photos[0], 'L')}
                  alt={author.name}
                  fill
                  className="object-cover"
                  sizes="256px"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                  <FiBookOpen className="w-16 h-16" />
                </div>
              )}
            </div>
          </div>

          {/* Details */}
          <div className="flex-1">
            <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-2">
              {author.name}
            </h1>

            {/* Birth Date */}
            {author.birth_date && (
              <div className="flex items-center gap-2 text-foreground mb-4">
                <FiCalendar className="w-5 h-5" />
                <span>Born: {author.birth_date}</span>
              </div>
            )}

            {/* Works Count */}
            <div className="flex items-center gap-2 text-foreground mb-6">
              <FiBookOpen className="w-5 h-5" />
              <span>{works.numFound} works</span>
            </div>

            {/* Bio */}
            {formatBio(author.bio) && (
              <div className="mb-6">
                <h2 className="text-2xl font-semibold text-foreground mb-3">
                  Biography
                </h2>
                <p className="text-foreground leading-relaxed">
                  {formatBio(author.bio)}
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Author's Works */}
        <section className="mt-12">
          <h2 className="text-3xl font-bold text-foreground mb-6">
            Works by {author.name}
          </h2>

          {works.docs.length > 0 ? (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
              {works.docs.slice(0, 20).map((book) => (
                <BookCard key={book.key} book={book} />
              ))}
            </div>
          ) : (
            <div className="flex items-center justify-center py-12">
              <p className="text-muted-foreground text-lg">
                No works found for this author
              </p>
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
