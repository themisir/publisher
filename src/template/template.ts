import Ajv, { AsyncSchema, AsyncValidateFunction, ErrorObject } from "ajv";
import ejs from "ejs";
import fs from "fs/promises";

export interface ValidationResult<Error = ErrorObject> {
  valid: boolean;
  errors: Error[];
}

export class Template {
  public readonly name: string;
  public readonly exampleData?: any;
  private compiledTemplate: ejs.AsyncTemplateFunction;
  private compiledValidator?: AsyncValidateFunction;

  constructor(
    name: string,
    compiledTemplate: ejs.AsyncTemplateFunction,
    compiledValidator?: AsyncValidateFunction,
    exampleData?: any
  ) {
    this.name = name;
    this.compiledTemplate = compiledTemplate;
    this.compiledValidator = compiledValidator;
    this.exampleData = exampleData;
  }

  public async validate(data: any): Promise<ValidationResult> {
    if (!this.compiledValidator || (await this.compiledValidator(data))) {
      return { valid: true, errors: [] };
    } else {
      return { valid: false, errors: this.compiledValidator.errors };
    }
  }

  public async render(data: any): Promise<string> {
    return await this.compiledTemplate(data);
  }

  public static async compile(
    name: string,
    templatePath: string,
    schemaPath?: string
  ): Promise<Template> {
    const templateContent = await Template.readFile(templatePath);
    const compiledTemplate = ejs.compile(templateContent, { async: true });
    let compiledValidator: AsyncValidateFunction | undefined;
    let exampleData: any;

    if (schemaPath) {
      const schemaContent = await Template.readFile(schemaPath);
      const schemaJson = JSON.parse(schemaContent);
      const schema: AsyncSchema = { ...schemaJson, $async: true };
      const ajv = new Ajv();
      compiledValidator = ajv.compile(schema);
      exampleData = schemaJson?.examples?.[0];
    }

    return new Template(name, compiledTemplate, compiledValidator, exampleData);
  }

  private static async readFile(filePath: string): Promise<string> {
    return await fs.readFile(filePath, "utf-8");
  }
}
