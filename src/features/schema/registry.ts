import { type CreatorSchemaDocument, creatorSchemaDocument } from './contracts';
import schemaJson from './data/creator-schema.v1.json';

const schema = creatorSchemaDocument.parse(schemaJson);

export function getCreatorSchema(): CreatorSchemaDocument {
  return schema;
}

export function getSchemaCategoryIds(): string[] {
  return schema.categories.map((category) => category.id);
}

export function getFieldById(fieldId: string) {
  return schema.fields.find((field) => field.id === fieldId);
}
