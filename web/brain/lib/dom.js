// Shared DOM shorthands for the viewer.
export const $ = id => document.getElementById(id);

export function element(tag, text) {
  const e = document.createElement(tag);
  e.textContent = text;
  return e;
}
