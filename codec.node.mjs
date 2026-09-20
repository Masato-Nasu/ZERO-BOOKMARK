globalThis.btoa ??= s => Buffer.from(s, "binary").toString("base64");
globalThis.atob ??= s => Buffer.from(s, "base64").toString("binary");
const MARKER = "__0B__";
const MAX_FILENAME_BYTES = 240;

export function normalizeUrl(raw) {
  const value = String(raw ?? "").trim();
  if (!value) throw new Error("URLがありません。");
  let url;
  try {
    url = new URL(value);
  } catch {
    throw new Error("正しいURLではありません。");
  }
  if (url.protocol !== "http:" && url.protocol !== "https:") {
    throw new Error("http / https のページだけ保存できます。");
  }
  return url.href;
}

function bytesToBase64Url(bytes) {
  let binary = "";
  for (const byte of bytes) binary += String.fromCharCode(byte);
  return btoa(binary)
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/g, "");
}

function base64UrlToBytes(value) {
  if (!/^[A-Za-z0-9_-]+$/.test(value)) throw new Error("復元コードが壊れています。");
  const padded = value.replace(/-/g, "+").replace(/_/g, "/") + "===".slice((value.length + 3) % 4);
  let binary;
  try {
    binary = atob(padded);
  } catch {
    throw new Error("復元コードが壊れています。");
  }
  return Uint8Array.from(binary, c => c.charCodeAt(0));
}

export function encodeUrl(url) {
  return bytesToBase64Url(new TextEncoder().encode(normalizeUrl(url)));
}

export function decodeUrl(code) {
  let decoded;
  try {
    decoded = new TextDecoder("utf-8", { fatal: true }).decode(base64UrlToBytes(code));
  } catch (error) {
    if (error instanceof Error && error.message === "復元コードが壊れています。") throw error;
    throw new Error("復元コードをURLに戻せませんでした。");
  }
  return normalizeUrl(decoded);
}

export function sanitizeTitle(raw) {
  const cleaned = String(raw ?? "")
    .normalize("NFC")
    .replace(/[\\/:*?"<>|\u0000-\u001F]/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .replace(/[. ]+$/g, "");
  return cleaned || "NOTHING";
}

export function makeFilename(title, url) {
  const code = encodeUrl(url);
  const safeTitle = sanitizeTitle(title);
  const suffix = `${MARKER}${code}`;
  const suffixBytes = new TextEncoder().encode(suffix).length;

  if (suffixBytes > MAX_FILENAME_BYTES - 1) {
    throw new Error("このURLは長すぎて、0 byteのファイル名だけには収まりません。");
  }

  let visibleTitle = safeTitle;
  let result = `${visibleTitle}${suffix}`;
  while (new TextEncoder().encode(result).length > MAX_FILENAME_BYTES && visibleTitle.length > 1) {
    visibleTitle = visibleTitle.slice(0, -1).replace(/[. ]+$/g, "") || "N";
    result = `${visibleTitle}${suffix}`;
  }

  if (new TextEncoder().encode(result).length > MAX_FILENAME_BYTES) result = `N${suffix}`;
  return result;
}

export function extractUrlFromFilename(filename) {
  const name = String(filename ?? "");
  const markerIndex = name.lastIndexOf(MARKER);
  if (markerIndex < 0) throw new Error("ZERO BOOKMARKの復元コードがありません。");
  const code = name.slice(markerIndex + MARKER.length).replace(/\.[A-Za-z0-9_-]{1,10}$/u, "");
  if (!code) throw new Error("復元コードがありません。");
  return decodeUrl(code);
}

export { MARKER, MAX_FILENAME_BYTES };
