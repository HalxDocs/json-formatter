type Schema = {
  type: string;
  properties?: Record<string, Schema>;
  items?: Schema;
  required?: string[];
};

function inferSchema(value: any): Schema {
  if (Array.isArray(value)) {
    return {
      type: "array",
      items: value.length ? inferSchema(value[0]) : { type: "string" },
    };
  }

  if (value === null) {
    return { type: "null" };
  }

  if (typeof value === "object") {
    const properties: Record<string, Schema> = {};
    const required: string[] = [];

    for (const key in value) {
      properties[key] = inferSchema(value[key]);
      required.push(key);
    }

    return {
      type: "object",
      properties,
      required,
    };
  }

  return { type: typeof value };
}

export function jsonToSchema(json: any) {
  return {
    $schema: "http://json-schema.org/draft-07/schema#",
    ...inferSchema(json),
  };
}
