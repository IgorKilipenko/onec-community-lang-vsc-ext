import * as fs from "fs";
import * as path from "path";

namespace utils {
  // const concatRegexp = (...regexs: RegExp[]) => {
  //   let { flags, pattern } = regexs.reduce<{ flags: string; pattern: string }>(
  //     (res, exp) => {
  //       res.flags += exp.flags;
  //       res.pattern += exp.source;
  //       return res;
  //     },
  //     { flags: "", pattern: "" }
  //   );
  //   let uniqueFlags = new Set(flags.split(""));
  //   flags = uniqueFlags.join("");
  //   return new RegExp(pattern, flags);
  // };
}

interface BslSyntaxesBuilderOptions {
  jsonPath?: string | undefined;
}

export enum BslLanguageSyntaxesCategories {
  root,
  functions,
  variables,
  comments,
}


export interface IBslSyntaxNode extends Record<symbol, any> {}
export interface IBslSyntaxRootNode extends IBslSyntaxNode{
  name: string
  scopeName: string
  fileTypes: string[]
  patterns: IIncludePattern[]
  repository: IBslSyntaxNode
}
export interface ILanguageSyntaxesDocument<T extends IBslSyntaxNode = IBslSyntaxNode> extends Record<keyof typeof BslLanguageSyntaxesCategories, T | null> {}
export interface IIncludePattern {
  include: string
}

export class LanguageSyntaxesDocument implements ILanguageSyntaxesDocument {
  root: IBslSyntaxRootNode | null = null;
  functions: IBslSyntaxNode | null = null;
  variables: IBslSyntaxNode | null = null;
  comments: IBslSyntaxNode | null = null;

  static isAvailableNodeName = (name: string) => {
    return Object.keys(BslLanguageSyntaxesCategories).findIndex((key) => key === name) >= 0;
  };
}

export class BslSyntaxesBuilder {
  private readonly _jsonPath: string;

  private readonly _patterns = {
    //_keyPattern: /[a-z0-9\-]+)\-+([a-z0-9])(?=[a-z0-9\-]*)/,
    replaceKeyPattern: /(?<=\s*"[a-z0-9\-]+)\-+([a-z0-9])(?=[a-z0-9\-]*"\:\s*\{)/g,
    replaceValuePattern: /(?<=\s*"include"[\:\s]+"#[a-z0-9\-]+)\-+([a-z0-9])(?=[a-z0-9\-]*"\s*)/g,
  };

  constructor(options?: BslSyntaxesBuilderOptions) {
    this._jsonPath = options?.jsonPath ?? "./syntaxes/onecLanguage/json";
  }

  getJsons = () => {
    const dir = this._jsonPath;
    fs.readdir(dir, (error, files) => {
      if (error) {
        console.error(error);
        return;
      }

      const rootNodePath = files.find((name) => name === "functions.json");
      console.assert(rootNodePath, "rootNodePath is empty");

      files = files.filter((v) => v !== rootNodePath);

      let data: string | null;
      try {
        data = fs.readFileSync(path.join(dir, rootNodePath!), { encoding: "utf8" });
      } catch (error) {
        console.error(error);
        return;
      }

      data = data.replace(/(?<=\s*"[a-z0-9\-]+)\-+([a-z0-9])(?=[a-z0-9\-]*"\:\s*\{)/g, (_, $1) => $1.toUpperCase());
      data = data.replace(/(?<=\s*"include"[\:\s]+"#[a-z0-9\-]+)\-+([a-z0-9])(?=[a-z0-9\-]*"\s*)/g, (_, $1) => $1.toUpperCase());

      const rootNode = JSON.parse(data);
      console.log({ patterns: rootNode.functionParametersBody.patterns });
    });
  };

  parseJson = (data: string): object => {
    data = data.replace(/(?<=\s*"[a-z0-9\-]+)\-+([a-z0-9])(?=[a-z0-9\-]*"\:\s*\{)/g, (_, $1) => $1.toUpperCase());
    const json = JSON.parse(
      data.replace(/(?<=\s*"include"[\:\s]+"#[a-z0-9\-]+)\-+([a-z0-9])(?=[a-z0-9\-]*"\s*)/g, (_, $1) => $1.toUpperCase())
    );

    console.assert(typeof json === "object");

    return json;
  };

  getFiles = () => {
    let files: string[] = [];
    try {
      files = fs.readdirSync(this._jsonPath);
    } catch {}

    return files;
  };

  build = (): ILanguageSyntaxesDocument => {
    const readJsonFile = (fileName: string) => {
      let data: string | null;
      try {
        data = fs.readFileSync(path.join(this._jsonPath, fileName), { encoding: "utf8" });
      } catch (error) {
        return null;
      }

      return data;
    };

    const files = this.getFiles();
    const document = files.reduce<LanguageSyntaxesDocument>((res, file) => {
      if (file === "repository.json") {
        let data = readJsonFile(file);

        console.assert(data !== null);
        console.assert(LanguageSyntaxesDocument.isAvailableNodeName("root"));

        res.root = (data ? this.parseJson(data) : {}) as IBslSyntaxRootNode;
      } else {
        console.assert(res.root);
      }
      return res;
    }, new LanguageSyntaxesDocument());

    console.log({
      document,
      isSuccess: LanguageSyntaxesDocument.isAvailableNodeName("root") && !!document.root && !!document.root.repository,
    });
    return document;
  };
}

const builder = new BslSyntaxesBuilder();
builder.build();
