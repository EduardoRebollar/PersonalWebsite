import { palette, fontStack } from "./shared";

/**
 * Matches the matplotlib title block: oversized display title,
 * a short coral accent rule, and an italic muted subtitle.
 */
export function TitleBlock({
  title,
  subtitle,
}: {
  title: string;
  subtitle?: string;
}) {
  return (
    <div style={{ marginBottom: 20, fontFamily: fontStack }}>
      <h3
        style={{
          fontSize: 22,
          fontWeight: 800,
          color: palette.text,
          margin: 0,
          letterSpacing: "-0.01em",
          lineHeight: 1.15,
        }}
      >
        {title}
      </h3>
      <div
        aria-hidden
        style={{
          width: 56,
          height: 3,
          background: palette.bilstm,
          borderRadius: 2,
          margin: "10px 0 8px",
        }}
      />
      {subtitle && (
        <p
          style={{
            fontSize: 13,
            color: palette.subtext,
            fontStyle: "italic",
            margin: 0,
            lineHeight: 1.4,
          }}
        >
          {subtitle}
        </p>
      )}
    </div>
  );
}

/** Small footer with sample size / dataset attribution. */
export function VizFooter({ n }: { n: number }) {
  return (
    <p
      style={{
        marginTop: 14,
        marginBottom: 0,
        fontSize: 11,
        fontStyle: "italic",
        color: palette.muted,
        textAlign: "right",
        fontFamily: fontStack,
      }}
    >
      n = {n.toLocaleString()} test samples
      {"  •  "}
      Jigsaw Toxic Comment Classification
    </p>
  );
}
