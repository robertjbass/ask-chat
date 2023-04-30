import clipboardy from "clipboardy";

export const copyToClipboard = async (text: string) => {
  try {
    await clipboardy.write(text);
  } catch (error) {
    console.error("Failed to copy text to clipboard:", error);
  }
};

export const sanitize = (name: string) => {
  return name
    .toLowerCase()
    .split(" ")
    .join("")
    .split("-")
    .join("")
    .split("_")
    .join("");
};
