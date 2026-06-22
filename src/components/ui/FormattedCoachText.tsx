import React from 'react';

const BULLET_PREFIX_RE = /^(\d+[.)]\s+|[-•*·]\s+)/;

type ContentBlock =
  | { type: 'label'; content: string }
  | { type: 'paragraph'; content: string }
  | { type: 'bullets'; items: string[] };

/** Strip lightweight markdown for compact previews. */
export function stripCoachMarkdown(text: string): string {
  return text
    .replace(/\*\*([^*]+)\*\*/g, '$1')
    .replace(/\*([^*]+)\*/g, '$1')
    .replace(/^\s*[-•*·]\s+/gm, '')
    .replace(/\s+/g, ' ')
    .trim();
}

function parseBlocks(text: string): ContentBlock[] {
  const blocks: ContentBlock[] = [];
  let bulletBuffer: string[] = [];

  const flushBullets = () => {
    if (bulletBuffer.length > 0) {
      blocks.push({ type: 'bullets', items: [...bulletBuffer] });
      bulletBuffer = [];
    }
  };

  for (const rawLine of text.split(/\n/)) {
    const line = rawLine.trim();
    if (!line) {
      flushBullets();
      continue;
    }

    if (/^\[[^\]]+\]$/.test(line)) {
      flushBullets();
      blocks.push({ type: 'label', content: line.slice(1, -1) });
      continue;
    }

    if (BULLET_PREFIX_RE.test(line)) {
      bulletBuffer.push(line.replace(BULLET_PREFIX_RE, ''));
      continue;
    }

    flushBullets();
    blocks.push({ type: 'paragraph', content: line });
  }

  flushBullets();
  return blocks;
}

function renderInline(text: string, keyPrefix: string, boldClass: string, italicClass: string): React.ReactNode {
  const nodes: React.ReactNode[] = [];
  const regex = /\*\*([^*]+)\*\*|\*([^*]+)\*/g;
  let lastIndex = 0;
  let match: RegExpExecArray | null;
  let index = 0;

  while ((match = regex.exec(text)) !== null) {
    if (match.index > lastIndex) {
      nodes.push(text.slice(lastIndex, match.index));
    }
    if (match[1] !== undefined) {
      nodes.push(
        <strong key={`${keyPrefix}-b${index++}`} className={boldClass}>
          {match[1]}
        </strong>
      );
    } else if (match[2] !== undefined) {
      nodes.push(
        <em key={`${keyPrefix}-i${index++}`} className={italicClass}>
          {match[2]}
        </em>
      );
    }
    lastIndex = regex.lastIndex;
  }

  if (lastIndex < text.length) {
    nodes.push(text.slice(lastIndex));
  }

  return nodes.length === 1 ? nodes[0] : <>{nodes}</>;
}

interface FormattedCoachTextProps {
  text: string;
  variant?: 'chat' | 'tactical';
  className?: string;
}

export default function FormattedCoachText({
  text,
  variant = 'chat',
  className = '',
}: FormattedCoachTextProps) {
  const blocks = parseBlocks(text);
  const isTactical = variant === 'tactical';

  const textClass = isTactical
    ? 'text-sm leading-relaxed text-zinc-200 font-mono'
    : 'text-[13px] leading-relaxed';

  const boldClass = isTactical ? 'font-bold text-amber-400' : 'font-semibold text-zinc-100';
  const italicClass = isTactical ? 'text-zinc-500 not-italic text-xs' : 'text-zinc-400 italic';
  const bulletClass = isTactical ? 'text-amber-500' : 'text-amber-400';

  return (
    <div className={`space-y-3 text-left ${textClass} ${className}`}>
      {blocks.map((block, i) => {
        switch (block.type) {
          case 'label':
            return (
              <p
                key={i}
                className="text-[10px] font-bold uppercase tracking-widest text-amber-500/80 font-mono"
              >
                {block.content}
              </p>
            );
          case 'bullets':
            return (
              <ul key={i} className="space-y-2.5 list-none m-0 p-0">
                {block.items.map((item, j) => (
                  <li key={j} className="flex gap-2.5 items-start">
                    <span
                      className={`${bulletClass} shrink-0 mt-1 text-xs leading-none select-none`}
                      aria-hidden
                    >
                      •
                    </span>
                    <span className="flex-1 min-w-0">
                      {renderInline(item, `b${i}-${j}`, boldClass, italicClass)}
                    </span>
                  </li>
                ))}
              </ul>
            );
          case 'paragraph':
            return (
              <p key={i}>
                {renderInline(block.content, `p${i}`, boldClass, italicClass)}
              </p>
            );
          default:
            return null;
        }
      })}
    </div>
  );
}
