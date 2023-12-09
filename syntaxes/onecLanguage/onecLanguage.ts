import * as fs from "fs";
import * as path from "path";

console.log("start");


export const buildFile = () => {
  const getJsons = () => {
    const dir = "./syntaxes/onecLanguage/json";
    fs.readdir(dir, (error, files) => {
      if (error) {
        console.error(error);
        return;
      }

      const rootNodePath = files.find((name) => name === "repository.json");
      console.assert(rootNodePath, "rootNodePath is empty");

      files = files.filter((v) => v !== rootNodePath);

      let data: string | null;
      try {
        data = fs.readFileSync(path.join(dir, rootNodePath!), { encoding: "utf8" });
      } catch (error) {
        console.error(error);
        return;
      }

      //data = data.replace(/(?<=\s*"[a-z0-9\-]+)\-+([a-z0-9])(?=[a-z0-9\-\s]*"\:)/, (_, $1) => $1.toUpperCase());
      data = data.replace(/(?<=\s*"[a-z0-9\-]+)\-+([a-z0-9])(?=[a-z0-9\-]*"\:\s*\{)/, (_, $1) => $1.toUpperCase());

      const rootNode = JSON.parse(data);
      console.log({rootNode});
    });
  };

  getJsons();
};

buildFile();
