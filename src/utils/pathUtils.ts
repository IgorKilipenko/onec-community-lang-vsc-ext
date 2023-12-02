import { type GlobOptions, glob } from "glob";
import * as vscode from "vscode";

export const getRootPath = () => {
  return vscode.workspace.workspaceFolders && vscode.workspace.workspaceFolders.length > 0 ? vscode.workspace.workspaceFolders[0] : null;
};

export const findFiles = async (searchPattern: string, rootPath: string) => {
  console.log({ searchPattern });
  const globOptions: GlobOptions = {
    dot: true,
    cwd: rootPath,
    nocase: true,
    follow: true,
  };
  globOptions["absolute"] = true;
  const files = await glob(searchPattern, globOptions);
  return files;
};
