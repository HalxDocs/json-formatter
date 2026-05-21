// utils/transform/grouped.ts

/**
 * Group JSON into:
 * {
 *   BookName: {
 *     Chapter: {
 *       Verse: "Text"
 *     }
 *   }
 * }
 */

export function groupJSON(input: any) {
  const grouped: Record<string, any> = {};

  if (!input || typeof input !== "object") return grouped;

  // Bible-like structure
  if (Array.isArray(input.books)) {
    for (const book of input.books) {
      const bookName = book.name;
      if (!grouped[bookName]) grouped[bookName] = {};

      for (const chapter of book.chapters || []) {
        const chapNum = chapter.chapter.toString();
        if (!grouped[bookName][chapNum]) grouped[bookName][chapNum] = {};

        for (const verse of chapter.verses || []) {
          const verseNum = verse.verse.toString();
          grouped[bookName][chapNum][verseNum] = verse.text;
        }
      }
    }
    return grouped;
  }

  // Fallback: group by keys automatically
  function autoGroup(obj: any, depth = 0, path: string[] = []) {
    if (Array.isArray(obj)) {
      obj.forEach((v, i) => autoGroup(v, depth + 1, [...path, `${i}`]));
    } else if (typeof obj === "object" && obj !== null) {
      const keys = Object.keys(obj);

      if (keys.includes("book") && keys.includes("chapter") && keys.includes("verse")) {
        const { book, chapter, verse, text } = obj;

        if (!grouped[book]) grouped[book] = {};
        if (!grouped[book][chapter]) grouped[book][chapter] = {};

        grouped[book][chapter][verse] = text || "";
      } else {
        keys.forEach((k) => autoGroup(obj[k], depth + 1, [...path, k]));
      }
    }
  }

  autoGroup(input);
  return grouped;
}
