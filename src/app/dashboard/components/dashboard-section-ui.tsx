import type { ReactNode } from "react";
import { Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
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

type CrudDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  triggerLabel: string;
  title: string;
  children: ReactNode;
  submitLabel: string;
  savingLabel?: string;
  isSaving: boolean;
  onSubmit: () => void;
  contentClassName?: string;
};

export function CrudDialog({
  open,
  onOpenChange,
  triggerLabel,
  title,
  children,
  submitLabel,
  savingLabel = "Saving...",
  isSaving,
  onSubmit,
  contentClassName,
}: CrudDialogProps) {
  return (
    <Dialog onOpenChange={onOpenChange} open={open}>
      <DialogTrigger asChild>
        <Button className="w-full bg-accent font-bold text-accent-foreground sm:w-auto">
          <Plus className="mr-2 h-4 w-4" />
          {triggerLabel}
        </Button>
      </DialogTrigger>
      <DialogContent className={contentClassName}>
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
        </DialogHeader>
        {children}
        <DialogFooter>
          <Button className="w-full font-bold" disabled={isSaving} onClick={onSubmit}>
            {isSaving ? savingLabel : submitLabel}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

type DeleteIconButtonProps = {
  onClick: () => void;
  className?: string;
  iconClassName?: string;
};

export function DeleteIconButton({
  onClick,
  className = "h-8 w-8 text-destructive",
  iconClassName = "h-4 w-4",
}: DeleteIconButtonProps) {
  return (
    <Button className={className} onClick={onClick} size="icon" variant="ghost">
      <Trash2 className={iconClassName} />
    </Button>
  );
}
