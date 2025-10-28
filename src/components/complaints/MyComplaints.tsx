import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { complaintService } from '../../services/complaintService';
import { Complaint, ComplaintStatus, ComplaintCategory } from '../../types';

const MyComplaints: React.FC = () => {
  const { user } = useAuth();
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filterStatus, setFilterStatus] = useState<ComplaintStatus | 'ALL'>('ALL');
  const [filterCategory, setFilterCategory] = useState<ComplaintCategory | 'ALL'>('ALL');

  useEffect(() => {
    if (user?.id) {
      fetchComplaints();
    }
  }, [user?.id]);

  const fetchComplaints = async () => {
    try {
      setLoading(true);
      setError('');
      const data = await complaintService.getMyComplaints();
      setComplaints(data);
    } catch (err: any) {
      console.error('Error fetching complaints:', err);
      setError(err.response?.data?.message || 'Failed to fetch complaints');
    } finally {
      setLoading(false);
    }
  };

  const filteredComplaints = complaints.filter(complaint => {
    const statusMatch = filterStatus === 'ALL' || complaint.status === filterStatus;
    const categoryMatch = filterCategory === 'ALL' || complaint.category === filterCategory;
    return statusMatch && categoryMatch;
  });

  const getStatusColor = (status: ComplaintStatus) => {
    switch (status) {
      case ComplaintStatus.SUBMITTED:
        return 'bg-blue-100 text-blue-800';
      case ComplaintStatus.IN_PROGRESS:
        return 'bg-yellow-100 text-yellow-800';
      case ComplaintStatus.RESOLVED:
        return 'bg-green-100 text-green-800';
      case ComplaintStatus.CLOSED:
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'HIGH':
        return 'bg-red-100 text-red-800';
      case 'MEDIUM':
        return 'bg-yellow-100 text-yellow-800';
      case 'LOW':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto">
      <div className="bg-white shadow rounded-lg">
        <div className="px-4 py-5 sm:p-6">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl font-bold text-gray-900">My Complaints</h1>
            <button
              onClick={fetchComplaints}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
            >
              Refresh
            </button>
          </div>

          {error && (
            <div className="mb-4 rounded-md bg-red-50 p-4">
              <div className="text-sm text-red-700">{error}</div>
            </div>
          )}

          {/* Filters */}
          <div className="mb-6 flex flex-wrap gap-4">
            <div>
              <label htmlFor="status-filter" className="block text-sm font-medium text-gray-700 mb-1">
                Filter by Status
              </label>
              <select
                id="status-filter"
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value as ComplaintStatus | 'ALL')}
                className="rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              >
                <option value="ALL">All Status</option>
                <option value={ComplaintStatus.SUBMITTED}>Submitted</option>
                <option value={ComplaintStatus.IN_PROGRESS}>In Progress</option>
                <option value={ComplaintStatus.RESOLVED}>Resolved</option>
                <option value={ComplaintStatus.CLOSED}>Closed</option>
              </select>
            </div>

            <div>
              <label htmlFor="category-filter" className="block text-sm font-medium text-gray-700 mb-1">
                Filter by Category
              </label>
              <select
                id="category-filter"
                value={filterCategory}
                onChange={(e) => setFilterCategory(e.target.value as ComplaintCategory | 'ALL')}
                className="rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              >
                <option value="ALL">All Categories</option>
                <option value={ComplaintCategory.WATER_SUPPLY}>Water Supply</option>
                <option value={ComplaintCategory.ELECTRICITY}>Electricity</option>
                <option value={ComplaintCategory.ROADS_INFRASTRUCTURE}>Roads Infrastructure</option>
                <option value={ComplaintCategory.HEALTH_SERVICES}>Health Services</option>
                <option value={ComplaintCategory.EDUCATION}>Education</option>
                <option value={ComplaintCategory.SANITATION}>Sanitation</option>
                <option value={ComplaintCategory.PUBLIC_DISTRIBUTION_SYSTEM}>Public Distribution System</option>
                <option value={ComplaintCategory.REVENUE_SERVICES}>Revenue Services</option>
                <option value={ComplaintCategory.POLICE_SERVICES}>Police Services</option>
                <option value={ComplaintCategory.CORRUPTION}>Corruption</option>
                <option value={ComplaintCategory.ENVIRONMENTAL_ISSUES}>Environmental Issues</option>
                <option value={ComplaintCategory.AGRICULTURE}>Agriculture</option>
                <option value={ComplaintCategory.PENSION_SERVICES}>Pension Services</option>
                <option value={ComplaintCategory.BIRTH_DEATH_CERTIFICATE}>Birth/Death Certificate</option>
                <option value={ComplaintCategory.OTHER}>Other</option>
              </select>
            </div>
          </div>

          {/* Complaints List */}
          {filteredComplaints.length === 0 ? (
            <div className="text-center py-8">
              <div className="text-gray-500 text-lg">No complaints found</div>
              <div className="text-gray-400 text-sm mt-2">
                {complaints.length === 0 
                  ? "You haven't created any complaints yet." 
                  : "No complaints match the current filters."}
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredComplaints.map((complaint) => (
                <div key={complaint.complaintId} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                  <div className="flex justify-between items-start mb-3">
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-gray-900 mb-1">
                        {complaint.subject}
                      </h3>
                      <p className="text-sm text-gray-600 mb-2">
                        Complaint #{complaint.complaintNumber}
                      </p>
                      <p className="text-gray-700 text-sm line-clamp-2">
                        {complaint.description}
                      </p>
                    </div>
                    <div className="flex flex-col items-end space-y-2">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(complaint.status)}`}>
                        {complaint.status.replace('_', ' ')}
                      </span>
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getPriorityColor(complaint.priority)}`}>
                        {complaint.priority}
                      </span>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-4 text-sm text-gray-600">
                    <div>
                      <span className="font-medium">Category:</span> {complaint.category.replace('_', ' ')}
                    </div>
                    {complaint.location && (
                      <div>
                        <span className="font-medium">Location:</span> {complaint.location}
                      </div>
                    )}
                    <div>
                      <span className="font-medium">Created:</span> {formatDate(complaint.createdAt)}
                    </div>
                    {complaint.updatedAt !== complaint.createdAt && (
                      <div>
                        <span className="font-medium">Updated:</span> {formatDate(complaint.updatedAt)}
                      </div>
                    )}
                  </div>

                  {complaint.documents && complaint.documents.length > 0 && (
                    <div className="mt-3 pt-3 border-t border-gray-200">
                      <div className="text-sm text-gray-600">
                        <span className="font-medium">Attachments:</span> {complaint.documents.length} file(s)
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}

          {/* Summary */}
          {complaints.length > 0 && (
            <div className="mt-6 pt-6 border-t border-gray-200">
              <div className="text-sm text-gray-600">
                Showing {filteredComplaints.length} of {complaints.length} complaints
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default MyComplaints;
