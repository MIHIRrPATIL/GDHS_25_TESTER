import fs from "fs";
import path from "path";
import Tesseract from "tesseract.js";
import mammoth from "mammoth";
import { getDocument } from "pdfjs-dist/legacy/build/pdf.mjs";

const extractText = async (filePath) => {
  const ext = path.extname(filePath).toLowerCase();

  try {
    // Make sure file exists
    if (!fs.existsSync(filePath)) {
      throw new Error(`File does not exist: ${filePath}`);
    }

    if ([".jpg", ".jpeg", ".png", ".tiff"].includes(ext)) {
      const { data: { text } } = await Tesseract.recognize(filePath, "eng");
      return text.trim();
    }

    if (ext === ".pdf") {
      const data = new Uint8Array(await fs.promises.readFile(filePath));
      const pdf = await getDocument({ data }).promise;
      let text = "";

      for (let i = 1; i <= pdf.numPages; i++) {
        const page = await pdf.getPage(i);
        const content = await page.getTextContent();
        const pageText = content.items.map(item => item.str).join(" ");
        text += pageText + "\n";
      }

      return text.trim();
    }

    if (ext === ".docx") {
      const buffer = await fs.promises.readFile(filePath);
      const { value } = await mammoth.extractRawText({ buffer });
      return value?.trim() || "";
    }

    throw new Error(`Unsupported file format: ${ext}`);
  } catch (err) {
    console.error(`Error extracting text from ${filePath}:`, err);
    throw err;
  }
};

export default extractText;
