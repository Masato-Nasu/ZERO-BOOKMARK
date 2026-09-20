import { makeFilename, extractUrlFromFilename, normalizeUrl } from "./codec.js";

const pageTitle = document.querySelector("#page-title");
const pageUrl = document.querySelector("#page-url");
const nameInput = document.querySelector("#name-input");
const saveButton = document.querySelector("#save-button");
const saveStatus = document.querySelector("#save-status");
const openButton = document.querySelector("#open-button");
const fileInput = document.querySelector("#file-input");
const dropZone = document.querySelector("#drop-zone");
const openStatus = document.querySelector("#open-status");

let currentUrl = "";

function setStatus(el, message, kind = "") {
  el.textContent = message;
  el.className = `status ${kind}`.trim();
}

function defaultTitle(tabTitle, url) {
  const title = String(tabTitle ?? "").trim();
  if (title) return title;
  try { return new URL(url).hostname.replace(/^www\./, "") || "NOTHING"; }
  catch { return "NOTHING"; }
}

async function loadCurrentTab() {
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  try {
    currentUrl = normalizeUrl(tab?.url || "");
    pageTitle.textContent = tab?.title || new URL(currentUrl).hostname;
    pageUrl.textContent = currentUrl;
    nameInput.value = defaultTitle(tab?.title, currentUrl);
    saveButton.disabled = false;
  } catch (error) {
    currentUrl = "";
    pageTitle.textContent = "This page cannot be saved";
    pageUrl.textContent = tab?.url || "";
    nameInput.value = "";
    saveButton.disabled = true;
    setStatus(saveStatus, error instanceof Error ? error.message : "保存できません。", "error");
  }
}

function downloadZeroByte(filename) {
  const blob = new Blob([], { type: "application/octet-stream" });
  if (blob.size !== 0) throw new Error("0 byteファイルを生成できませんでした。");
  const objectUrl = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = objectUrl;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(objectUrl), 1500);
}

saveButton.addEventListener("click", () => {
  setStatus(saveStatus, "");
  try {
    const filename = makeFilename(nameInput.value, currentUrl);
    downloadZeroByte(filename);
    setStatus(saveStatus, `SAVED — 0 bytes`, "success");
  } catch (error) {
    setStatus(saveStatus, error instanceof Error ? error.message : "保存できませんでした。", "error");
  }
});

async function openZeroByte(file) {
  setStatus(openStatus, "");
  if (!file) return;
  if (file.size !== 0) {
    setStatus(openStatus, `${file.size.toLocaleString()} bytesあります。0 byteファイルだけ開けます。`, "error");
    return;
  }
  try {
    const url = extractUrlFromFilename(file.name);
    await chrome.tabs.create({ url });
    setStatus(openStatus, "OPENED", "success");
  } catch (error) {
    setStatus(openStatus, error instanceof Error ? error.message : "開けませんでした。", "error");
  }
}

openButton.addEventListener("click", () => fileInput.click());
fileInput.addEventListener("change", () => openZeroByte(fileInput.files?.[0]));

dropZone.addEventListener("dragover", event => {
  event.preventDefault();
  dropZone.classList.add("is-over");
});
dropZone.addEventListener("dragleave", () => dropZone.classList.remove("is-over"));
dropZone.addEventListener("drop", event => {
  event.preventDefault();
  dropZone.classList.remove("is-over");
  openZeroByte(event.dataTransfer?.files?.[0]);
});

loadCurrentTab();
