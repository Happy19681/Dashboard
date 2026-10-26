function downloadBlob(blob, fileName) {
  const downloadUrl = URL.createObjectURL(blob);
  const link = document.createElement("a");

  link.href = downloadUrl;
  link.download = fileName;
  document.body.appendChild(link);
  link.click();
  link.remove();
  window.setTimeout(() => URL.revokeObjectURL(downloadUrl), 1000);
}

export function downloadSvgElement(svgElement, fileName) {
  if (!svgElement) return;

  const svg = svgElement.cloneNode(true);
  const { width, height } = svgElement.getBoundingClientRect();
  svg.setAttribute("xmlns", "http://www.w3.org/2000/svg");
  svg.setAttribute("width", String(Math.round(width)));
  svg.setAttribute("height", String(Math.round(height)));

  const markup = new XMLSerializer().serializeToString(svg);
  downloadBlob(new Blob([markup], { type: "image/svg+xml;charset=utf-8" }), fileName);
}

export function downloadCsvRows(rows, fileName) {
  const escapeCell = (value) => `"${String(value ?? "").replaceAll('"', '""')}"`;
  const csv = rows.map((row) => row.map(escapeCell).join(",")).join("\r\n");
  downloadBlob(new Blob([`\uFEFF${csv}`], { type: "text/csv;charset=utf-8" }), fileName);
}
