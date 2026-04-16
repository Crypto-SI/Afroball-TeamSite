import type { ReactNode } from "react";
import { TableCell, TableRow } from "@/components/ui/table";

type DashboardSectionHeaderProps = {
  title: string;
  description: string;
  action?: ReactNode;
};

export function DashboardSectionHeader({
  title,
  description,
  action,
}: DashboardSectionHeaderProps) {
  return (
    <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
      <div>
        <h2 className="text-2xl font-black uppercase sm:text-3xl">{title}</h2>
        <p className="text-xs text-muted-foreground sm:text-sm">{description}</p>
      </div>
      {action}
    </div>
  );
}

type EmptyTableRowProps = {
  colSpan: number;
  children: ReactNode;
};

export function EmptyTableRow({ colSpan, children }: EmptyTableRowProps) {
  return (
    <TableRow>
      <TableCell className="py-12 text-center text-muted-foreground italic" colSpan={colSpan}>
        {children}
      </TableCell>
    </TableRow>
  );
}
