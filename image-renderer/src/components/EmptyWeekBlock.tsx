interface EmptyWeekBlockProps {
  weekNumber: number;
  isLastEmpty: boolean;
}

export function EmptyWeekBlock({
  weekNumber,
  isLastEmpty,
}: EmptyWeekBlockProps) {
  const classNames = ["empty-week-block", isLastEmpty && "last-empty"]
    .filter(Boolean)
    .join(" ");

  return (
    <>
      <style>{`
        .empty-week-block {
          background: #f0f0f0;
          border-bottom: 1px solid #ccc;
          padding: 12px 20px;
          text-align: center;
          font-size: 16px;
          color: #666;
          font-style: italic;
        }
        .empty-week-block.last-empty {
          border-bottom: none;
        }
      `}</style>
      <div class={classNames}>V.{weekNumber} (inga händelser)</div>
    </>
  );
}
