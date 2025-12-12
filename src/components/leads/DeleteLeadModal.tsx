"use client";

import React, { useState } from "react";
import { Lead } from "@/services/leadService";
import { Modal } from "@/components/ui/modal";
import Button from "@/components/ui/button/Button";

interface DeleteLeadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (leadId: number) => Promise<void>;
  lead: Lead | null;
}

export default function DeleteLeadModal({
  isOpen,
  onClose,
  onConfirm,
  lead
}: DeleteLeadModalProps) {
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleConfirm = async () => {
    if (!lead) return;

    setIsDeleting(true);
    setError(null);

    try {
      await onConfirm(lead.id);
      onClose();
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to delete lead';
      setError(errorMessage);
    } finally {
      setIsDeleting(false);
    }
  };

  const handleClose = () => {
    if (!isDeleting) {
      setError(null);
      onClose();
    }
  };

  if (!lead) return null;

  return (
    <Modal 
      isOpen={isOpen} 
      onClose={handleClose}
      showCloseButton={true}
      className="max-w-md w-full mx-auto my-8"
    >
      <div className="bg-white dark:bg-dark rounded-xl border border-stroke dark:border-strokedark">
        <div className="p-6 border-b border-stroke dark:border-strokedark">
          <div className="flex items-center gap-3">
            <div className="flex-shrink-0">
              <div className="flex items-center justify-center w-10 h-10 rounded-full bg-red-100 dark:bg-red-900/20">
                <svg className="w-6 h-6 text-red-600 dark:text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.464 0L4.35 16.5c-.77.833.192 2.5 1.732 2.5z" />
                </svg>
              </div>
            </div>
            <h2 className="text-2xl font-bold text-black dark:text-white">
              Delete Lead
            </h2>
          </div>
        </div>

        {/* Body */}
        <div className="p-6 space-y-4">
          {error && (
            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
              <p className="text-red-800 dark:text-red-200">{error}</p>
            </div>
          )}

          <p className="text-body dark:text-bodydark">
            Are you sure you want to delete this lead? This action cannot be undone.
          </p>

          {/* Lead Info */}
          <div className="bg-gray-50 dark:bg-gray/10 border border-stroke dark:border-strokedark rounded-lg p-4">
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-sm font-medium text-body dark:text-bodydark">Name:</span>
                <span className="text-sm text-black dark:text-white">{lead.name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm font-medium text-body dark:text-bodydark">Email:</span>
                <span className="text-sm text-black dark:text-white">{lead.email}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm font-medium text-body dark:text-bodydark">Phone:</span>
                <span className="text-sm text-black dark:text-white">{lead.mobileNumber}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm font-medium text-body dark:text-bodydark">Status:</span>
                <span className="text-sm text-black dark:text-white capitalize">{lead.status}</span>
              </div>
              {lead.potentialInvestment && (
                <div className="flex justify-between">
                  <span className="text-sm font-medium text-body dark:text-bodydark">Expected Investment:</span>
                  <span className="text-sm text-black dark:text-white">
                    ₹{new Intl.NumberFormat("en-IN").format(Number(lead.potentialInvestment))}
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Warning */}
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="w-5 h-5 text-red-400" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm text-red-800 dark:text-red-200">
                  <strong>Warning:</strong> This will permanently delete the lead and all associated data.
                </p>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="flex gap-3 pt-4">
            <Button
              variant="outline"
              onClick={handleClose}
              disabled={isDeleting}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              onClick={handleConfirm}
              disabled={isDeleting}
              className="bg-red-600 hover:bg-red-700 text-white border-red-600 hover:border-red-700 flex-1"
            >
              {isDeleting ? "Deleting..." : "Delete Lead"}
            </Button>
          </div>
        </div>
      </div>
    </Modal>
  );
}