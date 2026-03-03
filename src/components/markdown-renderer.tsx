"use client";

import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeHighlight from "rehype-highlight";

type MarkdownRendererProps = {
  content: string;
  className?: string;
};

function getSafeHttpsUrl(url: string | undefined): string | null {
  if (!url) return null;
  const trimmed = url.trim();
  if (!trimmed) return null;

  try {
    const parsedUrl = new URL(trimmed);
    if (parsedUrl.protocol !== "https:") {
      return null;
    }
    return parsedUrl.toString();
  } catch {
    return null;
  }
}

export function MarkdownRenderer({
  content,
  className = "",
}: MarkdownRendererProps) {
  return (
    <div className={`prose-mdrop ${className}`}>
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        rehypePlugins={[rehypeHighlight]}
        components={{
          img: ({ src, alt }) => {
            const srcString = typeof src === "string" ? src : undefined;
            const safeSrc = getSafeHttpsUrl(srcString);
            if (!safeSrc) {
              return null;
            }

            return (
              <img
                src={safeSrc}
                alt={
                  typeof alt === "string" && alt.trim().length > 0
                    ? alt
                    : "Image"
                }
                loading="lazy"
                decoding="async"
              />
            );
          },
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
}
