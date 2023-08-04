export function fetchBookfetchBook(
  isbn: number,
): Promise<{
  title: string;
  isbn: number;
  authors: string[];
  publisher: string;
  pubDate: number;
  msrp: number;
  image: string;
} | null>;
