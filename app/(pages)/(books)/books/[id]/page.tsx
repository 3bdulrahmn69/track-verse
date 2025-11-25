import Image from 'next/image';
import { FiCalendar, FiBook } from 'react-icons/fi';
import {
  getBookDetails,
  getAuthorDetails,
  getBooksBySubject,
  getCoverUrl,
  formatDescription,
  Book,
} from '@/lib/books';
import { notFound } from 'next/navigation';
import BackButton from '@/components/shared/back-button';
import BookActions from '@/components/tabs/books/book-actions';
import { BookDetailsTabs } from '@/components/tabs/books/book-details-tabs';

interface BookPageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function BookPage({ params }: BookPageProps) {
  const { id: bookParam } = await params;
  const bookId = bookParam;

  if (!bookId) {
    notFound();
  }

  const book = await getBookDetails(bookId);

  const [authorDetailsArray, similarBooks] = await Promise.all([
    Promise.all(
      book.authors?.map((author) =>
        author.author?.key
          ? getAuthorDetails(author.author.key).catch(() => null)
          : Promise.resolve(null)
      ) || []
    ),
    getBooksBySubject(book.subjects?.[0] || 'fiction', 10),
  ]);

  const bookObject: Book = {
    key: bookId,
    title: book.title,
    author_name: authorDetailsArray
      .map((details) => details?.name || 'Unknown Author')
      .filter(Boolean),
    cover_i: book.covers?.[0],
    first_publish_year: book.first_publish_date
      ? new Date(book.first_publish_date).getFullYear()
      : undefined,
    subject: book.subjects || [],
    number_of_pages_median: book.number_of_pages,
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Backdrop Image */}
      <div className="relative h-[50vh] md:h-[70vh] w-full bg-linear-to-br from-primary/20 to-secondary/20">
        {book.covers?.[0] && (
          <Image
            src={getCoverUrl(book.covers[0], 'L')}
            alt={book.title}
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
          {/* Cover */}
          <div className="shrink-0">
            <div className="relative w-64 aspect-3/4 rounded-lg overflow-hidden shadow-2xl bg-muted">
              {book.covers?.[0] ? (
                <Image
                  src={getCoverUrl(book.covers[0], 'L')}
                  alt={book.title}
                  fill
                  className="object-cover"
                  sizes="256px"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                  <FiBook className="w-16 h-16" />
                </div>
              )}
            </div>
          </div>

          {/* Details */}
          <div className="flex-1">
            <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-2">
              {book.title}
            </h1>

            {/* Authors */}
            {book.authors && book.authors.length > 0 && (
              <div className="mb-4">
                <span className="text-foreground font-medium">By: </span>
                {book.authors.map((author, index) => (
                  <span key={index}>
                    {author.author?.key ? (
                      <a
                        href={`/authors/${author.author.key.replace(
                          '/authors/',
                          ''
                        )}`}
                        className="text-primary hover:underline"
                      >
                        {authorDetailsArray[index]?.name || 'Unknown Author'}
                      </a>
                    ) : (
                      <span className="text-foreground">
                        {authorDetailsArray[index]?.name || 'Unknown Author'}
                      </span>
                    )}
                    {index < book.authors!.length - 1 && ', '}
                  </span>
                ))}
              </div>
            )}

            {/* Meta Information */}
            <div className="flex flex-wrap items-center gap-4 mb-6">
              {book.first_publish_date && (
                <div className="flex items-center gap-2 text-foreground">
                  <FiCalendar className="w-5 h-5" />
                  <span>{new Date(book.first_publish_date).getFullYear()}</span>
                </div>
              )}

              {book.number_of_pages && (
                <div className="flex items-center gap-2 text-foreground">
                  <FiBook className="w-5 h-5" />
                  <span>{book.number_of_pages} pages</span>
                </div>
              )}
            </div>

            {/* Publishers */}
            {book.publishers && book.publishers.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-6">
                {book.publishers.slice(0, 3).map((publisher, index) => (
                  <span
                    key={index}
                    className="px-3 py-1 rounded-full bg-secondary/20 text-secondary text-sm font-medium"
                  >
                    {publisher}
                  </span>
                ))}
              </div>
            )}

            {/* Action Buttons */}
            <div className="mb-6">
              <BookActions book={bookObject} />
            </div>

            {/* Overview */}
            {formatDescription(book.description) && (
              <div className="mb-6">
                <h2 className="text-2xl font-semibold text-foreground mb-3">
                  Overview
                </h2>
                <p className="text-foreground leading-relaxed">
                  {formatDescription(book.description)}
                </p>
              </div>
            )}

            {/* Subjects */}
            {book.subjects && book.subjects.length > 0 && (
              <div className="mb-6">
                <h3 className="text-xl font-semibold text-foreground mb-3">
                  Subjects
                </h3>
                <div className="flex flex-wrap gap-2">
                  {book.subjects.slice(0, 10).map((subject, index) => (
                    <span
                      key={index}
                      className="px-3 py-1 rounded-full bg-muted text-muted-foreground text-sm"
                    >
                      {subject}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Additional Info */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {book.isbn_13 && book.isbn_13.length > 0 && (
                <div>
                  <h4 className="text-sm font-semibold text-muted-foreground mb-1">
                    ISBN-13
                  </h4>
                  <p className="text-foreground">{book.isbn_13[0]}</p>
                </div>
              )}

              {book.isbn_10 && book.isbn_10.length > 0 && (
                <div>
                  <h4 className="text-sm font-semibold text-muted-foreground mb-1">
                    ISBN-10
                  </h4>
                  <p className="text-foreground">{book.isbn_10[0]}</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Similar Books and Reviews Tabs */}
        <section className="mt-12">
          <BookDetailsTabs
            bookId={book.key}
            bookTitle={book.title}
            similarBooks={similarBooks.docs.filter((b) => b.key !== book.key)}
          />
        </section>
      </div>
    </div>
  );
}
