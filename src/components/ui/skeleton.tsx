function Skeleton({ style, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div style={{ animation: "pulse 2s infinite", borderRadius: "6px", backgroundColor: "#f3f4f6", ...style }} {...props} />;
}

export { Skeleton };
