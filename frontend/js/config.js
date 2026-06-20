const readMeta = () =>
  document.querySelector('meta[name="nanasakara-api-base-url"]')?.getAttribute("content") ||
  "";

const readGlobal = () => {
  const v = globalThis?.NANASAKARA_CONFIG?.API_BASE_URL;
  return typeof v === "string" ? v : "";
};

const readStorage = () => {
  try {
    return localStorage.getItem("nanasakara_api_base_url") || "";
  } catch {
    return "";
  }
};

const defaultLocalApiBase = () => {
  const host = globalThis?.location?.hostname;
  if (host === "localhost" || host === "127.0.0.1") {
    return `${globalThis.location.protocol}//${host}:4000`;
  }
  return "";
};

const normalizeBase = (raw) => {
  const v = String(raw || "").trim();
  if (!v) return "";
  return v.replace(/\/$/, "");
};

export const API_BASE_URL = normalizeBase(readMeta() || readGlobal() || readStorage() || defaultLocalApiBase());

export const ENABLE_MOCK =
  String(globalThis?.NANASAKARA_CONFIG?.ENABLE_MOCK || "").toLowerCase() === "true";
