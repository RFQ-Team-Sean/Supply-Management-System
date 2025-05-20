// generateSchema.js (ES modules, excluding relations)
import { readFileSync, writeFileSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

function generateTypeScriptClasses(prismaSchemaPath, outputPath) {
  const schemaContent = readFileSync(prismaSchemaPath, "utf-8");

  const decoratorTemplate = `
// src/app/schema/schema.ts

import 'reflect-metadata'

function TableName(tableName: string) {
  return function (target: Function) {
    Reflect.defineMetadata('table', tableName, target);
  };
}
`;

  let output = decoratorTemplate + "\n";

  // Handle enums as union types
  const enums = schemaContent.match(/enum\s+(\w+)\s*{([^}]*)}/g) || [];
  enums.forEach((enumDef) => {
    const enumNameMatch = enumDef.match(/enum\s+(\w+)/);
    if (!enumNameMatch) return;
    const enumName = enumNameMatch[1];

    const valuesSection = enumDef.match(/{([^}]*)}/)[1];
    const enumValues = valuesSection
      .split("\n")
      .map((line) => line.trim())
      .filter((line) => line && !line.startsWith("//"))
      .map((value) => `'${value}'`);

    if (enumValues.length === 0) return;

    output += `export type ${enumName} = ${enumValues.join(" | ")};\n\n`;
  });

  // Handle models
  const models = schemaContent.match(/model\s+(\w+)\s*{([^}]*)}/g) || [];

  models.forEach((model) => {
    const modelNameMatch = model.match(/model\s+(\w+)/);
    if (!modelNameMatch) return;
    const modelName = modelNameMatch[1];

    const fieldsSection = model.match(/{([^}]*)}/)[1];
    const fieldLines = fieldsSection
      .split("\n")
      .map((line) => line.trim())
      .filter(
        (line) =>
          line &&
          // !line.startsWith('@') &&
          !line.startsWith("//") // &&
        // !line.includes('@relation')
      );

    const fields = fieldLines
      .map((line) => {
        const [name, typeAndDecorators] = line.split(/\s+/);
        const isOptional = typeAndDecorators.includes("?");
        let type = typeAndDecorators.replace("?", "").split("@")[0];
        const isArray = type.endsWith("[]");

        // Remove array brackets if present
        if (isArray) {
          type = type.slice(0, -2);
        }

        let tsType;
        let primitive = false;
        switch (type.toLowerCase()) {
          case "string":
            tsType = "string";
            break;
          case "int":
          case "float":
          case "decimal":
            tsType = "number";
            break;
          case "boolean":
            tsType = "boolean";
            break;
          case "datetime":
            tsType = "Date";
            break;
          default:
            // Check if it's an enum/union type
            if (enums.some((e) => e.match(/enum\s+(\w+)/)[1] === type)) {
              tsType = type;
            } else {
              primitive = true;
              tsType = type;
            }
        }

        // Add array notation if it was an array type
        if (isArray) {
          tsType += "[]";
        }

        return `  ${name}${isOptional || primitive ? "?" : ""}: ${tsType}`;
      })
      .filter((field) => field !== null);

    if (fields.length === 0) return;

    output += `@TableName('${modelName}')\n`;
    output += `export class ${modelName} {\n`;
    output += fields.join("\n") + "\n";
    output += "}\n\n";
  });

  writeFileSync(outputPath, output.trim());
  console.log(`Generated TypeScript classes and types in ${outputPath}`);
}

const prismaSchemaPath = join(__dirname, "schema.prisma");
const outputPath = join(__dirname, "../src/app/schema/schema.ts");
generateTypeScriptClasses(prismaSchemaPath, outputPath);
