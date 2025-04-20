import { promises as fs } from "fs";
import path from "path";

export async function readFileContent(filePath: string): Promise<string> {
  try {
    const absolutePath = path.join(process.cwd(), filePath);
    const content = await fs.readFile(absolutePath, "utf-8");
    return content;
  } catch (error) {
    console.error("Error reading file:", error);
    throw error;
  }
}

export function getFileExtension(filePath: string): string {
  return path.extname(filePath).slice(1);
}
