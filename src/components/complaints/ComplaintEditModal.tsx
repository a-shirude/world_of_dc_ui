import React, { useState, useEffect } from "react";
import { useAuth } from "../../contexts/AuthContext";
import { complaintService } from "../../services/complaintService";
import {
  Complaint,
  ComplaintStatus,
  ComplaintPriority,
  Department,
  ComplaintUpdateRequest,
  UserRole,
} from "../../types";
import { getDepartmentDisplayName } from "../../utils/departmentUtils";
import { getAllowedNextStatuses, statusDisplay } from "../../utils/statusUtils";
import Toast from "../common/Toast";

interface ComplaintEditModalProps {
  complaint: Complaint;
  isOpen: boolean;
  onClose: () => void;
  onUpdate: (updatedComplaint: Complaint) => void;
}

const ComplaintEditModal: React.FC<ComplaintEditModalProps> = ({
  complaint,
  isOpen,
  onClose,
  onUpdate,
}) => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState("");
  const [toastType, setToastType] = useState<"success" | "error" | "info">(
    "success"
  );

  // Unified form state
  const [formData, setFormData] = useState({
    subject: complaint.subject || "",
    description: complaint.description || "",
    location: complaint.location || "",
    priority: complaint.priority || ComplaintPriority.MEDIUM,
    status: complaint.status || ComplaintStatus.CREATED,
    progressNotes: complaint.progressNotes || "",
    departmentRemarks: complaint.departmentRemarks || "",
    assignedDepartment: complaint.assignedDepartment || Department.UNASSIGNED,
    assignmentRemarks: complaint.assignmentRemarks || "",
    updateRemarks: "",
  });

  const isDistrictCommissioner = user?.role === UserRole.DISTRICT_COMMISSIONER;
  const canEdit = isDistrictCommissioner || complaint.createdById === user?.id;

  useEffect(() => {
    if (isOpen) {
      setFormData({
        subject: complaint.subject || "",
        description: complaint.description || "",
        location: complaint.location || "",
        priority: complaint.priority || ComplaintPriority.MEDIUM,
        status: complaint.status || ComplaintStatus.CREATED,
        progressNotes: complaint.progressNotes || "",
        departmentRemarks: complaint.departmentRemarks || "",
        assignedDepartment:
          complaint.assignedDepartment || Department.UNASSIGNED,
        assignmentRemarks: complaint.assignmentRemarks || "",
        updateRemarks: "",
      });
      setError("");
    }
  }, [isOpen, complaint]);

  const handleInputChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // Removed separate department change handler - now using unified formData

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!canEdit) {
      setError("You don't have permission to edit this complaint");
      return;
    }

    setLoading(true);
    setError("");
    setSuccess("");

    try {
      // Single API call to update everything
      const updateRequest: ComplaintUpdateRequest = {
        complaintId: complaint.complaintId,
        subject: formData.subject,
        description: formData.description,
        location: formData.location,
        priority: formData.priority,
        status: formData.status,
        progressNotes: formData.progressNotes,
        updateRemarks: formData.updateRemarks,
        // Include department assignment if DC and department changed
        ...(isDistrictCommissioner &&
          formData.assignedDepartment !== complaint.assignedDepartment && {
            assignedDepartment: formData.assignedDepartment,
            assignmentRemarks: formData.assignmentRemarks,
          }),
      };

      const updatedComplaint = await complaintService.updateComplaint(
        updateRequest
      );

      // Show success message
      setSuccess("Complaint updated successfully!");
      setToastMessage("Complaint updated successfully!");
      setToastType("success");
      setShowToast(true);

      // Update parent component
      onUpdate(updatedComplaint);

      // Close modal after a short delay to show success message
      setTimeout(() => {
        onClose();
      }, 1500);
    } catch (err: any) {
      const errorMessage =
        err.response?.data?.message || "Failed to update complaint";
      setError(errorMessage);
      setToastMessage(errorMessage);
      setToastType("error");
      setShowToast(true);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <>
      <Toast
        message={toastMessage}
        type={toastType}
        isVisible={showToast}
        onClose={() => setShowToast(false)}
        duration={3000}
      />
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] flex flex-col">
          <div className="flex justify-between items-center p-6 border-b">
            <h2 className="text-2xl font-bold text-gray-900">
              Edit Complaint #{complaint.complaintNumber}
            </h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 text-2xl"
            >
              ×
            </button>
          </div>

          {!canEdit && (
            <div className="bg-red-50 border-l-4 border-red-400 p-4 mx-6 mt-4">
              <div className="text-red-700">
                You don't have permission to edit this complaint. Only the
                District Commissioner or the complaint creator can make changes.
              </div>
            </div>
          )}

          <div className="flex-1 overflow-y-auto p-6">
            {error && (
              <div className="mb-4 rounded-md bg-red-50 p-4 border border-red-200">
                <div className="flex">
                  <div className="flex-shrink-0">
                    <svg
                      className="h-5 w-5 text-red-400"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                    >
                      <path
                        fillRule="evenodd"
                        d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </div>
                  <div className="ml-3">
                    <h3 className="text-sm font-medium text-red-800">Error</h3>
                    <div className="mt-1 text-sm text-red-700">{error}</div>
                  </div>
                </div>
              </div>
            )}

            {success && (
              <div className="mb-4 rounded-md bg-green-50 p-4 border border-green-200">
                <div className="flex">
                  <div className="flex-shrink-0">
                    <svg
                      className="h-5 w-5 text-green-400"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                    >
                      <path
                        fillRule="evenodd"
                        d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </div>
                  <div className="ml-3">
                    <h3 className="text-sm font-medium text-green-800">
                      Success!
                    </h3>
                    <div className="mt-1 text-sm text-green-700">{success}</div>
                  </div>
                </div>
              </div>
            )}

            {/* Unified Form */}
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Subject
                  </label>
                  <input
                    type="text"
                    name="subject"
                    value={formData.subject}
                    onChange={handleInputChange}
                    className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Priority
                  </label>
                  <select
                    name="priority"
                    value={formData.priority}
                    onChange={handleInputChange}
                    className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  >
                    <option value={ComplaintPriority.LOW}>Low</option>
                    <option value={ComplaintPriority.MEDIUM}>Medium</option>
                    <option value={ComplaintPriority.HIGH}>High</option>
                    <option value={ComplaintPriority.URGENT}>Urgent</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Status
                  </label>
                  <select
                    name="status"
                    value={formData.status}
                    onChange={handleInputChange}
                    className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  >
                    {getAllowedNextStatuses(complaint.status).map((s) => (
                      <option key={s} value={s}>
                        {statusDisplay(s)}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Location
                  </label>
                  <input
                    type="text"
                    name="location"
                    value={formData.location}
                    onChange={handleInputChange}
                    className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description
                </label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  rows={4}
                  className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  required
                />
              </div>

              {/* Department Assignment Section - Only for DC */}
              {isDistrictCommissioner && (
                <div className="border-t pt-6">
                  <h3 className="text-lg font-medium text-gray-900 mb-4">
                    Department Assignment
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Assign to Department
                      </label>
                      <select
                        name="assignedDepartment"
                        value={formData.assignedDepartment}
                        onChange={handleInputChange}
                        className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                      >
                        <option value={Department.UNASSIGNED}>
                          Select Department
                        </option>
                        {Object.values(Department)
                          .filter((dept) => dept !== Department.UNASSIGNED)
                          .map((dept) => (
                            <option key={dept} value={dept}>
                              {getDepartmentDisplayName(dept)}
                            </option>
                          ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Assignment Remarks
                      </label>
                      <textarea
                        name="assignmentRemarks"
                        value={formData.assignmentRemarks}
                        onChange={handleInputChange}
                        rows={3}
                        className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                        placeholder="Explain why this department is being assigned (optional)"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Progress Section */}
              <div className="border-t pt-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4">
                  Progress & Comments
                </h3>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Progress Notes / Comments
                  </label>
                  <textarea
                    name="progressNotes"
                    value={formData.progressNotes}
                    onChange={handleInputChange}
                    rows={4}
                    className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    placeholder="Describe the current progress, what has been done, and what's next"
                  />
                </div>
              </div>

              {/* Update Remarks */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Update Remarks
                </label>
                <textarea
                  name="updateRemarks"
                  value={formData.updateRemarks}
                  onChange={handleInputChange}
                  rows={2}
                  className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  placeholder="Describe what changes you made and why (optional)"
                />
              </div>

              {/* Submit Button */}
              <div className="flex justify-end space-x-3 pt-6 border-t">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading || !canEdit}
                  className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 flex items-center space-x-2"
                >
                  {loading && (
                    <svg
                      className="animate-spin h-4 w-4 text-white"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      ></circle>
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      ></path>
                    </svg>
                  )}
                  <span>{loading ? "Updating..." : "Update Complaint"}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </>
  );
};

export default ComplaintEditModal;
