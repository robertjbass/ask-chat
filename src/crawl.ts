import fs from "fs";
import path from "path";

type FileNode = {
  name: string;
  type: "file" | "directory";
  parentFolder: string;
  fileType?: string;
  children?: FileNode[];
};

export const generateFileTree = (
  basePath: string = process.cwd()
): Promise<FileNode[]> => {
  const excluded = [
    ".git",
    "node_modules",
    "dist",
    "build",
    "tmp",
    "temp",
    "logs",
    "log",
    "bin",
    "obj",
    "out",
    "lib",
    "package-lock.json",
    ".env",
  ];
  return new Promise((resolve, reject) => {
    fs.readdir(basePath, { withFileTypes: true }, (err, files) => {
      if (err) return reject(err);

      const includedFiles = files.filter(
        (file) => !excluded.includes(file.name)
      );

      const nodes: Promise<FileNode>[] = includedFiles.map((file) => {
        const filePath = path.join(basePath, file.name);
        const node: FileNode = {
          name: file.name,
          parentFolder: basePath,
          type: file.isDirectory() ? "directory" : "file",
          fileType: file.isDirectory() ? undefined : file.name.split(".")[1],
        };

        if (node.type === "directory") {
          return generateFileTree(filePath).then((children: any) => {
            node.children = children;
            return node;
          });
        }

        return Promise.resolve(node);
      });

      Promise.all(nodes).then(resolve as any);
    });
  });
};

export const printFileTreeString = (nodes: FileNode[]) => {
  const workDir = process.cwd();
  const projectFolder = nodes[0].parentFolder.replace(workDir, "").trim();
  const tree: string[] = [projectFolder];
  const printNode = (node: FileNode) => {
    const parentFolder = node.parentFolder.replace(workDir, "");
    const nodeName = node.name;
    const treeNode = `${parentFolder}/${nodeName}`.replace("/", "");

    tree.push(treeNode);

    if (node.children) {
      node.children.forEach((child) => printNode(child));
    }
  };

  nodes.forEach((node) => printNode(node));

  return tree.join("\n").split(workDir).join("");
};

export const printFileTree = (
  nodes: FileNode[],
  returnType: "string" | "object"
) => {
  const structure: any = {};
  const folders: string[] = ["/"];
  const files: string[] = [];

  const addEntry = (node: FileNode) => {
    const isFolder = node.type === "directory";
    if (isFolder) {
      const folderPath =
        `${node.parentFolder}/${node.name}`.replace(process.cwd(), "").trim() ||
        "/";

      folders.push(folderPath);
    } else {
      const filePath = `${node.parentFolder}/${node.name}`
        .replace(process.cwd(), "")
        .trim();

      files.push(filePath);
    }

    if (node.children) {
      node.children.forEach((child) => addEntry(child));
    }
  };

  nodes.forEach((node) => addEntry(node));

  const sortedFiles = files.sort((a, b) => a.length - b.length).reverse();
  sortedFiles.forEach((file) => {
    const folder = file.split("/").slice(0, -1).join("/") || "/";
    const fileName = file.split("/").slice(-1)[0];

    if (!structure[folder]) structure[folder] = [];
    structure[folder].push(fileName);
  });

  const ordered: any = {};

  Object.keys(structure)
    .reverse()
    .forEach((key) => {
      ordered[key] = structure[key];
    });

  if (returnType === "object") return ordered;
  return JSON.stringify(ordered, null, 2);
};
