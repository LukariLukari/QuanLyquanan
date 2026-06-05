import React from 'react';
import { cn } from '../../lib/utils';
import { X } from 'lucide-react';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  className?: string;
}

export function Modal({ isOpen, onClose, title, children, className }: ModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-ink/40 backdrop-blur-sm">
      <div className={cn("relative w-full max-w-lg rounded-[32px] bg-canvas p-8 shadow-soft", className)}>
        <button
          onClick={onClose}
          className="absolute right-6 top-6 rounded-full p-2 hover:bg-surface-soft transition-colors"
        >
          <X className="h-5 w-5 text-muted" />
        </button>
        {title && <h2 className="mb-6 text-2xl font-bold">{title}</h2>}
        <div>{children}</div>
      </div>
    </div>
  );
}
