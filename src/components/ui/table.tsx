import * as React from "react";

const Table = React.forwardRef<HTMLTableElement, React.HTMLAttributes<HTMLTableElement>>(
  ({ style, ...props }, ref) => (
    <div style={{ position: "relative", width: "100%", overflowX: "auto" }}>
      <table ref={ref} style={{ width: "100%", fontSize: "14px", captionSide: "bottom", ...style }} {...props} />
    </div>
  ),
);
Table.displayName = "Table";

const TableHeader = React.forwardRef<HTMLTableSectionElement, React.HTMLAttributes<HTMLTableSectionElement>>(
  ({ style, ...props }, ref) => <thead ref={ref} style={{ borderBottom: "1px solid #e5e7eb", ...style }} {...props} />,
);
TableHeader.displayName = "TableHeader";

const TableBody = React.forwardRef<HTMLTableSectionElement, React.HTMLAttributes<HTMLTableSectionElement>>(
  ({ style, ...props }, ref) => (
    <tbody ref={ref} style={style} {...props} />
  ),
);
TableBody.displayName = "TableBody";

const TableFooter = React.forwardRef<HTMLTableSectionElement, React.HTMLAttributes<HTMLTableSectionElement>>(
  ({ style, ...props }, ref) => (
    <tfoot ref={ref} style={{ borderTop: "1px solid #e5e7eb", backgroundColor: "#f9fafb", fontWeight: "500", ...style }} {...props} />
  ),
);
TableFooter.displayName = "TableFooter";

const TableRow = React.forwardRef<HTMLTableRowElement, React.HTMLAttributes<HTMLTableRowElement>>(
  ({ style, ...props }, ref) => (
    <tr
      ref={ref}
      style={{ borderBottom: "1px solid #e5e7eb", transition: "background-color 0.2s", ...style }}
      {...props}
    />
  ),
);
TableRow.displayName = "TableRow";

const TableHead = React.forwardRef<HTMLTableCellElement, React.ThHTMLAttributes<HTMLTableCellElement>>(
  ({ style, ...props }, ref) => (
    <th
      ref={ref}
      style={{
        height: "48px",
        paddingLeft: "16px",
        paddingRight: "16px",
        textAlign: "left",
        verticalAlign: "middle",
        fontWeight: "500",
        color: "#6b7280",
        ...style,
      }}
      {...props}
    />
  ),
);
TableHead.displayName = "TableHead";

const TableCell = React.forwardRef<HTMLTableCellElement, React.TdHTMLAttributes<HTMLTableCellElement>>(
  ({ style, ...props }, ref) => (
    <td ref={ref} style={{ padding: "16px", verticalAlign: "middle", ...style }} {...props} />
  ),
);
TableCell.displayName = "TableCell";

const TableCaption = React.forwardRef<HTMLTableCaptionElement, React.HTMLAttributes<HTMLTableCaptionElement>>(
  ({ style, ...props }, ref) => (
    <caption ref={ref} style={{ marginTop: "16px", fontSize: "14px", color: "#6b7280", ...style }} {...props} />
  ),
);
TableCaption.displayName = "TableCaption";

export { Table, TableHeader, TableBody, TableFooter, TableHead, TableRow, TableCell, TableCaption };
