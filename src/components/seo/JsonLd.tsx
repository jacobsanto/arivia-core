import React from "react";

export interface JsonLdProps<T = any> {
  schema: T;
}

export const JsonLd = <T,>({ schema }: JsonLdProps<T>) => (
  <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }} />
);

export default JsonLd;
