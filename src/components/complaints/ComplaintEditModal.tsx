import React, { useState, useEffect } from "react";
import { useAuth } from "../../contexts/AuthContext";
import { complaintService } from "../../services/complaintService";
import {
  Complaint,
  ComplaintStatus,
  ComplaintPriority,
  Department,
  ComplaintUpdateRequest,
  ComplaintDepartmentAssignmentRequest,
  UserRole,
} from "../../types";
import { getDepartmentDisplayName } from "../../utils/departmentUtils";
import { getAllowedNextStatuses, statusDisplay } from "../../utils/statusUtils";

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
  const [activeTab, setActiveTab] = useState<
    "details" | "department" | "progress"
  >("details");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Form states
  const [formData, setFormData] = useState({
    subject: complaint.subject || "",
    description: complaint.description || "",
    location: complaint.location || "",
    priority: complaint.priority || ComplaintPriority.MEDIUM,
    status: complaint.status || ComplaintStatus.CREATED,
    progressNotes: complaint.progressNotes || "",
    departmentRemarks: complaint.departmentRemarks || "",
    updateRemarks: "",
  });

  const [departmentData, setDepartmentData] = useState({
    department: complaint.assignedDepartment || Department.UNASSIGNED,
    assignmentRemarks: "",
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
        updateRemarks: "",
      });
      setDepartmentData({
        department: complaint.assignedDepartment || Department.UNASSIGNED,
        assignmentRemarks: "",
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

  const handleDepartmentChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const { value } = e.target;
    setDepartmentData((prev) => ({
      ...prev,
      department: value as Department,
    }));
  };

  const handleUpdateDetails = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!canEdit) {
      setError("You don't have permission to edit this complaint");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const updateRequest: ComplaintUpdateRequest = {
        complaintId: parseInt(complaint.id),
        subject: formData.subject,
        description: formData.description,
        location: formData.location,
        priority: formData.priority,
        status: formData.status,
        progressNotes: formData.progressNotes,
        updateRemarks: formData.updateRemarks,
      };

      const updatedComplaint = await complaintService.updateComplaint(
        updateRequest
      );
      onUpdate(updatedComplaint);
      onClose();
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to update complaint");
    } finally {
      setLoading(false);
    }
  };

  const handleAssignDepartment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isDistrictCommissioner) {
      setError("Only District Commissioner can assign departments");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const assignmentRequest: ComplaintDepartmentAssignmentRequest = {
        complaintId: parseInt(complaint.id),
        department: departmentData.department,
        assignmentRemarks: departmentData.assignmentRemarks,
      };

      const updatedComplaint =
        await complaintService.assignComplaintToDepartment(assignmentRequest);
      onUpdate(updatedComplaint);
      onClose();
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to assign department");
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateProgress = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!canEdit) {
      setError("You don't have permission to update progress");
      return;
    }

    setLoading(true);
    setError("");

    try {
      // Use general update to record progress notes/comments without percentage
      const updateRequest: ComplaintUpdateRequest = {
        complaintId: parseInt(complaint.id),
        progressNotes: formData.progressNotes,
        updateRemarks: formData.updateRemarks,
      };

      const updatedComplaint = await complaintService.updateComplaint(
        updateRequest
      );
      onUpdate(updatedComplaint);
      onClose();
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to update progress");
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full mx-4 max-h-[90vh] overflow-hidden">
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

        <div className="p-6">
          {/* Tab Navigation */}
          <div className="flex space-x-1 mb-6">
            <button
              onClick={() => setActiveTab("details")}
              className={`px-4 py-2 rounded-md font-medium ${
                activeTab === "details"
                  ? "bg-blue-100 text-blue-700"
                  : "text-gray-500 hover:text-gray-700"
              }`}
            >
              Basic Details
            </button>
            {isDistrictCommissioner && (
              <button
                onClick={() => setActiveTab("department")}
                className={`px-4 py-2 rounded-md font-medium ${
                  activeTab === "department"
                    ? "bg-blue-100 text-blue-700"
                    : "text-gray-500 hover:text-gray-700"
                }`}
              >
                Department Assignment
              </button>
            )}
            <button
              onClick={() => setActiveTab("progress")}
              className={`px-4 py-2 rounded-md font-medium ${
                activeTab === "progress"
                  ? "bg-blue-100 text-blue-700"
                  : "text-gray-500 hover:text-gray-700"
              }`}
            >
              Progress Update
            </button>
          </div>

          {error && (
            <div className="mb-4 rounded-md bg-red-50 p-4">
              <div className="text-sm text-red-700">{error}</div>
            </div>
          )}

          {/* Tab Content */}
          {activeTab === "details" && (
            <form onSubmit={handleUpdateDetails} className="space-y-4">
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

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Update Remarks *
                </label>
                <textarea
                  name="updateRemarks"
                  value={formData.updateRemarks}
                  onChange={handleInputChange}
                  rows={2}
                  className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  placeholder="Describe what changes you made and why"
                  required
                />
              </div>

              <div className="flex justify-end space-x-3">
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
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
                >
                  {loading ? "Updating..." : "Update Details"}
                </button>
              </div>
            </form>
          )}

          {activeTab === "department" && isDistrictCommissioner && (
            <form onSubmit={handleAssignDepartment} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Assign to Department *
                </label>
                <select
                  value={departmentData.department}
                  onChange={handleDepartmentChange}
                  className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  required
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
                  Assignment Remarks *
                </label>
                <textarea
                  value={departmentData.assignmentRemarks}
                  onChange={(e) =>
                    setDepartmentData((prev) => ({
                      ...prev,
                      assignmentRemarks: e.target.value,
                    }))
                  }
                  rows={3}
                  className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  placeholder="Explain why this department is being assigned to handle this complaint"
                  required
                />
              </div>

              <div className="flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50"
                >
                  {loading ? "Assigning..." : "Assign Department"}
                </button>
              </div>
            </form>
          )}

          {activeTab === "progress" && (
            <form onSubmit={handleUpdateProgress} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Progress Notes / Comments *
                </label>
                <textarea
                  name="progressNotes"
                  value={formData.progressNotes}
                  onChange={handleInputChange}
                  rows={4}
                  className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  placeholder="Describe the current progress, what has been done, and what's next"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Update Remarks *
                </label>
                <textarea
                  name="updateRemarks"
                  value={formData.updateRemarks}
                  onChange={handleInputChange}
                  rows={2}
                  className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  placeholder="Additional remarks about this progress update"
                  required
                />
              </div>

              <div className="flex justify-end space-x-3">
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
                  className="px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 disabled:opacity-50"
                >
                  {loading ? "Updating..." : "Update Progress"}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default ComplaintEditModal;
