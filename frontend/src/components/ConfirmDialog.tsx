import { useState } from 'react';
import { X } from 'lucide-react';

interface ConfirmDialogProps {
  open: boolean;
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  onConfirm: () => void;
  onCancel: () => void;
  danger?: boolean;
}

export default function ConfirmDialog({
  open,
  title,
  message,
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  onConfirm,
  onCancel,
  danger = false,
}: ConfirmDialogProps) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-ink-950/60 backdrop-blur-sm" onClick={onCancel} />
      <div className="relative w-full max-w-sm rounded-2xl border border-parchment-200 bg-parchment-50 p-6 shadow-2xl">
        <h3 className="font-display text-d-title font-semibold text-ink-800">{title}</h3>
        <p className="mt-2 text-d-body text-ink-600">{message}</p>
        <div className="mt-6 flex gap-2">
          <button onClick={onCancel} className="btn-ghost flex-1 py-2 text-d-label">
            {cancelLabel}
          </button>
          <button
            onClick={onConfirm}
            className={`flex-1 py-2 text-d-label font-medium text-parchment-50 ${
              danger ? 'bg-red-600 hover:bg-red-700' : 'btn-primary'
            }`}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
