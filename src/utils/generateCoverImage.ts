const GENERATED_COVER_PREFIX = 'data:image/svg+xml';

const MESH_COLORS = [
  '#FFB088',
  '#FF9A6C',
  '#FFA07A',
  '#7DD3FC',
  '#67E8F9',
  '#38BDF8',
  '#FDE68A',
  '#FEF08A',
  '#FCD34D',
  '#F9A8D4',
  '#FDA4AF',
  '#FB7185',
  '#C4B5FD',
  '#A78BFA',
  '#E9D5FF',
  '#86EFAC',
  '#6EE7B7',
  '#93C5FD',
  '#BFDBFE',
  '#FDBA74',
  '#FCA5A5',
] as const;

const BLOB_COUNT = 5;
const BASE_FILL = '#f8fafc';
const CARD_BORDER_RADIUS = 12;

function hashString(value: string): number {
  let hash = 0;
  for (let i = 0; i < value.length; i += 1) {
    hash = value.charCodeAt(i) + ((hash << 5) - hash);
  }
  return Math.abs(hash);
}

function seededUnit(hash: number, slot: number): number {
  const raw = Math.sin((hash + 1) * (slot + 1) * 12.9898) * 43758.5453;
  return raw - Math.floor(raw);
}

function escapeXml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

function pickMeshColors(hash: number, count: number): string[] {
  const indices = MESH_COLORS.map((_, index) => index);

  for (let i = indices.length - 1; i > 0; i -= 1) {
    const swapIndex = Math.floor(seededUnit(hash, i) * (i + 1));
    [indices[i], indices[swapIndex]] = [indices[swapIndex], indices[i]];
  }

  return indices.slice(0, count).map((index) => MESH_COLORS[index]);
}

function wrapTitle(title: string, maxLineLength: number, maxLines: number): string[] {
  const words = title.trim().split(/\s+/).filter(Boolean);
  if (words.length === 0) {
    return ['Untitled'];
  }

  const lines: string[] = [];
  let currentLine = '';

  for (const word of words) {
    const candidate = currentLine ? `${currentLine} ${word}` : word;

    if (candidate.length <= maxLineLength) {
      currentLine = candidate;
      continue;
    }

    if (currentLine) {
      lines.push(currentLine);
      currentLine = word;
    } else {
      lines.push(`${word.slice(0, maxLineLength - 1)}…`);
      currentLine = '';
    }

    if (lines.length >= maxLines) {
      return lines.slice(0, maxLines);
    }
  }

  if (currentLine && lines.length < maxLines) {
    lines.push(currentLine);
  }

  const joinedLength = lines.join(' ').length;
  const originalLength = words.join(' ').length;
  if (joinedLength < originalLength && lines.length > 0) {
    const lastIndex = lines.length - 1;
    lines[lastIndex] = lines[lastIndex].replace(/\s+$/, '');
    if (!lines[lastIndex].endsWith('…')) {
      lines[lastIndex] = `${lines[lastIndex].replace(/\.{3}$/, '')}…`;
    }
  }

  return lines.slice(0, maxLines);
}

function buildMeshBlobs(hash: number, width: number, height: number, colors: string[]): string {
  const minDimension = Math.min(width, height);

  return colors
    .map((color, index) => {
      const cx = Math.round(seededUnit(hash, 10 + index * 3) * width * 0.75 + width * 0.12);
      const cy = Math.round(seededUnit(hash, 11 + index * 3) * height * 0.75 + height * 0.12);
      const radius = Math.round(
        (0.26 + seededUnit(hash, 12 + index * 3) * 0.24) * minDimension
      );

      return `<circle cx="${cx}" cy="${cy}" r="${radius}" fill="${color}" />`;
    })
    .join('\n    ');
}

export function isGeneratedCoverImage(url: string): boolean {
  return url.startsWith(GENERATED_COVER_PREFIX);
}

export function generateCoverImageDataUrl(title: string, width = 1200, height = 750): string {
  const safeTitle = title.trim() || 'Untitled';
  const hash = hashString(safeTitle);
  const colors = pickMeshColors(hash, BLOB_COUNT);
  const blobs = buildMeshBlobs(hash, width, height, colors);

  const pillFontSize = 42;
  const pillLineHeight = 54;
  const pillPadX = 48;
  const pillPadY = 28;
  const maxTextWidth = width * 0.75;
  const maxLineLength = Math.max(11, Math.floor(maxTextWidth / (pillFontSize * 0.51)));
  const lines = wrapTitle(safeTitle, maxLineLength, 2);

  const longestLineChars = Math.max(...lines.map((line) => line.length));
  const pillWidth = Math.min(
    maxTextWidth,
    Math.max(240, longestLineChars * pillFontSize * 0.57 + pillPadX * 2)
  );
  const pillHeight = lines.length * pillLineHeight + pillPadY * 2;
  const pillX = (width - pillWidth) / 2;
  const pillY = (height - pillHeight) / 2;
  const titleBoxRadius = Math.min(
    Math.round(CARD_BORDER_RADIUS * (width / 600)),
    pillHeight / 2,
    pillWidth / 2
  );

  const textBlockHeight = (lines.length - 1) * pillLineHeight + pillFontSize;
  const textY = pillY + (pillHeight - textBlockHeight) / 2 + pillFontSize * 0.78;

  const textLines = lines
    .map((line, index) => {
      const dy = index === 0 ? 0 : pillLineHeight;
      return `<tspan x="${width / 2}" dy="${dy}">${escapeXml(line)}</tspan>`;
    })
    .join('');

  const svg = `
<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" role="img" aria-label="${escapeXml(safeTitle)}">
  <defs>
    <filter id="mesh-blur" x="-35%" y="-35%" width="170%" height="170%">
      <feGaussianBlur stdDeviation="88" />
    </filter>
    <filter id="pill-shadow" x="-30%" y="-30%" width="160%" height="160%">
      <feDropShadow dx="0" dy="6" stdDeviation="14" flood-color="#64748b" flood-opacity="0.16" />
    </filter>
  </defs>
  <rect width="100%" height="100%" fill="${BASE_FILL}" />
  <g filter="url(#mesh-blur)">
    ${blobs}
  </g>
  <rect width="100%" height="100%" fill="rgba(255, 255, 255, 0.22)" />
  <rect
    x="${pillX}"
    y="${pillY}"
    width="${pillWidth}"
    height="${pillHeight}"
    rx="${titleBoxRadius}"
    ry="${titleBoxRadius}"
    fill="#ffffff"
    filter="url(#pill-shadow)"
  />
  <text
    x="${width / 2}"
    y="${textY}"
    text-anchor="middle"
    fill="#0f172a"
    font-family="system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif"
    font-size="${pillFontSize}"
    font-weight="700"
    letter-spacing="-0.02em"
  >
    ${textLines}
  </text>
</svg>`.trim();

  return `${GENERATED_COVER_PREFIX};charset=utf-8,${encodeURIComponent(svg)}`;
}

export function resolvePostCoverImage(coverImage: string | undefined, title: string): string {
  const trimmedCover = coverImage?.trim();
  if (trimmedCover && !isGeneratedCoverImage(trimmedCover)) {
    return trimmedCover;
  }

  return generateCoverImageDataUrl(title);
}
