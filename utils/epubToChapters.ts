// utils/epubToChapters.ts
import EPub from "epub";
import { promisify } from "util";

export async function extractChaptersFromEPUB(epubPath: string) {
  return new Promise<any[]>((resolve, reject) => {
    const epub = new EPub(epubPath);

    epub.on("error", (err) => reject(err));

    epub.on("end", async () => {
      const chapters = [];

      for (let i = 0; i < epub.flow.length; i++) {
        const item = epub.flow[i];

        const getChapterAsync = promisify(epub.getChapter.bind(epub));
        try {
          const content = await getChapterAsync(item.id);
          chapters.push({
            chapterNumber: i + 1,
            chapterTitle: item.title || `Chapter ${i + 1}`,
            content,
          });
        } catch (err) {
          console.error("Failed to get chapter:", item.id, err);
        }
      }

      resolve(chapters);
    });

    epub.parse();
  });
}
