import schemaJson from './data/creator-schema.v1.json';
import { creatorSchemaDocument, type CreatorSchemaDocument } from './contracts';

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
