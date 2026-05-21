import * as XLSX from "xlsx";

export function excelToJson(file: ArrayBuffer) {
  const workbook = XLSX.read(file, { type: "array" });
  const sheet = workbook.Sheets[workbook.SheetNames[0]];
  return XLSX.utils.sheet_to_json(sheet);
}
