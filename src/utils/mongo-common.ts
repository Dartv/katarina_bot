import { Document, Types } from 'mongoose';

export const isDocument = <T extends Document>(value: unknown): value is T => value instanceof Document;

export const isDocumentArray = <
  T extends Document,
  U extends Types.DocumentArray<T>
>(value: unknown): value is U => value instanceof Types.DocumentArray;

export const getDocumentId = <T extends Document>(doc: Types.ObjectId | T): Types.ObjectId => {
  if (isDocument(doc)) {
    return doc._id;
  }

  return doc;
};
