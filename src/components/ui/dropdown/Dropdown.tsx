"use client";
import type React from "react";
import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";

interface DropdownProps {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
  className?: string;
  usePortal?: boolean; // Option to use portal rendering (default: true on mobile)
}

export const Dropdown: React.FC<DropdownProps> = ({
  isOpen,
  onClose,
  children,
  className = "",
  usePortal = true,
}) => {
  const dropdownRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLElement | null>(null);
  const [dropdownPosition, setDropdownPosition] = useState({ top: 0, left: 0, width: 0 });
  const [isMobile, setIsMobile] = useState(false);

  // Detect mobile viewport
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 1024); // lg breakpoint
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Node;
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(target) &&
        !(event.target as HTMLElement).closest('.dropdown-toggle')
      ) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [onClose, isOpen]);

  // Calculate dropdown position for portal rendering
  useEffect(() => {
    if (isOpen && usePortal && isMobile) {
      const updatePosition = () => {
        const trigger = document.querySelector('.dropdown-toggle');
        if (trigger) {
          triggerRef.current = trigger as HTMLElement;
          const rect = trigger.getBoundingClientRect();
          setDropdownPosition({
            top: rect.bottom + 4,
            left: rect.left,
            width: rect.width,
          });
        }
      };
      updatePosition();
      window.addEventListener('scroll', updatePosition, true);
      window.addEventListener('resize', updatePosition);
      return () => {
        window.removeEventListener('scroll', updatePosition, true);
        window.removeEventListener('resize', updatePosition);
      };
    }
  }, [isOpen, usePortal, isMobile]);

  if (!isOpen) return null;

  const dropdownContent = (
    <div
      ref={dropdownRef}
      className={`${usePortal && isMobile ? 'fixed' : 'absolute'} z-50 right-0 mt-2 rounded-xl border border-gray-200 bg-white shadow-theme-lg dark:border-gray-800 dark:bg-gray-dark ${className}`}
      style={usePortal && isMobile ? {
        top: `${dropdownPosition.top}px`,
        right: `${window.innerWidth - dropdownPosition.left - dropdownPosition.width}px`,
        left: 'auto',
        width: 'auto',
        minWidth: '220px',
        maxWidth: 'calc(100vw - 32px)',
        position: 'fixed',
      } : undefined}
    >
      {children}
    </div>
  );

  // Use portal on mobile, regular rendering on desktop
  if (typeof window !== 'undefined' && usePortal && isMobile) {
    return createPortal(dropdownContent, document.body);
  }

  return dropdownContent;
};
