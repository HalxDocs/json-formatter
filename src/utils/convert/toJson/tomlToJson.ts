import toml from "toml";

export function tomlToJson(input: string) {
  return toml.parse(input);
}
