export function jsonToIni(obj: any): string {
  let output = "";

  for (const section in obj) {
    output += `[${section}]\n`;
    for (const key in obj[section]) {
      output += `${key}=${obj[section][key]}\n`;
    }
    output += "\n";
  }

  return output;
}
