import { match } from 'assert';
import fs from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const dates = [];

// Function to parse Prisma schema and get models
function parsePrismaSchema(schemaFile) {
  const schema = fs.readFileSync(schemaFile, 'utf-8');
  const models = [];
  
  const modelRegex = /model\s+(\w+)\s*{([^}]*)}/g;
  let modelMatch;
  
  while ((modelMatch = modelRegex.exec(schema)) !== null) {
    const modelName = modelMatch[1];
    const modelContent = modelMatch[2];
    models.push({ name: modelName, content: modelContent });

    const dateFieldRegex = /\s+(\w+)\s+Date/g;
    let dateFieldMatch;
    while ((dateFieldMatch = dateFieldRegex.exec(modelContent)) !== null) {
      const dateFieldName = dateFieldMatch[1];
      dates.push(dateFieldName);
    }
  }
  return models;
}

// Function to extract relations for each model
function extractRelations(models) {
  const modelRelations = [];
  
  models.forEach((model) => {
    const modelName = model.name;
    const modelContent = model.content;

    const relationRegex = /(\w+)\s+@relation\(\s*fields:\s*\[(\w+)\]\s*,\s*references:\s*\[(\w+)\]\s*\)/g;
    let relationMatch;

    while ((relationMatch = relationRegex.exec(modelContent)) !== null) {
      const relatedModel = relationMatch[1]; // e.g., 'Users'
      const field = relationMatch[2]; // e.g., 'user_id'
      const reference = relationMatch[3]; // e.g., 'id'

      // Check if the field is marked with @unique in the model content
      const fieldRegex = new RegExp(`\\b${field}\\s+[^\\n]*@unique`, 'g');
      const isUnique = fieldRegex.test(modelContent);
      const relationType = isUnique ? 'one-to-one' : 'one-to-many';

      // Add the relation with the fourth field (relation type)
      modelRelations.push([modelName, relatedModel, field, relationType]);
    }
  });
  
  return modelRelations;
}

// Function to generate mapper file
function generateMapperFile(relations) {
  const mapper = relations.map(relation => {
    return `  ['${relation[0]}', '${relation[1]}', '${relation[2]}', '${relation[3]}']`;
  }).join(',\n');

  const content = `// Auto-generated mapper.ts
export const Relations = [
${mapper}
];
export const DateFields = [${dates.map(d => `'${d}'`).join(', ')}];
`;
  fs.writeFileSync(join(__dirname, '../src/app/schema/mapper.ts'), content, 'utf-8');
  console.log('mapper.ts file generated!');
}

// Usage
const models = parsePrismaSchema(join(__dirname, 'schema.prisma'));
const relations = extractRelations(models);
generateMapperFile(relations);