"use client";

import React, { useState, useEffect } from "react";
import { Lead, UpdateLeadData } from "@/services/leadService";
import { Modal } from "@/components/ui/modal";
import Button from "@/components/ui/button/Button";
import DatePicker from "@/components/form/DatePicker";
import Select from "@/components/form/Select";
import { ChevronDownIcon } from "@/icons";

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
  const [emailError, setEmailError] = useState<string>('');
  const [phoneError, setPhoneError] = useState<string>('');
  const [emailTouched, setEmailTouched] = useState(false);
  const [phoneTouched, setPhoneTouched] = useState(false);
  const [selectedSourceOption, setSelectedSourceOption] = useState<string>("Website");
  const [customSource, setCustomSource] = useState("");

  // Email regex pattern
  const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  // Phone regex pattern - exactly 10 digits
  const phoneRegex = /^\d{10}$/;

  useEffect(() => {
    if (lead && isOpen) {
      const predefinedSources = ["Website", "Referral", "Cold Call", "Social Media", "Event", "Other"];
      const sourceValue =
        lead.source && predefinedSources.includes(lead.source)
          ? lead.source
          : lead.source
          ? "Other"
          : "Website";

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
      setSelectedSourceOption(sourceValue);
      setCustomSource(sourceValue === "Other" ? lead.source || "" : "");
      // Reset validation states
      setEmailError('');
      setPhoneError('');
      setEmailTouched(false);
      setPhoneTouched(false);
    }
  }, [lead, isOpen]);

  const handleInputChange = (field: keyof UpdateLeadData, value: string | number | undefined) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    // Validate email
    if (field === 'email') {
      setEmailTouched(true);
      const emailValue = value as string;
      if (emailValue && !emailRegex.test(emailValue)) {
        setEmailError('Please enter a valid email address');
      } else {
        setEmailError('');
      }
    }
    
    // Validate phone number
    if (field === 'mobileNumber') {
      setPhoneTouched(true);
      const phoneValue = value as string;
      // Clear any previous backend error when user starts typing
      if (error && (error.toLowerCase().includes('mobile number') || error.toLowerCase().includes('phone number') || error.toLowerCase().includes('already exists'))) {
        setError(null);
      }
      // Remove any non-digit characters for validation
      const digitsOnly = phoneValue.replace(/\D/g, '');
      if (phoneValue && digitsOnly.length !== 10) {
        setPhoneError('Phone number must be exactly 10 digits');
      } else {
        setPhoneError('');
      }
    }
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
      
      // Check if error is related to mobile number conflict
      const isMobileNumberError = errorMessage.toLowerCase().includes('mobile number') || 
                                   errorMessage.toLowerCase().includes('phone number') ||
                                   errorMessage.toLowerCase().includes('already exists');
      
      if (isMobileNumberError) {
        // Set phone error to show below the phone input
        setPhoneError(errorMessage);
        setPhoneTouched(true);
        // Also set general error for visibility
        setError(errorMessage);
      } else {
        setError(errorMessage);
      }
      
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
              <div className="flex items-start">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                    <path
                      fillRule="evenodd"
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                      clipRule="evenodd"
                    />
                  </svg>
                </div>
                <div className="ml-3">
                  <p className="text-sm font-medium text-red-800 dark:text-red-200">{error}</p>
                </div>
              </div>
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
                className={`w-full bg-transparent text-black dark:text-white px-4 py-2 rounded-lg border ${
                  phoneTouched && phoneError 
                    ? 'border-red-500 dark:border-red-500' 
                    : 'border-stroke dark:border-strokedark'
                } focus:border-primary focus:ring-1 focus:ring-primary outline-none`}
                required
              />
              {phoneTouched && phoneError && (
                <p className="text-sm text-red-600 dark:text-red-400 mt-1">{phoneError}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-black dark:text-white mb-2">
                Email *
              </label>
              <input
                type="email"
                value={formData.email || ""}
                onChange={(e) => handleInputChange("email", e.target.value)}
                className={`w-full bg-transparent text-black dark:text-white px-4 py-2 rounded-lg border ${
                  emailTouched && emailError 
                    ? 'border-red-500 dark:border-red-500' 
                    : 'border-stroke dark:border-strokedark'
                } focus:border-primary focus:ring-1 focus:ring-primary outline-none`}
                required
              />
              {emailTouched && emailError && (
                <p className="text-sm text-red-600 dark:text-red-400 mt-1">{emailError}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-black dark:text-white mb-2">
                Source
              </label>
              <div className="relative">
                <Select
                  options={[
                    { value: "Website", label: "Website" },
                    { value: "Referral", label: "Referral" },
                    { value: "Cold Call", label: "Cold Call" },
                    { value: "Social Media", label: "Social Media" },
                    { value: "Event", label: "Event" },
                    { value: "Other", label: "Other" },
                  ]}
                  placeholder="Select Source"
                  value={selectedSourceOption}
                  onChange={(option) => {
                    const value = option?.value || "Website";
                    setSelectedSourceOption(value);
                    const predefinedSources = ["Website", "Referral", "Cold Call", "Social Media", "Event", "Other"];
                    if (value === "Other") {
                      const existing = formData.source && !predefinedSources.includes(formData.source)
                        ? String(formData.source)
                        : "";
                      setCustomSource(existing);
                      handleInputChange("source", existing);
                    } else {
                      setCustomSource("");
                      handleInputChange("source", value);
                    }
                  }}
                  className="dark:bg-dark"
                />
                <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 dark:text-gray-400">
                  <ChevronDownIcon />
                </span>
              </div>

              {selectedSourceOption === "Other" && (
                <div className="mt-2">
                  <label className="block text-xs font-medium text-black/70 dark:text-white/70 mb-1">
                    Other Source
                  </label>
                  <input
                    type="text"
                    value={customSource}
                    onChange={(e) => {
                      const value = e.target.value;
                      setCustomSource(value);
                      handleInputChange("source", value);
                    }}
                    className="w-full bg-transparent text-black dark:text-white px-4 py-2 rounded-lg border border-stroke dark:border-strokedark focus:border-primary focus:ring-1 focus:ring-primary outline-none"
                    placeholder="Enter custom source"
                  />
                </div>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-black dark:text-white mb-2">
                Status
              </label>
              <div className="relative">
                <Select
                  options={[
                    { value: "new", label: "New" },
                    { value: "in-progress", label: "In Progress" },
                    { value: "converted", label: "Converted" },
                    { value: "lost", label: "Lost" },
                  ]}
                  placeholder="Select Status"
                  value={formData.status || ""}
                  onChange={(option) => handleInputChange("status", option?.value || "")}
                  className="dark:bg-dark"
                />
                <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 dark:text-gray-400">
                  <ChevronDownIcon />
                </span>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-black dark:text-white mb-2">
                Assign to Designation
              </label>
              <div className="relative">
                <Select
                  options={[
                    { value: "", label: "Select Designation" },
                    { value: "assign_to_yourself", label: "🙋‍♂️ Assign to Yourself" },
                    ...designations,
                  ]}
                  placeholder="Select Designation"
                  value={selectedDesignation}
                  onChange={(option) => {
                    const value = option?.value || "";
                    setSelectedDesignation(value);
                    // If "assign to yourself" is selected, automatically set the current user
                    if (value === "assign_to_yourself" && currentUser?.id) {
                      handleInputChange("assignedToId", currentUser.id);
                    } else {
                      handleInputChange("assignedToId", undefined);
                    }
                  }}
                  className="dark:bg-dark"
                />
                <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 dark:text-gray-400">
                  <ChevronDownIcon />
                </span>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-black dark:text-white mb-2">
                Assigned To
              </label>
              <div className="relative">
                <Select
                  options={
                    selectedDesignation === "assign_to_yourself"
                      ? currentUser?.id
                        ? [
                            {
                              value: String(currentUser.id),
                              label: `✅ Assigned to You (${currentUser.name || "You"})`,
                            },
                          ]
                        : []
                      : [
                          { value: "", label: "Unassigned" },
                          ...(userOptions || []),
                        ]
                  }
                  placeholder="Select Assignee"
                  value={
                    selectedDesignation === "assign_to_yourself"
                      ? currentUser?.id?.toString() || ""
                      : formData.assignedToId?.toString() || ""
                  }
                  onChange={(option) => {
                    if (selectedDesignation === "assign_to_yourself") return;
                    const id = option?.value ? parseInt(option.value, 10) : undefined;
                    handleInputChange("assignedToId", id);
                  }}
                  className={`dark:bg-dark ${
                    selectedDesignation === "assign_to_yourself"
                      ? "opacity-50 cursor-not-allowed pointer-events-none"
                      : ""
                  }`}
                />
                <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 dark:text-gray-400">
                  <ChevronDownIcon />
                </span>
              </div>
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
              disabled={
                isLoading || 
                !formData.name || 
                !formData.mobileNumber || 
                !formData.email ||
                !!emailError ||
                !!phoneError ||
                !emailRegex.test(formData.email || '') ||
                !phoneRegex.test((formData.mobileNumber || '').replace(/\D/g, ''))
              }
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