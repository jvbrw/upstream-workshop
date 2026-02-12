"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  RiDeleteBinLine,
  RiPencilLine,
  RiCheckLine,
  RiCloseLine,
} from "@remixicon/react";
import type { HydrationLog, DayGroup } from "../types";

type ManageViewProps = {
  logs: HydrationLog[];
  onDelete: (id: string) => void;
  onEdit: (id: string, newAmount: number) => void;
};

function groupByDay(logs: HydrationLog[]): DayGroup[] {
  const groups = new Map<string, HydrationLog[]>();

  logs.forEach((log) => {
    const date = new Date(log.timestamp);
    const key = date.toISOString().split("T")[0];
    const existing = groups.get(key) ?? [];
    existing.push(log);
    groups.set(key, existing);
  });

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);

  return Array.from(groups.entries())
    .sort(([a], [b]) => b.localeCompare(a))
    .map(([dateStr, dayLogs]) => {
      const date = new Date(dateStr + "T00:00:00");
      let label: string;

      if (date.toDateString() === today.toDateString()) {
        label = "Today";
      } else if (date.toDateString() === yesterday.toDateString()) {
        label = "Yesterday";
      } else {
        label = date.toLocaleDateString("en-US", {
          weekday: "short",
          month: "short",
          day: "numeric",
        });
      }

      return {
        date: dateStr,
        label,
        logs: dayLogs.sort(
          (a, b) =>
            new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
        ),
        total: dayLogs.reduce((sum, log) => sum + log.amount, 0),
      };
    });
}

function LogEntry({
  log,
  onDelete,
  onEdit,
}: {
  log: HydrationLog;
  onDelete: (id: string) => void;
  onEdit: (id: string, newAmount: number) => void;
}) {
  const [editing, setEditing] = useState(false);
  const [editValue, setEditValue] = useState(String(log.amount));

  function handleSave() {
    const amount = parseInt(editValue, 10);
    if (amount > 0 && amount <= 5000) {
      onEdit(log.id, amount);
      setEditing(false);
    }
  }

  return (
    <div className="flex items-center gap-3 rounded-xl bg-muted/50 px-4 py-3">
      {editing ? (
        <>
          <input
            type="number"
            value={editValue}
            onChange={(e) => setEditValue(e.target.value)}
            className="h-8 w-20 rounded-md border border-input bg-transparent px-2 text-center font-medium outline-none focus:border-primary"
            min={1}
            max={5000}
            autoFocus
          />
          <span className="text-sm text-muted-foreground">ml</span>
          <div className="ml-auto flex gap-1">
            <Button size="icon-xs" variant="default" onClick={handleSave}>
              <RiCheckLine className="size-3" />
            </Button>
            <Button
              size="icon-xs"
              variant="ghost"
              onClick={() => {
                setEditing(false);
                setEditValue(String(log.amount));
              }}
            >
              <RiCloseLine className="size-3" />
            </Button>
          </div>
        </>
      ) : (
        <>
          <span className="font-medium text-foreground">{log.amount}ml</span>
          <span className="text-sm text-muted-foreground">
            {new Date(log.timestamp).toLocaleTimeString("en-US", {
              hour: "numeric",
              minute: "2-digit",
              hour12: true,
            })}
          </span>
          <div className="ml-auto flex gap-1">
            <Button
              size="icon-xs"
              variant="ghost"
              onClick={() => setEditing(true)}
            >
              <RiPencilLine className="size-3" />
            </Button>
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button size="icon-xs" variant="ghost">
                  <RiDeleteBinLine className="size-3 text-destructive" />
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent size="sm">
                <AlertDialogHeader>
                  <AlertDialogTitle>Delete entry?</AlertDialogTitle>
                  <AlertDialogDescription>
                    Remove this {log.amount}ml entry. This can&apos;t be undone.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction
                    variant="destructive"
                    onClick={() => onDelete(log.id)}
                  >
                    Delete
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </>
      )}
    </div>
  );
}

export function ManageView({ logs, onDelete, onEdit }: ManageViewProps) {
  const groups = groupByDay(logs);

  return (
    <div className="flex flex-col gap-6 px-4 pt-6 pb-4">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-semibold text-foreground">Manage</h1>
        <p className="text-sm text-muted-foreground">
          {logs.length} entries total
        </p>
      </div>

      {/* Grouped entries */}
      {groups.length === 0 ? (
        <div className="rounded-xl border border-dashed border-border px-6 py-12 text-center">
          <p className="text-muted-foreground">No entries yet.</p>
          <p className="mt-1 text-sm text-muted-foreground">
            Log some water on the Today tab.
          </p>
        </div>
      ) : (
        groups.map((group) => (
          <div key={group.date} className="space-y-2">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-medium text-foreground">
                {group.label}
              </h2>
              <span className="text-xs text-muted-foreground">
                {group.total >= 1000
                  ? `${Math.round(group.total / 100) / 10}L`
                  : `${group.total}ml`}{" "}
                total
              </span>
            </div>
            <div className="space-y-1">
              {group.logs.map((log) => (
                <LogEntry
                  key={log.id}
                  log={log}
                  onDelete={onDelete}
                  onEdit={onEdit}
                />
              ))}
            </div>
          </div>
        ))
      )}
    </div>
  );
}
