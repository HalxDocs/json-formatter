export function xmlToJson(xml: string) {
  const parser = new DOMParser();
  const doc = parser.parseFromString(xml, "application/xml");

  const walk = (node: any): any => {
    if (node.children.length === 0) return node.textContent;

    const obj: any = {};
    for (const child of node.children) {
      obj[child.nodeName] = walk(child);
    }
    return obj;
  };

  return walk(doc.documentElement);
}
