// Calculate card dimensions with responsive container padding
const cardCount = sortedCrops.length || 1;
const containerPadding = Math.max(4, Math.min(12, containerWidth * 0.04));
const availableWidth = Math.max(40, containerWidth - containerPadding * 2);
const availableHeight = Math.max(30, containerHeight - containerPadding * 2);

// Gap between cards
const gapSize = Math.max(4, Math.min(10, availableWidth * 0.01));
const totalGaps = gapSize * (cardCount - 1);
const cardWidth = (availableWidth - totalGaps) / cardCount;

// Scale factor: widget kattaroq = text kattaroq, kichikroq = text kichikroq
// Bazaviy: 100px kenglik va 60px balandlikda scale = 1
const widthRatio = cardWidth / 100;
const heightRatio = availableHeight / 60;
// Make scale react to both dimensions symmetrically
// Use geometric mean so either width or height growth increases scale,
// without over-inflating when only one dimension is large.
const scale = Math.sqrt(widthRatio * heightRatio);

// Font o'lchamlari - fully responsive, scales from very small to large
// Minimal: tiny readable size for cramped spaces
// Maksimal: large size for spacious cards
const iconSize = Math.max(6, Math.min(20, Math.round(11 * scale)));
const nameSize = Math.max(6, Math.min(14, Math.round(9 * scale)));
const areaValueSize = Math.max(7, Math.min(16, Math.round(12 * scale)));
const areaUnitSize = Math.max(6, Math.min(12, Math.round(9 * scale)));
const waterSize = Math.max(6, Math.min(12, Math.round(8 * scale)));

// Padding va gap - ultra-minimal to prioritize text space at all sizes
const cardPadding = Math.max(2, Math.min(10, Math.round(4 * scale)));
const elementGap = Math.max(1, Math.min(5, Math.round(1.5 * scale)));
