import { PREDICTION_STATUS_META, type PredictionStatus } from "@/types/prediction";

interface PredictionStatusBadgeProps {
  status: PredictionStatus;
  size?: "sm" | "md";
}

/** Color-coded status pill — reused across prediction cards, the modal, and
 *  the full article page so a status always reads the same way everywhere. */
export default function PredictionStatusBadge({ status, size = "sm" }: PredictionStatusBadgeProps) {
  const meta = PREDICTION_STATUS_META[status];
  const isSmall = size === "sm";

  return (
    <span
      className="inline-flex items-center gap-1.5 rounded-full border font-medium uppercase"
      style={{
        borderColor: `${meta.color}40`,
        background: `${meta.color}18`,
        color: meta.color,
        letterSpacing: "0.08em",
        fontSize: isSmall ? "0.5625rem" : "0.6875rem",
        padding: isSmall ? "0.2rem 0.6rem" : "0.3rem 0.8rem",
      }}
    >
      <span
        className="inline-block rounded-full"
        style={{
          width: isSmall ? "5px" : "6px",
          height: isSmall ? "5px" : "6px",
          background: meta.color,
          boxShadow: `0 0 6px ${meta.color}`,
        }}
      />
      {meta.label}
    </span>
  );
}
