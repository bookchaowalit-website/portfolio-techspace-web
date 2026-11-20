import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';
import { MDXTechStack, MDXTechStackFrontmatter } from '@/types/mdx-tech-stack';

const contentDirectory = path.join(process.cwd(), 'content/stacks');

// Ensure content directory exists
if (!fs.existsSync(contentDirectory)) {
  fs.mkdirSync(contentDirectory, { recursive: true });
}

/** YAML reads an unquoted `dateAdded: 2024-12-01` as a Date; the shell's formatDate() slices text, so keep it a
 * YYYY-MM-DD string (an invalid date becomes "", which the page shows as no date). */
export function normalizeFrontmatter(data: Record<string, unknown>): MDXTechStackFrontmatter {
  const value = data.dateAdded;
  if (!(value instanceof Date)) return data as unknown as MDXTechStackFrontmatter;
  return { ...data, dateAdded: Number.isNaN(value.getTime()) ? "" : value.toISOString().slice(0, 10) } as unknown as MDXTechStackFrontmatter;
}

export function getAllTechStackSlugs(): string[] {
  try {
    if (!fs.existsSync(contentDirectory)) {
      return [];
    }

    const getAllFiles = (dirPath: string, arrayOfFiles: string[] = []): string[] => {
      const files = fs.readdirSync(dirPath);

      files.forEach(file => {
        const fullPath = path.join(dirPath, file);
        if (fs.statSync(fullPath).isDirectory()) {
          arrayOfFiles = getAllFiles(fullPath, arrayOfFiles);
        } else if (file.endsWith('.mdx')) {
          arrayOfFiles.push(fullPath);
        }
      });

      return arrayOfFiles;
    };

    const allMdxFiles = getAllFiles(contentDirectory);
    return allMdxFiles
      .map(filePath => {
        // Extract slug from file path (only use filename, not directory path)
        const fileName = path.basename(filePath);
        return fileName.replace(/\.mdx$/, '');
      });
  } catch (error) {
    console.error('Error reading tech stack slugs:', error);
    return [];
  }
}

export function getTechStackBySlug(slug: string): MDXTechStack | null {
  try {
    // Find the file by searching through subdirectories
    const findFile = (dirPath: string): string | null => {
      const files = fs.readdirSync(dirPath);

      for (const file of files) {
        const fullPath = path.join(dirPath, file);
        if (fs.statSync(fullPath).isDirectory()) {
          const found = findFile(fullPath);
          if (found) return found;
        } else if (file === `${slug}.mdx`) {
          return fullPath;
        }
      }
      return null;
    };

    const fullPath = findFile(contentDirectory);

    if (!fullPath) {
      return null;
    }

    const fileContents = fs.readFileSync(fullPath, 'utf8');
    const { data, content } = matter(fileContents);

    const frontmatter = normalizeFrontmatter(data);

    // Calculate reading time (rough estimate)
    const wordsPerMinute = 200;
    const words = content.split(/\s+/).length;
    const minutes = Math.ceil(words / wordsPerMinute);

    return {
      ...frontmatter,
      id: slug,
      slug,
      content,
      readingTime: {
        text: `${minutes} min read`,
        minutes,
        words,
      },
    };
  } catch (error) {
    console.error(`Error reading tech stack ${slug}:`, error);
    return null;
  }
}

export function getAllTechStacks(): MDXTechStack[] {
  const slugs = getAllTechStackSlugs();
  const techStacks = slugs
    .map(slug => getTechStackBySlug(slug))
    .filter((stack): stack is MDXTechStack => stack !== null)
    .sort((a, b) => {
      // Sort by featured first, then by date added (newest first)
      if (a.featured && !b.featured) return -1;
      if (!a.featured && b.featured) return 1;
      return new Date(b.dateAdded).getTime() - new Date(a.dateAdded).getTime();
    });

  return techStacks;
}

export function getFeaturedTechStacks(): MDXTechStack[] {
  return getAllTechStacks().filter(stack => stack.featured);
}

export function getTechStacksByCategory(category: string): MDXTechStack[] {
  return getAllTechStacks().filter(stack =>
    stack.category.toLowerCase() === category.toLowerCase()
  );
}

export function getTechStacksByStatus(status: string): MDXTechStack[] {
  return getAllTechStacks().filter(stack =>
    stack.status.toLowerCase() === status.toLowerCase()
  );
}

export function searchTechStacks(query: string): MDXTechStack[] {
  const searchTerm = query.toLowerCase();
  return getAllTechStacks().filter(stack =>
    stack.name.toLowerCase().includes(searchTerm) ||
    stack.description.toLowerCase().includes(searchTerm) ||
    stack.tags.some(tag => tag.toLowerCase().includes(searchTerm)) ||
    stack.content.toLowerCase().includes(searchTerm) ||
    stack.notes?.toLowerCase().includes(searchTerm)
  );
}
