/**
 * Allowlist sanitizer for the notebook editor's HTML (browser only).
 * Keeps basic structure + inline formatting and only the style properties the editor produces.
 */
const ALLOWED_TAGS = new Set([
  "B", "STRONG", "I", "EM", "U", "S", "SPAN", "FONT", "BR", "DIV", "P",
  "UL", "OL", "LI", "H1", "H2", "H3", "BLOCKQUOTE",
]);
const ALLOWED_STYLES = ["color", "font-size", "font-weight", "font-style", "text-decoration", "text-align"];
const SAFE_VALUE = /^[#(),.%\w\s-]+$/;

export function sanitizeHtml(html: string): string {
  if (typeof window === "undefined" || !html) return html ?? "";
  const doc = new DOMParser().parseFromString(`<div>${html}</div>`, "text/html");
  const root = doc.body.firstElementChild;
  if (!root) return "";

  const walk = (node: Element) => {
    for (const child of Array.from(node.children)) {
      if (!ALLOWED_TAGS.has(child.tagName)) {
        // Unknown tag: drop scripts/styles entirely, unwrap anything else (keep its text)
        if (["SCRIPT", "STYLE", "IFRAME", "OBJECT", "EMBED", "LINK", "META"].includes(child.tagName)) {
          child.remove();
          continue;
        }
        walk(child);
        child.replaceWith(...Array.from(child.childNodes));
        continue;
      }

      for (const attr of Array.from(child.attributes)) {
        if (attr.name === "style") {
          const el = child as HTMLElement;
          const kept: string[] = [];
          for (const prop of ALLOWED_STYLES) {
            const v = el.style.getPropertyValue(prop);
            if (v && SAFE_VALUE.test(v)) kept.push(`${prop}: ${v}`);
          }
          if (kept.length) child.setAttribute("style", kept.join("; "));
          else child.removeAttribute("style");
        } else if (child.tagName === "FONT" && (attr.name === "color" || attr.name === "size")) {
          if (!SAFE_VALUE.test(attr.value)) child.removeAttribute(attr.name);
        } else {
          child.removeAttribute(attr.name);
        }
      }
      walk(child);
    }
  };

  walk(root);
  return root.innerHTML;
}

/** Plain-text preview of rich content */
export function htmlToText(html: string): string {
  if (!html) return "";
  if (typeof window === "undefined") return html.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
  const doc = new DOMParser().parseFromString(html.replace(/<(br|\/div|\/p|\/li)[^>]*>/gi, " $&"), "text/html");
  return (doc.body.textContent ?? "").replace(/\s+/g, " ").trim();
}
