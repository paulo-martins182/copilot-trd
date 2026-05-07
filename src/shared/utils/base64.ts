export function dataUrlMimeType(dataUrl: string): string {
  const match = /^data:(.+);base64,/.exec(dataUrl);
  return match?.[1] ?? "image/png";
}

export function stripDataUrlPrefix(dataUrl: string): string {
  return dataUrl.replace(/^data:.+;base64,/, "");
}
