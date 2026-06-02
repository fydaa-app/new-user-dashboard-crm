"use client";
import React, { useState, useCallback, useMemo } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableRow,
} from "../ui/table";
import { FinancialPlan, QuestionItem, QuestionDefinition } from "./types";
import { apiClient } from "@/services/api-client";
import { FinancialPlanEndpoints } from "@/config/api-endpoints";
import { toast } from "react-toastify";

interface PlanDataTabProps {
  financialPlan?: FinancialPlan;
  userId?: string;
  questions?: QuestionDefinition[];
  fromApp?: string;
}

const EditableInput = ({
  value,
  onChange,
  placeholder = "",
  type = "text",
  className = ""
}: {
  value: string | number | undefined;
  onChange: (value: string | number) => void;
  placeholder?: string;
  type?: string;
  className?: string;
}) => {
  return (
    <input
      type={type}
      value={value ?? ""}
      onChange={(e) => {
        const val = type === "number" ? Number(e.target.value) : e.target.value;
        onChange(val);
      }}
      placeholder={placeholder}
      className={`w-full rounded-md border border-gray-300 px-2 py-1 text-sm dark:border-gray-700 dark:bg-gray-800 dark:text-white ${className}`}
    />
  );
};

const EditableBoolean = ({
  value,
  onChange
}: {
  value: boolean;
  onChange: (value: boolean) => void;
}) => {
  return (
    <select
      value={value ? "true" : "false"}
      onChange={(e) => onChange(e.target.value === "true")}
      className="rounded-md border border-gray-300 px-2 py-1 text-sm dark:border-gray-700 dark:bg-gray-800 dark:text-white"
    >
      <option value="true">Yes</option>
      <option value="false">No</option>
    </select>
  );
};

interface EditableDropdownProps {
  value: string;
  options: Array<{ value: string; label: string }>;
  onChange: (value: string) => void;
}

const EditableDropdown = ({
  value,
  options,
  onChange
}: EditableDropdownProps) => {
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="rounded-md border border-gray-300 px-2 py-1 text-sm dark:border-gray-700 dark:bg-gray-800 dark:text-white"
    >
      {options.map((opt) => (
        <option key={opt.value} value={opt.value}>
          {opt.label}
        </option>
      ))}
    </select>
  );
};

const useQuestionMap = (questions?: QuestionDefinition[]) => {
  return useMemo(() => {
    const map = new Map<number, QuestionDefinition>();
    questions?.forEach(q => map.set(q.questionId, q));
    return map;
  }, [questions]);
};

const hasPredefinedOptions = (
  questionId: number,
  questionMap: Map<number, QuestionDefinition>
): boolean => {
  const q = questionMap.get(questionId);
  return q?.option !== null && q?.option !== undefined && Object.keys(q.option).length > 0;
};

const isEditableQuestion = (item: QuestionItem): boolean => {
  return item.questionId !== null &&
         item.questionId !== undefined &&
         item.questionId > 0;
};

const getQuestionOptions = (
  questionId: number,
  questionMap: Map<number, QuestionDefinition>
): Array<{ value: string; label: string }> => {
  const q = questionMap.get(questionId);
  if (!q?.option) return [];
  return Object.entries(q.option).map(([key, label]) => ({
    value: key,
    label: String(label)
  }));
};

const getOptionLabel = (
  questionId: number,
  optionKey: string,
  questionMap: Map<number, QuestionDefinition>
): string => {
  const q = questionMap.get(questionId);
  if (q?.option && typeof q.option === 'object') {
    return q.option[optionKey] ? String(q.option[optionKey]) : optionKey;
  }
  return optionKey;
};

const renderQuestionnaireSection = (
  title: string,
  items: QuestionItem[] | undefined | null,
  questionMap: Map<number, QuestionDefinition> | undefined,
  editing: boolean = false,
  editedItems?: Record<string, string | number | boolean>,
  onItemChange?: (questionId: string, value: string | number | boolean) => void,
  showTitle: boolean = true,
) => {
  if (!items || items.length === 0) {
    return null;
  }

  const displayItems = items.map(item => {
    if (editing && isEditableQuestion(item)) {
      return {
        ...item,
        ...(hasPredefinedOptions(item.questionId || 0, questionMap!)
          ? { option: editedItems?.[String(item.questionId)]?.toString() ?? item.option }
          : { value: editedItems?.[String(item.questionId)] ?? item.value }
        ),
      };
    }
    if (!editing && questionMap && item.option && isEditableQuestion(item)) {
      return {
        ...item,
        value: getOptionLabel(item.questionId || 0, String(item.option), questionMap),
      };
    }
    return item;
  });

  return (
    <div className="mb-6">
      {showTitle && (
        <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90 mb-3">{title}</h3>
      )}
      <div className="overflow-x-auto">
        <Table>
          <TableHeader className="border-b border-gray-100 dark:border-white/[0.05]">
            <TableRow>
              <TableCell isHeader className="px-5 py-3 font-medium text-gray-900 text-start text-theme-sm dark:text-gray-400">
                Question
              </TableCell>
              <TableCell isHeader className="px-5 py-3 font-medium text-gray-900 text-start text-theme-sm dark:text-gray-400">
                Answer
              </TableCell>
            </TableRow>
          </TableHeader>
          <TableBody className="divide-y divide-gray-100 dark:divide-white/[0.05]">
            {displayItems.map((item, index) => (
              <TableRow key={`${item.questionId || 'q'}-${index}`}>
                <TableCell className="px-4 py-3 text-gray-500 text-start text-theme-sm dark:text-gray-400">
                  {questionMap?.get(item.questionId || 0)?.question || item.question || `Q${item.questionId}`}
                </TableCell>
                <TableCell className="px-4 py-3 text-gray-500 text-start text-theme-sm dark:text-gray-400">
                  {editing && isEditableQuestion(item) ? (
                    hasPredefinedOptions(item.questionId || 0, questionMap!) ? (
                      <EditableDropdown
                        value={item.option || ""}
                        options={getQuestionOptions(item.questionId || 0, questionMap!)}
                        onChange={(val) => onItemChange?.(String(item.questionId), val)}
                      />
                    ) : typeof item.value === 'boolean' ? (
                      <EditableBoolean
                        value={item.value}
                        onChange={(val) => onItemChange?.(String(item.questionId), val)}
                      />
                    ) : (
                      <EditableInput
                        value={item.value ?? ""}
                        onChange={(val) => onItemChange?.(String(item.questionId), val)}
                        type={typeof item.value === 'number' ? "number" : "text"}
                      />
                    )
                  ) : (
                    (item.value ??
                      (item.option
                        ? getOptionLabel(
                            item.questionId || 0,
                            String(item.option),
                            questionMap!
                          )
                        : undefined)) ?? "-"
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};

const renderGoalsSection = (
  goals: Record<string, QuestionItem[]> | undefined | null,
  editingSectionId: string | null,
  editedGoals?: Record<string, Record<string, string | number | boolean>>,
  onGoalChange?: (
    goalId: string,
    questionId: string,
    value: string | number | boolean
  ) => void,
  onEditSection?: (section: string) => void,
  onSaveSection?: (section: string) => void,
  onCancelSection?: () => void,
  saving?: boolean,
  questionMap?: Map<number, QuestionDefinition>,
) => {
  if (!goals || Object.keys(goals).length === 0) {
    return null;
  }

  return (
    <div className="mb-6">
      <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90 mb-3">Financial Goals</h3>
      <div className="space-y-4">
        {Object.entries(goals).map(([goalId, items]) => {
          const isEditingThis = editingSectionId === `goals_${goalId}`;
          const editKey = `goals_${goalId}`;
          const displayItems = isEditingThis
            ? items.filter(isEditableQuestion).map(item => ({
                ...item,
                ...(hasPredefinedOptions(item.questionId || 0, questionMap!)
                  ? { option: editedGoals?.[editKey]?.[String(item.questionId)]?.toString() ?? item.option }
                  : { value: editedGoals?.[editKey]?.[String(item.questionId)] ?? item.value }
              ),
            }))
            : items.map(item => {
              if (questionMap && item.option) {
                return {
                  ...item,
                  value: getOptionLabel(item.questionId || 0, String(item.option), questionMap),
                };
              }
              return item;
            });

          return (
            <div key={goalId} className="border border-gray-200 rounded-lg p-4 dark:border-gray-800">
              <div className="flex items-center justify-between mb-2">
                <h4 className="font-medium text-gray-700 dark:text-gray-300">{goalId.replace(/([a-z])([1-9])/g, '$1 $2')}</h4>
                {!isEditingThis ? (
                  <button
                    type="button"
                    onClick={() => onEditSection?.(`goals_${goalId}`)}
                    className="text-sm text-blue-600 hover:text-blue-800"
                  >
                    Edit
                  </button>
                ) : (
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={onCancelSection}
                      className="text-sm text-gray-600 hover:text-gray-800"
                    >
                      Cancel
                    </button>
                    <button
                      type="button"
                      onClick={() => onSaveSection?.(`goals_${goalId}`)}
                      disabled={saving}
                      className="text-sm text-green-600 hover:text-green-800 disabled:opacity-50"
                    >
                      {saving ? 'Saving...' : 'Save'}
                    </button>
                  </div>
                )}
              </div>
              <div className="grid grid-cols-2 gap-3">
                {displayItems.map((item, index) => (
                  <div key={`${item.questionId || 'q'}-${index}`} className="text-sm">
                    <span className="text-gray-500">{item.question || `Q${item.questionId}`}:</span>
                    {isEditingThis ? (
                      hasPredefinedOptions(item.questionId || 0, questionMap!) ? (
                        <EditableDropdown
                          value={item.option || ""}
                          options={getQuestionOptions(item.questionId || 0, questionMap!)}
                          onChange={(val) => onGoalChange?.(goalId, String(item.questionId), val)}
                        />
                      ) : typeof item.value === 'boolean' ? (
                        <EditableBoolean
                          value={item.value}
                          onChange={(val) => onGoalChange?.(goalId, String(item.questionId), val)}
                        />
                      ) : (
                        <EditableInput
                          value={item.value ?? ""}
                          onChange={(val) => onGoalChange?.(goalId, String(item.questionId), val)}
                          type={typeof item.value === 'number' ? "number" : "text"}
                        />
                      )
                    ) : (
                      <span className="ml-2 text-gray-800 dark:text-white/90">
                        {(item.value ?? (item.option ? getOptionLabel(item.questionId || 0, String(item.option), questionMap!) : undefined)) ?? "-"}
                      </span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

const renderInsuranceSection = (
  insurance: Record<string, QuestionItem[]> | undefined | null,
  editingSectionId: string | null,
  editedInsurance?: Record<string, Record<string, string | number | boolean>>,
  onInsuranceChange?: (
    insuranceId: string,
    questionId: string,
    value: string | number | boolean
  ) => void,
  onEditSection?: (section: string) => void,
  onSaveSection?: (section: string) => void,
  onCancelSection?: () => void,
  saving?: boolean,
  questionMap?: Map<number, QuestionDefinition>,
) => {
  if (!insurance || Object.keys(insurance).length === 0) {
    return null;
  }

  return (
    <div className="mb-6">
      <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90 mb-3">Insurance Planning</h3>
      <div className="space-y-4">
        {Object.entries(insurance).map(([insuranceId, items]) => {
          const isEditingThis = editingSectionId === `insurance_${insuranceId}`;
          const editKey = `insurance_${insuranceId}`;
          const displayItems = isEditingThis
            ? items.filter(isEditableQuestion).map(item => ({
                ...item,
                ...(hasPredefinedOptions(item.questionId || 0, questionMap!)
                  ? { option: editedInsurance?.[editKey]?.[String(item.questionId)]?.toString() ?? item.option }
                  : { value: editedInsurance?.[editKey]?.[String(item.questionId)] ?? item.value }
              ),
            }))
            : items.map(item => {
              if (questionMap && item.option) {
                return {
                  ...item,
                  value: getOptionLabel(item.questionId || 0, String(item.option), questionMap),
                };
              }
              return item;
            });

          return (
            <div key={insuranceId} className="border border-gray-200 rounded-lg p-4 dark:border-gray-800">
              <div className="flex items-center justify-between mb-2">
                <h4 className="font-medium text-gray-700 dark:text-gray-300">{insuranceId.replace(/([a-z])([0-9])/g, '$1 $2')}</h4>
                {!isEditingThis ? (
                  <button
                    type="button"
                    onClick={() => onEditSection?.(`insurance_${insuranceId}`)}
                    className="text-sm text-blue-600 hover:text-blue-800"
                  >
                    Edit
                  </button>
                ) : (
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={onCancelSection}
                      className="text-sm text-gray-600 hover:text-gray-800"
                    >
                      Cancel
                    </button>
                    <button
                      type="button"
                      onClick={() => onSaveSection?.(`insurance_${insuranceId}`)}
                      disabled={saving}
                      className="text-sm text-green-600 hover:text-green-800 disabled:opacity-50"
                    >
                      {saving ? 'Saving...' : 'Save'}
                    </button>
                  </div>
                )}
              </div>
              <div className="grid grid-cols-2 gap-3">
                {displayItems.map((item, index) => (
                   <div key={`${item.questionId || 'q'}-${index}`} className="text-sm">
                     <span className="text-gray-500">{item.question || `Q${item.questionId}`}:</span>
                     {isEditingThis && isEditableQuestion(item) ? (
                       hasPredefinedOptions(item.questionId || 0, questionMap!) ? (
                         <EditableDropdown
                           value={item.option || ""}
                           options={getQuestionOptions(item.questionId || 0, questionMap!)}
                           onChange={(val) => onInsuranceChange?.(insuranceId, String(item.questionId), val)}
                         />
                       ) : typeof item.value === 'boolean' ? (
                         <EditableBoolean
                           value={item.value}
                           onChange={(val) => onInsuranceChange?.(insuranceId, String(item.questionId), val)}
                         />
                       ) : (
                         <EditableInput
                           value={item.value ?? ""}
                           onChange={(val) => onInsuranceChange?.(insuranceId, String(item.questionId), val)}
                           type={typeof item.value === 'number' ? "number" : "text"}
                         />
                       )
                    ) : (
                      <span className="ml-2 text-gray-800 dark:text-white/90">
                        {(item.value ?? (item.option ? getOptionLabel(item.questionId || 0, String(item.option), questionMap!) : undefined)) ?? "-"}
                      </span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};


const renderPrimitiveValue = (
  key: string,
  value: unknown,
) => {
  if (typeof value === "boolean") {
    return (
      <span
        className={`inline-flex rounded-full px-3 py-1 text-xs font-medium ${
          value
            ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
            : "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400"
        }`}
      >
        {value ? "Yes" : "No"}
      </span>
    );
  }

  if (
    typeof value === "number" &&
    key.toLowerCase().includes("score")
  ) {
    const color =
      value >= 80
        ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
        : value >= 60
        ? "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400"
        : "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400";

    return (
      <span
        className={`inline-flex rounded-full px-3 py-1 text-sm font-semibold ${color}`}
      >
        {value}
      </span>
    );
  }

  return (
    <span className="text-sm font-medium text-gray-800 dark:text-white/90">
      {String(value)}
    </span>
  );
};

interface JsonFieldProps {
  label: string;
  value: unknown;
  depth?: number;
  editing?: boolean;
  onValueChange?: (value: unknown) => void;
}

const JsonField = ({
  label,
  value,
  depth = 0,
  editing = false,
  onValueChange,
}: JsonFieldProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const isPrimitive =
    value === null ||
    value === undefined ||
    typeof value === "string" ||
    typeof value === "number" ||
    typeof value === "boolean";

  if (isPrimitive) {
    return (
      <div className="flex items-start justify-between gap-4 py-2">
        <div className="text-sm font-medium text-gray-700 dark:text-gray-300">
          {label.replace(/([A-Z])/g, " $1").trim()}
        </div>

        <div className="text-right">
          {editing ? (
            typeof value === 'boolean' ? (
              <select
                value={value ? "true" : "false"}
                onChange={(e) => onValueChange?.(e.target.value === "true")}
                className="rounded-md border border-gray-300 px-2 py-1 text-sm dark:border-gray-700 dark:bg-gray-800 dark:text-white"
              >
                <option value="true">Yes</option>
                <option value="false">No</option>
              </select>
            ) : typeof value === 'number' ? (
              <input
                type="number"
                value={value ?? ""}
                onChange={(e) => onValueChange?.(Number(e.target.value))}
                className="w-full rounded-md border border-gray-300 px-2 py-1 text-sm dark:border-gray-700 dark:bg-gray-800 dark:text-white"
              />
            ) : (
              <input
                type="text"
                value={value ?? ""}
                onChange={(e) => onValueChange?.(e.target.value)}
                className="w-full rounded-md border border-gray-300 px-2 py-1 text-sm dark:border-gray-700 dark:bg-gray-800 dark:text-white"
              />
            )
          ) : (
            renderPrimitiveValue(label, value)
          )}
        </div>
      </div>
    );
  }

  const isArray = Array.isArray(value);

  return (
    <div>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="
          flex
          w-full
          items-center
          justify-between
          py-2
          text-left
        "
      >
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
            {label.replace(/([A-Z])/g, " $1").trim()}
          </span>

          {typeof (value as Record<string, unknown>)?.overallScore === "number" && (
            <span
              className={`
                rounded-full
                px-2
                py-1
                text-xs
                font-semibold
                ${
                  (value as { overallScore: number }).overallScore >= 80
                    ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
                    : (value as { overallScore: number }).overallScore >= 60
                    ? "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400"
                    : "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400"
                }
              `}
            >
              {(value as { overallScore: number }).overallScore}/100
            </span>
          )}
        </div>

        <span
          className={`transition-transform duration-200 ${
            isOpen ? "rotate-180" : ""
          }`}
        >
          ▼
        </span>
      </button>

      {isOpen && (
        <div className="ml-6 mt-2 border-l border-gray-200 pl-4 dark:border-gray-700">
          {isArray ? (
            value.map((item: unknown, index: number) => (
              <JsonField
                key={index}
                label={`Item ${index + 1}`}
                value={item}
                depth={depth + 1}
                editing={editing}
                onValueChange={onValueChange}
              />
            ))
          ) : (
            Object.entries(value).map(([childKey, childValue]) => (
              <JsonField
                key={childKey}
                label={childKey}
                value={childValue}
                depth={depth + 1}
                editing={editing}
                onValueChange={onValueChange}
              />
            ))
          )}
        </div>
      )}
    </div>
  );
};

interface JsonSectionProps {
  title: string;
  data: Record<string, unknown>;
  editing?: boolean;
}

const JsonSection = ({ title, data, editing = false }: JsonSectionProps) => {
  const [isOpen, setIsOpen] = useState(false);

  if (!data || (typeof data === "object" && Object.keys(data).length === 0)) {
    return null;
  }

  return (
    <div className="mb-6">
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="
          flex
          w-full
          items-center
          justify-between
          rounded-xl
          border
          border-gray-200
          bg-white
          px-5
          py-4
          text-left
          shadow-sm
        "
      >
        <div className="flex items-center gap-3">
          <span className="text-lg font-semibold text-gray-800 dark:text-white/90">
            {title}
          </span>

          {typeof (data as Record<string, unknown>)?.overallScore === "number" && (
            <span
              className={`
                rounded-full
                px-3
                py-1
                text-sm
                font-semibold
                ${
                  (data as { overallScore: number }).overallScore >= 80
                    ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
                    : (data as { overallScore: number }).overallScore >= 60
                    ? "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400"
                    : "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400"
                }
              `}
            >
              {(data as { overallScore: number }).overallScore}/100
            </span>
          )}
        </div>

        <span
          className={`transition-transform duration-200 ${
            isOpen ? "rotate-180" : ""
          }`}
        >
          ▼
        </span>
      </button>

      {isOpen && (
        <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm dark:border-gray-800 dark:bg-white/[0.02]">
          <div className="space-y-4">
            {Object.entries(data).map(([key, value]) => (
              <JsonField
                key={key}
                label={key}
                value={value}
                depth={0}
                editing={editing}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default function PlanDataTab({ financialPlan, userId, questions, fromApp }: PlanDataTabProps) {
  const [editingSection, setEditingSection] = useState<string | null>(null);
  const [editedValues, setEditedValues] = useState<
    Record<string, Record<string, string | number | boolean>>
  >({});
  const [saving, setSaving] = useState(false);

  const questionMap = useQuestionMap(questions);

  const handleItemChange = useCallback(
    (questionId: string, value: string | number | boolean) => {
    if (editingSection) {
      setEditedValues(prev => ({
        ...prev,
        [editingSection]: {
          ...prev[editingSection],
          [questionId]: value,
        },
      }));
    }
  }, [editingSection]);

  const handleGoalChange = useCallback((
    goalId: string,
    questionId: string,
    value: string | number | boolean
  ) => {
    setEditedValues(prev => ({
      ...prev,
      [`goals_${goalId}`]: {
        ...prev[`goals_${goalId}`],
        [questionId]: value,
      },
    }));
  }, []);

  const handleInsuranceChange = useCallback((
    insuranceId: string,
    questionId: string,
    value: string | number | boolean
  ) => {
    setEditedValues(prev => ({
      ...prev,
      [`insurance_${insuranceId}`]: {
        ...prev[`insurance_${insuranceId}`],
        [questionId]: value,
      },
    }));
  }, []);

  const handleAssetChange = useCallback((
    assetId: string,
    questionId: string,
    value: string | number | boolean
  ) => {
    setEditedValues(prev => ({
      ...prev,
      [`assets_${assetId}`]: {
        ...prev[`assets_${assetId}`],
        [questionId]: value,
      },
    }));
  }, []);

  const handleSave = async () => {
    if (!userId || !editingSection || !financialPlan) return;

    setSaving(true);
    try {
      let data: QuestionItem[] = [];

      if (editingSection === 'personalDetails') {
        const editableItems = (financialPlan.personalDetails || []).filter(isEditableQuestion);
        data = editableItems.map(item => ({
          ...item,
          ...(hasPredefinedOptions(item.questionId || 0, questionMap!)
            ? { option: editedValues.personalDetails?.[String(item.questionId)]?.toString() ?? item.option }
            : { value: editedValues.personalDetails?.[String(item.questionId)] ?? item.value }
          ),
        }));
        await apiClient.post(
          FinancialPlanEndpoints.ADMIN_UPDATE_PERSONAL_DETAILS.replace('{userId}', userId),
          data,
          { baseUrl: 'onboarding' }
        );
      } else if (editingSection === 'budgeting') {
        const editableItems = (financialPlan.budgeting || []).filter(isEditableQuestion);
        data = editableItems.map(item => ({
          ...item,
          ...(hasPredefinedOptions(item.questionId || 0, questionMap!)
            ? { option: editedValues.budgeting?.[String(item.questionId)]?.toString() ?? item.option }
            : { value: editedValues.budgeting?.[String(item.questionId)] ?? item.value }
          ),
        }));
        await apiClient.post(
          FinancialPlanEndpoints.ADMIN_UPDATE_BUDGETING.replace('{userId}', userId),
          data,
          { baseUrl: 'onboarding' }
        );
      } else if (editingSection.startsWith('goals_')) {
        const goalId = editingSection.replace('goals_', '');
        const items = (financialPlan.financialGoals as Record<string, QuestionItem[]> | undefined)?.[goalId] || [];
        const editableItems = items.filter(isEditableQuestion);
        data = editableItems.map(item => ({
          ...item,
          ...(hasPredefinedOptions(item.questionId || 0, questionMap!)
            ? { option: editedValues[editingSection]?.[String(item.questionId)]?.toString() ?? item.option }
            : { value: editedValues[editingSection]?.[String(item.questionId)] ?? item.value }
          ),
          goalId: goalId,
        }));
        await apiClient.post(
          FinancialPlanEndpoints.ADMIN_UPDATE_FINANCIAL_GOALS.replace('{userId}', userId),
          data,
          { baseUrl: 'onboarding' }
        );
      } else if (editingSection.startsWith('insurance_')) {
        const insuranceId = editingSection.replace('insurance_', '');
        const items = (financialPlan.insurancePlanning as Record<string, QuestionItem[]> | undefined)?.[insuranceId] || [];
        const editableItems = items.filter(isEditableQuestion);
        data = editableItems.map((item: QuestionItem) => ({
          ...item,
          ...(hasPredefinedOptions(item.questionId || 0, questionMap!)
            ? { option: editedValues[editingSection]?.[String(item.questionId)]?.toString() ?? item.option }
            : { value: editedValues[editingSection]?.[String(item.questionId)] ?? item.value }
          ),
          goalId: insuranceId,
        }));
        await apiClient.post(
          FinancialPlanEndpoints.ADMIN_UPDATE_INSURANCE_PLANNING.replace('{userId}', userId),
          data,
          { baseUrl: 'onboarding' }
        );
      } else if (editingSection.startsWith('assets_')) {
        const assetId = editingSection.replace('assets_', '');
        const assetsRecords = financialPlan.assetsLiabilities as Record<string, QuestionItem[]> | undefined;
        const items = assetsRecords?.[assetId] || [];
        const editableItems = items.filter(isEditableQuestion);
        data = editableItems.map((item: QuestionItem) => ({
          ...item,
          ...(hasPredefinedOptions(item.questionId || 0, questionMap!)
            ? { option: editedValues[editingSection]?.[String(item.questionId)]?.toString() ?? item.option }
            : { value: editedValues[editingSection]?.[String(item.questionId)] ?? item.value }
          ),
          goalId: assetId,
        }));
        await apiClient.post(
          FinancialPlanEndpoints.ADMIN_UPDATE_ASSETS_LIABILITIES.replace('{userId}', userId),
          data,
          { baseUrl: 'onboarding' }
        );
      }

      setEditingSection(null);
      setEditedValues({});
      window.location.reload();
    } catch (error) {
      console.error('Failed to save:', error);
    } finally {
      setSaving(false);
    }
  };

  const startEditing = (section: string) => {
    setEditingSection(section);
    setEditedValues({});
  };

  const [generatingPdf, setGeneratingPdf] = useState<Record<string, boolean>>({});
  const handleGenerateHealthScorePdf = async () => {
    if (!userId) return;
    setGeneratingPdf(prev => ({ ...prev, health: true }));
    try {
      await apiClient.post(
        FinancialPlanEndpoints.ADMIN_RECALCULATE_HEALTH_SCORE.replace('{userId}', userId),
        {},
        { baseUrl: 'onboarding' }
      );
      toast.success('Health score PDF generated successfully');
      window.location.reload();
    } catch (error) {
      console.error('Failed to generate health score PDF:', error);
      toast.error('Failed to generate health score PDF');
    } finally {
      setGeneratingPdf(prev => ({ ...prev, health: false }));
    }
  };
  const handleGenerateWealthScorePdf = async () => {
    if (!userId) return;
    setGeneratingPdf(prev => ({ ...prev, wealth: true }));
    try {
      await apiClient.post(
        FinancialPlanEndpoints.ADMIN_RECALCULATE_WEALTH_SCORE.replace('{userId}', userId),
        {},
        { baseUrl: 'onboarding' }
      );
      toast.success('Wealth score PDF generated successfully');
      window.location.reload();
    } catch (error) {
      console.error('Failed to generate wealth score PDF:', error);
      toast.error('Failed to generate wealth score PDF');
    } finally {
      setGeneratingPdf(prev => ({ ...prev, wealth: false }));
    }
  };

  const cancelEditing = () => {
    setEditingSection(null);
    setEditedValues({});
  };

  if (!financialPlan) {
    return (
      <div className="p-4">
        <p className="text-gray-500 text-sm">No Financial Plan Data Available</p>
      </div>
    );
  }

  return (
    <div className="p-4 space-y-6">
      {financialPlan.personalDetails && financialPlan.personalDetails.length > 0 && (
        <div className="mb-6 rounded-xl border border-gray-200 bg-white p-4 dark:border-gray-800 dark:bg-white/[0.02]">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90">Personal Details</h3>
            {editingSection === 'personalDetails' ? (
              <div className="flex gap-2">
                <button type="button" onClick={cancelEditing} className="text-sm text-gray-600 hover:text-gray-800">Cancel</button>
                <button type="button" onClick={handleSave} disabled={saving} className="text-sm text-green-600 hover:text-green-800 disabled:opacity-50">{saving ? 'Saving...' : 'Save'}</button>
              </div>
            ) : (
              <button type="button" onClick={() => startEditing('personalDetails')} className="text-sm text-blue-600 hover:text-blue-800">Edit</button>
            )}
          </div>
          {renderQuestionnaireSection(
            "Personal Details",
            financialPlan.personalDetails,
            questionMap,
            editingSection === 'personalDetails',
            editedValues.personalDetails,
            handleItemChange,
            false,
          )}
        </div>
      )}

      {financialPlan.financialGoals && Object.keys(financialPlan.financialGoals).length > 0 && (
        <div className="mb-6 rounded-xl border border-gray-200 bg-white p-4 dark:border-gray-800 dark:bg-white/[0.02]">
          {renderGoalsSection(
            financialPlan.financialGoals,
            editingSection,
            editedValues,
            handleGoalChange,
            startEditing,
            handleSave,
            cancelEditing,
            saving,
            questionMap
          )}
        </div>
      )}

      {financialPlan.budgeting && financialPlan.budgeting.length > 0 && (
        <div className="mb-6 rounded-xl border border-gray-200 bg-white p-4 dark:border-gray-800 dark:bg-white/[0.02]">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90">Budgeting</h3>
            {editingSection === 'budgeting' ? (
              <div className="flex gap-2">
                <button type="button" onClick={cancelEditing} className="text-sm text-gray-600 hover:text-gray-800">Cancel</button>
                <button type="button" onClick={handleSave} disabled={saving} className="text-sm text-green-600 hover:text-green-800 disabled:opacity-50">{saving ? 'Saving...' : 'Save'}</button>
              </div>
            ) : (
              <button type="button" onClick={() => startEditing('budgeting')} className="text-sm text-blue-600 hover:text-blue-800">Edit</button>
            )}
          </div>
          {renderQuestionnaireSection(
            "Budgeting",
            financialPlan.budgeting,
            questionMap,
            editingSection === 'budgeting',
            editedValues.budgeting,
            handleItemChange,
            false,
          )}
        </div>
      )}

      {financialPlan.assetsLiabilities && Object.keys(financialPlan.assetsLiabilities).length > 0 && (
        <div className="mb-6 rounded-xl border border-gray-200 bg-white p-4 dark:border-gray-800 dark:bg-white/[0.02]">
          <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90 mb-3">Assets & Liabilities</h3>
          <div className="space-y-4">
            {Object.entries(financialPlan.assetsLiabilities).map(([assetId, items]) => {
              const isEditingThis = editingSection === `assets_${assetId}`;
              const displayItems = isEditingThis
                ? (items as QuestionItem[]).filter(isEditableQuestion).map(item => ({
                  ...item,
                  ...(hasPredefinedOptions(item.questionId || 0, questionMap!)
                    ? { option: editedValues[`assets_${assetId}`]?.[String(item.questionId)]?.toString() ?? item.option }
                    : { value: editedValues[`assets_${assetId}`]?.[String(item.questionId)] ?? item.value }
                ),
                }))
                : (items as QuestionItem[]).map(item => {
                  if (questionMap && item.option) {
                    return {
                      ...item,
                      value: getOptionLabel(item.questionId || 0, String(item.option), questionMap),
                    };
                  }
                  return item;
                });

              return (
                <div key={assetId} className="border border-gray-200 rounded-lg p-4 dark:border-gray-800">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-medium text-gray-700 dark:text-gray-300">{assetId.replace(/([a-z])([0-9])/g, '$1 $2')}</h4>
                    {!isEditingThis ? (
                      <button
                        type="button"
                        onClick={() => startEditing(`assets_${assetId}`)}
                        className="text-sm text-blue-600 hover:text-blue-800"
                      >
                        Edit
                      </button>
                    ) : (
                      <div className="flex gap-2">
                        <button
                          type="button"
                          onClick={cancelEditing}
                          className="text-sm text-gray-600 hover:text-gray-800"
                        >
                          Cancel
                        </button>
                        <button
                          type="button"
                          onClick={handleSave}
                          disabled={saving}
                          className="text-sm text-green-600 hover:text-green-800 disabled:opacity-50"
                        >
                          {saving ? 'Saving...' : 'Save'}
                        </button>
                      </div>
                    )}
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    {displayItems.map((item, index) => (
                      <div key={`${item.questionId || 'q'}-${index}`} className="text-sm">
                        <span className="text-gray-500">{item.question || `Q${item.questionId}`}:</span>
                        {isEditingThis && isEditableQuestion(item) ? (
                          hasPredefinedOptions(item.questionId || 0, questionMap!) ? (
                            <EditableDropdown
                              value={item.option || ""}
                              options={getQuestionOptions(item.questionId || 0, questionMap!)}
                              onChange={(val) => handleAssetChange(assetId, String(item.questionId), val)}
                            />
                          ) : typeof item.value === 'boolean' ? (
                            <select
                              value={(editedValues[`assets_${assetId}`]?.[String(item.questionId)] ?? item.value) ? "true" : "false"}
                              onChange={(e) => handleAssetChange(assetId, String(item.questionId), e.target.value === "true")}
                              className="rounded-md border border-gray-300 px-2 py-1 text-sm dark:border-gray-700 dark:bg-gray-800 dark:text-white"
                            >
                              <option value="true">Yes</option>
                              <option value="false">No</option>
                            </select>
                          ) : (
                            <EditableInput
                              type={typeof item.value === 'number' ? "number" : "text"}
                              value={String(editedValues[`assets_${assetId}`]?.[String(item.questionId)] ?? item.value ?? "")}
                              onChange={(val) => handleAssetChange(assetId, String(item.questionId), val)}
                              className="w-full rounded-md border border-gray-300 px-2 py-1 text-sm dark:border-gray-700 dark:bg-gray-800 dark:text-white"
                            />
                          )
                        ) : (
                          <span className="ml-2 text-gray-800 dark:text-white/90">
                            {(item.value ?? (item.option ? getOptionLabel(item.questionId || 0, String(item.option), questionMap!) : undefined)) ?? "-"}
                          </span>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {financialPlan.insurancePlanning && Object.keys(financialPlan.insurancePlanning).length > 0 && (
        <div className="mb-6 rounded-xl border border-gray-200 bg-white p-4 dark:border-gray-800 dark:bg-white/[0.02]">
          {renderInsuranceSection(
            financialPlan.insurancePlanning,
            editingSection,
            editedValues,
            handleInsuranceChange,
            startEditing,
            handleSave,
            cancelEditing,
            saving,
            questionMap
          )}
        </div>
      )}
      {/* Health Score — button shown for Savestment users */}
      {fromApp?.toLowerCase() === 'savestment' && (
        <div className="mb-6 rounded-xl border border-gray-200 bg-white p-4 dark:border-gray-800 dark:bg-white/[0.02]">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90">Actions</h3>
            <button
              type="button"
              onClick={handleGenerateHealthScorePdf}
              disabled={generatingPdf.health}
              className="text-sm px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
            >
              {generatingPdf.health ? 'Generating...' : 'Generate Health Score PDF'}
            </button>
          </div>
          {financialPlan?.planPdf && (
            <a
              href={financialPlan.planPdf}
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm text-blue-600 hover:text-blue-800 underline mb-3 inline-block"
            >
              View PDF
            </a>
          )}
          {financialPlan?.healthScore && (
            <JsonSection title="Health Score" data={financialPlan.healthScore} />
          )}
        </div>
      )}
      {/* Wealth Score — button shown for Fydaa users */}
      {fromApp?.toLowerCase() === 'fydaa' && (
        <div className="mb-6 rounded-xl border border-gray-200 bg-white p-4 dark:border-gray-800 dark:bg-white/[0.02]">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90">Actions</h3>
            <button
              type="button"
              onClick={handleGenerateWealthScorePdf}
              disabled={generatingPdf.wealth}
              className="text-sm px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
            >
              {generatingPdf.wealth ? 'Generating...' : 'Generate Wealth Score PDF'}
            </button>
          </div>
          {financialPlan?.planPdf && (
            <a
              href={financialPlan.planPdf}
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm text-blue-600 hover:text-blue-800 underline mb-3 inline-block"
            >
              View PDF
            </a>
          )}
          {financialPlan?.wealthScore && (
            <JsonSection title="Wealth Score" data={financialPlan.wealthScore} />
          )}
        </div>
      )}

    </div>
  );
}
