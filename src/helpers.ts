import clipboardy from "clipboardy";

export const copyToClipboard = async (text: string) => {
  try {
    await clipboardy.write(text);
    console.log("Text copied to clipboard successfully!");
  } catch (error) {
    console.error("Failed to copy text to clipboard:", error);
  }
};
