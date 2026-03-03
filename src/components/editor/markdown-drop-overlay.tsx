type MarkdownDropOverlayProps = {
  message?: string;
};

export function MarkdownDropOverlay({
  message = "Drop .md file anywhere to import",
}: MarkdownDropOverlayProps) {
  return (
    <div className="fixed inset-0 z-50 pointer-events-none bg-[var(--accent-subtle)]/45">
      <div className="absolute inset-6 flex items-center justify-center rounded-[16px] border-2 border-dashed border-[var(--accent)]">
        <p className="text-body font-semibold text-[var(--accent)]">{message}</p>
      </div>
    </div>
  );
}
