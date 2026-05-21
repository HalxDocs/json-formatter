// utils/transform/flatten.ts

/**
 * Flattens nested Bible-like JSON into:
 * [
 *   { book, chapter, verse, text }
 * ]
 */

interface VerseItem {
  book: string;
  chapter: number | string;
  verse: number | string;
  text: string;
  [key: string]: any;
}

export function flattenJSON(input: any): VerseItem[] {
  const result: VerseItem[] = [];

  if (!input || typeof input !== "object") return result;

  // Case: Bible Structure
  if (Array.isArray(input.books)) {
    for (const book of input.books) {
      const bookName = book.name;

      for (const chapterItem of book.chapters || []) {
        const chapterNum = chapterItem.chapter;

        for (const verse of chapterItem.verses || []) {
          result.push({
            book: bookName,
            chapter: chapterNum,
            verse: verse.verse,
            text: verse.text,
          });
        }
      }
    }
    return result;
  }

  // Fallback generic deep flattening
  const deepWalk = (obj: any, parent: any = {}) => {
    if (Array.isArray(obj)) {
      obj.forEach((item) => deepWalk(item, parent));
    } else if (typeof obj === "object" && obj !== null) {
      const merged = { ...parent, ...obj };
      if (Object.values(obj).some((v) => typeof v === "object")) {
        for (const key in obj) deepWalk(obj[key], merged);
      } else {
        result.push(merged as VerseItem);
      }
    }
  };

  deepWalk(input);
  return result;
}
