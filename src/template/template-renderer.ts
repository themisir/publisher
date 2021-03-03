import fs from "fs/promises";
import { Template } from "./template";
import path from "path";

export class TemplateRenderer {
  private rootPath: string;
  public templates: { [name: string]: Template } = {};

  public constructor(rootPath: string) {
    this.rootPath = rootPath;
  }

  public async initialize(): Promise<void> {
    await this.recursiveScanDirectory(this.rootPath);
  }

  private async recursiveScanDirectory(directory: string): Promise<void> {
    const files = await fs.readdir(directory, "utf-8");
    for (const file of files) {
      const fullPath = path.join(directory, file);
      const stat = await fs.stat(fullPath);
      const name = path.relative(this.rootPath, fullPath).replace(".ejs", "");

      if (stat.isFile()) {
        if (fullPath.endsWith(".ejs")) {
          let schemeFile = fullPath.replace(".ejs", ".schema.json");

          if (
            !(await fs
              .stat(schemeFile)
              .then(() => true)
              .catch(() => false))
          ) {
            schemeFile = undefined;
          }

          this.templates[name] = await Template.compile(
            name,
            fullPath,
            schemeFile
          );
        }
      } else if (stat.isDirectory()) {
        await this.recursiveScanDirectory(fullPath);
      }
    }
  }

  public find(name: string): Template {
    const result = this.templates[name];
    if (!result) throw new Error("Template is not exists");
    return result;
  }
}
