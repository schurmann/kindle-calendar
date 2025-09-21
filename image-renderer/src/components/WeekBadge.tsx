interface WeekBadgeProps {
  weekNumber: number;
}

export function WeekBadge({ weekNumber }: WeekBadgeProps) {
  return (
    <>
      <style>{`
        .week-badge-container {
          padding: 8px 20px;
          text-align: left;
        }
        .week-badge {
          background: #000;
          color: white;
          padding: 6px 12px;
          font-weight: bold;
          font-size: 16px;
          border-radius: 4px;
          display: inline-block;
        }
      `}</style>
      <div class="week-badge-container">
        <span class="week-badge">V.{weekNumber}</span>
      </div>
    </>
  );
}
