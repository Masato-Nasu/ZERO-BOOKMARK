import assert from "node:assert/strict";

// Browser codec copied here only to make a lightweight syntax/import test practical under Node.
const src = await import("./codec.node.mjs");
const cases = [
  ["MASATO LAB", "https://masato-lab.pages.dev/tools"],
  ["日本語", "https://example.com/path?q=%E6%97%A5%E6%9C%AC%E8%AA%9E#x"],
  ["GitHub", "https://github.com/Masato-Nasu/Turing-RDStream-Motion"]
];
for (const [title, url] of cases) {
  const name = src.makeFilename(title, url);
  assert.equal(src.extractUrlFromFilename(name), new URL(url).href);
  const renamed = `RENAMED${name.slice(name.lastIndexOf(src.MARKER))}`;
  assert.equal(src.extractUrlFromFilename(renamed), new URL(url).href);
}
console.log("PASS — filename round trips and visible-name renaming work");
