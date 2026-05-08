import { nativeImage } from "electron";

const iconSvg = `
<svg width="256" height="256" viewBox="0 0 256 256" fill="none" xmlns="http://www.w3.org/2000/svg">
  <rect width="256" height="256" rx="56" fill="#060816"/>
  <rect x="24" y="24" width="208" height="208" rx="40" fill="url(#bg)" stroke="rgba(148,163,184,0.14)"/>
  <path d="M68 160C92 140 100 122 116 104C128 90 142 78 170 62" stroke="url(#line)" stroke-width="16" stroke-linecap="round"/>
  <path d="M86 178H172" stroke="#1D4ED8" stroke-width="14" stroke-linecap="round" opacity="0.92"/>
  <circle cx="170" cy="62" r="18" fill="#22C55E"/>
  <circle cx="116" cy="104" r="12" fill="#38BDF8"/>
  <circle cx="86" cy="178" r="10" fill="#A78BFA"/>
  <defs>
    <linearGradient id="bg" x1="32" y1="28" x2="216" y2="232" gradientUnits="userSpaceOnUse">
      <stop stop-color="#0F172A"/>
      <stop offset="1" stop-color="#101828"/>
    </linearGradient>
    <linearGradient id="line" x1="68" y1="160" x2="170" y2="62" gradientUnits="userSpaceOnUse">
      <stop stop-color="#38BDF8"/>
      <stop offset="1" stop-color="#A78BFA"/>
    </linearGradient>
  </defs>
</svg>
`;

export function createWindowIcon() {
  const dataUrl = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(iconSvg)}`;
  return nativeImage.createFromDataURL(dataUrl);
}
