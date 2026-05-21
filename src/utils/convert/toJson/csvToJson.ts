export function csvToJson(csv: string) {
  const [headerLine, ...lines] = csv.split("\n");
  const headers = headerLine.split(",");

  return lines.map(line => {
    const values = line.split(",");
    return headers.reduce((obj: any, h, i) => {
      obj[h.trim()] = values[i]?.trim();
      return obj;
    }, {});
  });
}
