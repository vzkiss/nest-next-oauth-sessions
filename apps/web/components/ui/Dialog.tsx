'use client';

import { useEffect, useRef, type ReactNode } from 'react';

type DialogProps = {
  open: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
};

export function Dialog({ open, onClose, title, children }: DialogProps) {
  const ref = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const dialog = ref.current;
    if (!dialog) return;

    if (open && !dialog.open) {
      dialog.showModal();
    } else if (!open && dialog.open) {
      dialog.close();
    }
  }, [open]);

  return (
    <dialog
      ref={ref}
      onClose={onClose}
      onClick={(e) => {
        if (e.target === ref.current) onClose();
      }}
      className="bg-surface m-auto w-full max-w-md rounded-2xl p-6 shadow-lg backdrop:bg-black/40 backdrop:backdrop-blur-sm"
    >
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-foreground text-lg font-semibold">{title}</h2>
        <button
          onClick={onClose}
          className="text-foreground-subtle hover:text-foreground-muted focus-visible:ring-ring cursor-pointer rounded-md p-1 text-lg transition-colors focus-visible:ring-2 focus-visible:outline-none active:scale-[0.90]"
          aria-label="Close"
        >
          ✕
        </button>
      </div>
      {children}
    </dialog>
  );
}
