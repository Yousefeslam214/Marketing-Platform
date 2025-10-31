// RTL utility functions for consistent styling

export function rtlClass(
  isRTL: boolean,
  ltrClass: string,
  rtlClass: string
): string {
  return isRTL ? rtlClass : ltrClass;
}

export function getTextAlignment(isRTL: boolean): string {
  return isRTL ? "text-right" : "text-left";
}

export function getFlexDirection(isRTL: boolean): string {
  return isRTL ? "flex-row-reverse" : "flex-row";
}

export function getMarginAuto(isRTL: boolean, side: "left" | "right"): string {
  if (side === "left") {
    return isRTL ? "mx-auto" : "ml-auto";
  }
  return isRTL ? "ml-auto" : "mx-auto";
}

export function getPadding(
  isRTL: boolean,
  side: "left" | "right",
  size: string
): string {
  if (side === "left") {
    return isRTL ? `pr-${size}` : `pl-${size}`;
  }
  return isRTL ? `pl-${size}` : `pr-${size}`;
}

export function getBorderRadius(
  isRTL: boolean,
  side: "left" | "right"
): string {
  if (side === "left") {
    return isRTL ? "rounded-r" : "rounded-l";
  }
  return isRTL ? "rounded-l" : "rounded-r";
}
