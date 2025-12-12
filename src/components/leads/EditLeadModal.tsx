"use client";

import React, { useState, useEffect } from "react";
import { Lead, UpdateLeadData } from "@/services/leadService";
import { Modal } from "@/components/ui/modal";
import Button from "@/components/ui/button/Button";
import DatePicker from "@/components/form/DatePicker";

interface EditLeadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (leadId: number, data: UpdateLeadData) => Promise<void>;
  lead: Lead | null;
  userOptions?: { value: string; label: string }[];
  currentUser?: { id: number; name: string } | null;
  designations?: { value: string; label: string }[];
}

export default function EditLeadModal({
  isOpen,
  onClose,
  onSave,
  lead,
  userOptions = [],
  currentUser,
  designations = []
}: EditLeadModalProps) {
  const [formData, setFormData] = useState<UpdateLeadData>({});
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedDesignation, setSelectedDesignation] = useState<string>('');

  useEffect(() => {
    if (lead && isOpen) {
      setFormData({
        name: lead.name,
        email: lead.email,
        mobileNumber: lead.mobileNumber,
        source: lead.source,
        status: lead.status,
        assignedToId: lead.assignedToId,
        potentialInvestment: lead.potentialInvestment,
        convertedAmount: lead.convertedAmount,
        notes: lead.notes || "",
        nextFollowUpAt: lead.nextFollowUpAt ? new Date(lead.nextFollowUpAt).toISOString().split('T')[0] : "",
        priority: lead.priority || 0
      });
      setError(null);
      setSelectedDesignation(''); // Reset designation when modal opens
    }
  }, [lead, isOpen]);

  const handleInputChange = (field: keyof UpdateLeadData, value: string | number | undefined) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!lead) return;

    setIsLoading(true);
    setError(null);

    try {
      // Clean the form data before sending
      const cleanedData: UpdateLeadData = {};
      
      // Only include fields that have values or are explicitly set
      if (formData.name && formData.name.trim()) cleanedData.name = formData.name.trim();
      if (formData.email && formData.email.trim()) cleanedData.email = formData.email.trim();
      if (formData.mobileNumber && formData.mobileNumber.trim()) cleanedData.mobileNumber = formData.mobileNumber.trim();
      if (formData.source && formData.source.trim()) cleanedData.source = formData.source.trim();
      if (formData.status) cleanedData.status = formData.status;
      if (formData.assignedToId) cleanedData.assignedToId = formData.assignedToId;
      if (formData.potentialInvestment !== undefined && formData.potentialInvestment !== null) {
        cleanedData.potentialInvestment = Number(formData.potentialInvestment);
      }
      if (formData.convertedAmount !== undefined && formData.convertedAmount !== null) {
        cleanedData.convertedAmount = Number(formData.convertedAmount);
      }
      if (formData.nextFollowUpAt && formData.nextFollowUpAt.trim()) {
        cleanedData.nextFollowUpAt = formData.nextFollowUpAt.trim();
      }
      if (formData.notes && formData.notes.trim()) cleanedData.notes = formData.notes.trim();
      if (formData.priority !== undefined && formData.priority !== null) {
        cleanedData.priority = Number(formData.priority);
      }

      console.log('Submitting cleaned data:', cleanedData);
      await onSave(lead.id, cleanedData);
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to update lead';
      setError(errorMessage);
      console.error('Error updating lead:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    if (!isLoading) {
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
      className="max-w-2xl w-full mx-auto my-8"
    >
      <div className="bg-white dark:bg-dark rounded-xl border border-stroke dark:border-strokedark max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-stroke dark:border-strokedark">
          <h2 className="text-2xl font-bold text-black dark:text-white">Edit Lead: {lead.name}</h2>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4 mb-6">
              <p className="text-red-800 dark:text-red-200">{error}</p>
            </div>
          )}

          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-black dark:text-white mb-2">
                Name *
              </label>
              <input
                type="text"
                value={formData.name || ""}
                onChange={(e) => handleInputChange("name", e.target.value)}
                className="w-full bg-transparent text-black dark:text-white px-4 py-2 rounded-lg border border-stroke dark:border-strokedark focus:border-primary focus:ring-1 focus:ring-primary outline-none"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-black dark:text-white mb-2">
                Mobile Number *
              </label>
              <input
                type="tel"
                value={formData.mobileNumber || ""}
                onChange={(e) => handleInputChange("mobileNumber", e.target.value)}
                className="w-full bg-transparent text-black dark:text-white px-4 py-2 rounded-lg border border-stroke dark:border-strokedark focus:border-primary focus:ring-1 focus:ring-primary outline-none"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-black dark:text-white mb-2">
                Email *
              </label>
              <input
                type="email"
                value={formData.email || ""}
                onChange={(e) => handleInputChange("email", e.target.value)}
                className="w-full bg-transparent text-black dark:text-white px-4 py-2 rounded-lg border border-stroke dark:border-strokedark focus:border-primary focus:ring-1 focus:ring-primary outline-none"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-black dark:text-white mb-2">
                Source
              </label>
              <select
                value={formData.source || ""}
                onChange={(e) => handleInputChange("source", e.target.value)}
                className="w-full bg-transparent text-black dark:text-white px-4 py-2 rounded-lg border border-stroke dark:border-strokedark focus:border-primary focus:ring-1 focus:ring-primary outline-none"
              >
                <option>Website</option>
                <option>Referral</option>
                <option>Cold Call</option>
                <option>Social Media</option>
                <option>Event</option>
                <option>Other</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-black dark:text-white mb-2">
                Status
              </label>
              <select
                value={formData.status || ""}
                onChange={(e) => handleInputChange("status", e.target.value)}
                className="w-full bg-transparent text-black dark:text-white px-4 py-2 rounded-lg border border-stroke dark:border-strokedark focus:border-primary focus:ring-1 focus:ring-primary outline-none"
              >
                <option value="new">New</option>
                <option value="in-progress">In Progress</option>
                <option value="converted">Converted</option>
                <option value="lost">Lost</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-black dark:text-white mb-2">
                Assign to Designation
              </label>
              <select
                value={selectedDesignation}
                onChange={(e) => {
                  setSelectedDesignation(e.target.value);
                  // If "assign to yourself" is selected, automatically set the current user
                  if (e.target.value === 'assign_to_yourself' && currentUser?.id) {
                    handleInputChange("assignedToId", currentUser.id);
                  } else {
                    handleInputChange("assignedToId", undefined);
                  }
                }}
                className="w-full bg-transparent text-black dark:text-white px-4 py-2 rounded-lg border border-stroke dark:border-strokedark focus:border-primary focus:ring-1 focus:ring-primary outline-none"
              >
                <option value="">Select Designation</option>
                {/* Assign to Yourself Option */}
                <option 
                  value="assign_to_yourself" 
                  className="bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 font-medium"
                >
                  🙋‍♂️ Assign to Yourself
                </option>
                {designations.map((designation) => (
                  <option key={designation.value} value={designation.value}>
                    {designation.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-black dark:text-white mb-2">
                Assigned To
              </label>
              <select
                value={formData.assignedToId?.toString() || ""}
                onChange={(e) => handleInputChange("assignedToId", e.target.value ? parseInt(e.target.value) : undefined)}
                className={`w-full bg-transparent text-black dark:text-white px-4 py-2 rounded-lg border border-stroke dark:border-strokedark focus:border-primary focus:ring-1 focus:ring-primary outline-none ${
                  selectedDesignation === 'assign_to_yourself' ? 'opacity-50 cursor-not-allowed' : ''
                }`}
                disabled={selectedDesignation === 'assign_to_yourself'}
              >
                {selectedDesignation === 'assign_to_yourself' ? (
                  <option value={currentUser?.id || ''}>
                    ✅ Assigned to You ({currentUser?.name || 'You'})
                  </option>
                ) : (
                  <>
                    <option value="">Unassigned</option>
                    {/* All available users */}
                    {userOptions.length > 0 && (
                      <>
                        <optgroup label="Team Members">
                          {userOptions.map((user) => (
                            <option key={user.value} value={user.value}>
                              {user.label}
                            </option>
                          ))}
                        </optgroup>
                      </>
                    )}
                  </>
                )}
              </select>
              {selectedDesignation === 'assign_to_yourself' && (
                <p className="text-sm text-blue-600 dark:text-blue-400 mt-1">
                  💡 Lead will be assigned to you automatically
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-black dark:text-white mb-2">
                Expected Investment
              </label>
              <input
                type="number"
                value={formData.potentialInvestment || ""}
                onChange={(e) => handleInputChange("potentialInvestment", e.target.value ? parseFloat(e.target.value) : undefined)}
                placeholder="500000"
                className="w-full bg-transparent text-black dark:text-white px-4 py-2 rounded-lg border border-stroke dark:border-strokedark focus:border-primary focus:ring-1 focus:ring-primary outline-none"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-black dark:text-white mb-2">
                Invested Amount
              </label>
              <input
                type="number"
                value={formData.convertedAmount || ""}
                onChange={(e) => handleInputChange("convertedAmount", e.target.value ? parseFloat(e.target.value) : undefined)}
                placeholder="450000"
                className="w-full bg-transparent text-black dark:text-white px-4 py-2 rounded-lg border border-stroke dark:border-strokedark focus:border-primary focus:ring-1 focus:ring-primary outline-none"
              />
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                Actual amount invested (usually filled after conversion)
              </p>
            </div>

            <div className="md:col-span-2">
              <DatePicker
                label="Next Follow-up Date"
                value={formData.nextFollowUpAt || ""}
                onChange={(value) => handleInputChange("nextFollowUpAt", value)}
                placeholder="Select follow-up date"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-black dark:text-white mb-2">
                Notes
              </label>
              <textarea
                value={formData.notes || ""}
                onChange={(e) => handleInputChange("notes", e.target.value)}
                rows={3}
                className="w-full bg-transparent text-black dark:text-white px-4 py-2 rounded-lg border border-stroke dark:border-strokedark focus:border-primary focus:ring-1 focus:ring-primary outline-none"
                placeholder="Add notes about this lead..."
              />
            </div>
          </div>

          <div className="flex gap-3 pt-4">
            <Button
              variant="outline"
              onClick={handleClose}
              disabled={isLoading}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              variant="primary"
              type="submit"
              disabled={isLoading || !formData.name || !formData.mobileNumber || !formData.email}
              className="flex-1"
            >
              {isLoading ? "Updating..." : "Update Lead"}
            </Button>
          </div>
        </form>
      </div>
    </Modal>
  );
}