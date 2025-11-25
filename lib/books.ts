// Open Library API integration
const OPEN_LIBRARY_BASE_URL = 'https://openlibrary.org';
const COVERS_BASE_URL = 'https://covers.openlibrary.org/b';

export interface Book {
  key: string;
  title: string;
  author_name?: string[];
  first_publish_year?: number;
  cover_i?: number;
  isbn?: string[];
  publisher?: string[];
  number_of_pages_median?: number;
  subject?: string[];
}

export interface BookDetails {
  key: string;
  title: string;
  description?: string | { value: string };
  authors?: Array<{ author: { key: string }; type?: { key: string } }>;
  covers?: number[];
  subjects?: string[];
  first_publish_date?: string;
  publishers?: string[];
  number_of_pages?: number;
  isbn_13?: string[];
  isbn_10?: string[];
}

export interface BookSearchResult {
  numFound: number;
  docs: Book[];
  start: number;
}

export interface AuthorDetails {
  key: string;
  name: string;
  birth_date?: string;
  bio?: string | { value: string };
  photos?: number[];
}

export interface AuthorWork {
  key: string;
  title: string;
  first_publish_date?: string;
  covers?: number[];
  subjects?: string[];
}

// Get book cover URL
export function getCoverUrl(
  coverId: number | undefined,
  size: 'S' | 'M' | 'L' = 'M'
): string {
  if (!coverId) {
    return '/assets/placeholder-book.jpg';
  }
  return `${COVERS_BASE_URL}/id/${coverId}-${size}.jpg`;
}

// Get author photo URL
export function getAuthorPhotoUrl(
  photoId: number | undefined,
  size: 'S' | 'M' | 'L' = 'M'
): string {
  if (!photoId) {
    return '/placeholder-author.png';
  }
  return `https://covers.openlibrary.org/a/id/${photoId}-${size}.jpg`;
}

// Search books
export async function searchBooks(
  query: string,
  page: number = 1,
  limit: number = 20
): Promise<BookSearchResult> {
  const offset = (page - 1) * limit;
  const response = await fetch(
    `${OPEN_LIBRARY_BASE_URL}/search.json?q=${encodeURIComponent(
      query
    )}&limit=${limit}&offset=${offset}&fields=key,title,author_name,first_publish_year,cover_i,isbn,publisher,number_of_pages_median,subject`,
    { next: { revalidate: 3600 } } // Cache for 1 hour
  );

  if (!response.ok) {
    throw new Error('Failed to search books');
  }

  return response.json();
}

// Get trending/popular books (subjects with most works)
export async function getTrendingBooks(
  limit: number = 20
): Promise<BookSearchResult> {
  const response = await fetch(
    `${OPEN_LIBRARY_BASE_URL}/search.json?q=${encodeURIComponent(
      'trending_score_hourly_sum:[1 TO *] -subject:"content_warning:cover" language:eng'
    )}&limit=${limit}&sort=trending&fields=key,title,author_name,first_publish_year,cover_i,isbn,publisher,number_of_pages_median,subject`,
    { next: { revalidate: 3600 } }
  );

  if (!response.ok) {
    throw new Error('Failed to fetch trending books');
  }

  return response.json();
}

// Get book details
export async function getBookDetails(workId: string): Promise<BookDetails> {
  // Remove /works/ prefix if present
  const cleanId = workId.replace('/works/', '');

  // Fetch work details
  const workResponse = await fetch(
    `${OPEN_LIBRARY_BASE_URL}/works/${cleanId}.json`,
    { next: { revalidate: 3600 } }
  );

  if (!workResponse.ok) {
    throw new Error('Failed to fetch book details');
  }

  const workData = await workResponse.json();

  // Check if work data already has number_of_pages
  let numberOfPages: number | undefined = workData.number_of_pages;

  // If not, try to get number_of_pages from editions
  if (!numberOfPages) {
    try {
      const editionsResponse = await fetch(
        `${OPEN_LIBRARY_BASE_URL}/works/${cleanId}/editions.json?limit=5`,
        { next: { revalidate: 3600 } }
      );

      if (editionsResponse.ok) {
        const editionsData = await editionsResponse.json();
        // Get the first edition's page count
        if (editionsData.entries && editionsData.entries.length > 0) {
          // Try to find an edition with number_of_pages
          for (const edition of editionsData.entries) {
            if (edition.number_of_pages) {
              numberOfPages = edition.number_of_pages;
              break;
            }
          }
        }
      }
    } catch (error) {
      // If editions fetch fails, continue without page count
      console.warn('Failed to fetch edition details for page count:', error);
    }
  }

  // Return work data with number_of_pages from editions if available
  return {
    ...workData,
    number_of_pages: numberOfPages,
  };
}

// Get author details
export async function getAuthorDetails(
  authorId: string
): Promise<AuthorDetails> {
  // Remove /authors/ prefix if present
  const cleanId = authorId.replace('/authors/', '');
  const response = await fetch(
    `${OPEN_LIBRARY_BASE_URL}/authors/${cleanId}.json`,
    { next: { revalidate: 3600 } }
  );

  if (!response.ok) {
    throw new Error('Failed to fetch author details');
  }

  return response.json();
}

// Get author's works/books
export async function getAuthorWorks(
  authorId: string,
  limit: number = 50
): Promise<BookSearchResult> {
  // Remove /authors/ prefix if present
  const cleanId = authorId.replace('/authors/', '');
  const response = await fetch(
    `${OPEN_LIBRARY_BASE_URL}/authors/${cleanId}/works.json?limit=${limit}`,
    { next: { revalidate: 3600 } }
  );

  if (!response.ok) {
    throw new Error('Failed to fetch author works');
  }

  const data = await response.json();

  // Transform the works data to match BookSearchResult format
  return {
    numFound: data.size || data.entries?.length || 0,
    docs: (data.entries || []).map((work: AuthorWork) => ({
      key: work.key,
      title: work.title,
      author_name: [data.name], // Use author name from the response
      first_publish_year: work.first_publish_date
        ? new Date(work.first_publish_date).getFullYear()
        : undefined,
      cover_i: work.covers?.[0],
      subject: work.subjects || [],
    })),
    start: 0,
  };
}

// Get books by subject
export async function getBooksBySubject(
  subject: string,
  limit: number = 20
): Promise<BookSearchResult> {
  const response = await fetch(
    `${OPEN_LIBRARY_BASE_URL}/search.json?subject=${encodeURIComponent(
      subject
    )}&limit=${limit}&fields=key,title,author_name,first_publish_year,cover_i,isbn,publisher,number_of_pages_median,subject`,
    { next: { revalidate: 3600 } }
  );

  if (!response.ok) {
    throw new Error('Failed to fetch books by subject');
  }

  return response.json();
}

// Extract work ID from book key
export function getWorkId(key: string): string {
  return key.replace('/works/', '');
}

// Format description (handle both string and object formats)
export function formatDescription(
  description: string | { value: string } | undefined
): string {
  if (!description) return '';
  if (typeof description === 'string') return description;
  return description.value || '';
}

// Format bio (handle both string and object formats)
export function formatBio(bio: string | { value: string } | undefined): string {
  if (!bio) return '';
  if (typeof bio === 'string') return bio;
  return bio.value || '';
}
