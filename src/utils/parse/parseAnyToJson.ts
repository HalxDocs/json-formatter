// // utils/parse/parseAnyToJson.ts

// import { csvToJson } from "../convert/toJson/csvToJson";
// import { xmlToJson } from "../convert/toJson/xmlToJson";
// import { yamlToJson } from "../convert/toJson/yamlToJson";
// import { tomlToJson } from "../convert/toJson/tomlToJson";
// import { iniToJson } from "../convert/toJson/iniToJson";
// import { excelToJson } from "../convert/toJson/excelToJson";

// export async function parseAnyToJson(
//   input: string | File,
//   type?: string
// ): Promise<any> {

//   // FILE INPUT
//   if (input instanceof File) {
//     const ext = input.name.split(".").pop()?.toLowerCase();

//     switch (ext) {
//       case "json":
//         return JSON.parse(await input.text());

//       case "csv":
//       case "tsv":
//         return csvToJson(await input.text());

//       case "xml":
//         return xmlToJson(await input.text());

//       case "yaml":
//       case "yml":
//         return yamlToJson(await input.text());

//       case "toml":
//         return tomlToJson(await input.text());

//       case "ini":
//         return iniToJson(await input.text());

//       case "xlsx":
//         return excelToJson(input);

//       default:
//         throw new Error("Unsupported file type");
//     }
//   }

//   // STRING INPUT
//   if (typeof input === "string") {
//     const trimmed = input.trim();

//     if (trimmed.startsWith("{") || trimmed.startsWith("[")) {
//       return JSON.parse(trimmed);
//     }

//     if (trimmed.startsWith("<")) {
//       return xmlToJson(trimmed);
//     }

//     if (trimmed.includes(",") && trimmed.includes("\n")) {
//       return csvToJson(trimmed);
//     }

//     if (trimmed.includes("=")) {
//       return iniToJson(trimmed);
//     }

//     if (trimmed.includes(":")) {
//       return yamlToJson(trimmed);
//     }

//     throw new Error("Unknown input format");
//   }

//   throw new Error("Invalid input");
// }
