"use client";

import { useState, useEffect } from "react";
import { getAdminMentors, approveMentor, rejectMentor, deleteMentor } from "@/lib/api/admin";
import type { MentorAdminResponse, MentorStatus } from "@/lib/api/types";
import { Button, Input, Select } from "@/components/ui";
import { toast } from "sonner";

type StatusFilter = "" | MentorStatus;

export default function AdminMentorsPage() {
  const [mentors, setMentors] = useState<MentorAdminResponse[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("PENDING");
  const [searchQuery, setSearchQuery] = useState("");
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [rejectModalOpen, setRejectModalOpen] = useState(false);
  const [selectedMentor, setSelectedMentor] = useState<MentorAdminResponse | null>(null);
  const [rejectReason, setRejectReason] = useState("");

  const fetchMentors = async () => {
    setIsLoading(true);
    try {
      const response = await getAdminMentors({
        page,
        size: 20,
        status: statusFilter || undefined,
        q: searchQuery || undefined,
      });
      setMentors(response.content);
      setTotalPages(response.page?.totalPages || 0);
    } catch (error) {
      console.error("Failed to fetch mentors:", error);
      toast.error("Failed to load mentors");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchMentors();
  }, [page, statusFilter]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(0);
    fetchMentors();
  };

  const handleApprove = async (id: string) => {
    try {
      await approveMentor(id);
      toast.success("Mentor approved");
      fetchMentors();
    } catch {
      toast.error("Failed to approve mentor");
    }
  };

  const openRejectModal = (mentor: MentorAdminResponse) => {
    setSelectedMentor(mentor);
    setRejectReason("");
    setRejectModalOpen(true);
  };

  const handleReject = async () => {
    if (!selectedMentor || !rejectReason.trim()) {
      toast.error("Please provide a reason for rejection");
      return;
    }
    try {
      await rejectMentor(selectedMentor.id!, rejectReason);
      toast.success("Mentor rejected");
      setRejectModalOpen(false);
      setSelectedMentor(null);
      setRejectReason("");
      fetchMentors();
    } catch {
      toast.error("Failed to reject mentor");
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this mentor?")) return;
    try {
      await deleteMentor(id);
      toast.success("Mentor deleted");
      fetchMentors();
    } catch {
      toast.error("Failed to delete mentor");
    }
  };

  const getStatusBadge = (status?: MentorStatus) => {
    switch (status) {
      case "PENDING":
        return <span className="px-2 py-0.5 text-xs rounded bg-yellow-600 text-white">Pending</span>;
      case "APPROVED":
        return <span className="px-2 py-0.5 text-xs rounded bg-green-600 text-white">Approved</span>;
      case "REJECTED":
        return <span className="px-2 py-0.5 text-xs rounded bg-red-600 text-white">Rejected</span>;
      case "SEEDED":
        return <span className="px-2 py-0.5 text-xs rounded bg-blue-600 text-white">Seeded</span>;
      default:
        return <span className="px-2 py-0.5 text-xs rounded bg-gray-600 text-gray-200">Unknown</span>;
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-white">Mentor Approval Queue</h1>
      </div>

      {/* Filters */}
      <div className="flex gap-4 mb-6">
        <form onSubmit={handleSearch} className="flex-1">
          <Input
            type="text"
            placeholder="Search mentors..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="bg-[#16162a] border-[#2d2d4a] text-white"
          />
        </form>
        <Select
          value={statusFilter}
          onChange={(e) => {
            setStatusFilter(e.target.value as StatusFilter);
            setPage(0);
          }}
          className="w-40 bg-[#16162a] border-[#2d2d4a] text-white"
        >
          <option value="">All Status</option>
          <option value="PENDING">Pending</option>
          <option value="APPROVED">Approved</option>
          <option value="REJECTED">Rejected</option>
          <option value="SEEDED">Seeded</option>
        </Select>
      </div>

      {/* Pending Count Banner */}
      {statusFilter === "PENDING" && mentors.length > 0 && (
        <div className="bg-yellow-600/20 border border-yellow-600/30 rounded-lg p-4 mb-6">
          <p className="text-yellow-400 text-sm">
            <strong>{mentors.length}</strong> mentor{mentors.length !== 1 ? "s" : ""} awaiting review
          </p>
        </div>
      )}

      {/* Table */}
      <div className="bg-[#16162a] border border-[#2d2d4a] rounded-lg overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-[#2d2d4a]">
              <th className="text-left px-4 py-3 text-sm font-medium text-gray-400">Name</th>
              <th className="text-left px-4 py-3 text-sm font-medium text-gray-400">Headline</th>
              <th className="text-left px-4 py-3 text-sm font-medium text-gray-400">Cal.com URL</th>
              <th className="text-left px-4 py-3 text-sm font-medium text-gray-400">Status</th>
              <th className="text-right px-4 py-3 text-sm font-medium text-gray-400">Actions</th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <tr>
                <td colSpan={5} className="px-4 py-8 text-center text-gray-400">
                  Loading...
                </td>
              </tr>
            ) : mentors.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-4 py-8 text-center text-gray-400">
                  {statusFilter === "PENDING" ? "No pending applications" : "No mentors found"}
                </td>
              </tr>
            ) : (
              mentors.map((mentor) => (
                <tr key={mentor.id} className="border-b border-[#2d2d4a] hover:bg-[#1e1e3a]">
                  <td className="px-4 py-3 text-white">{mentor.name}</td>
                  <td className="px-4 py-3 text-gray-300 max-w-xs truncate">{mentor.headline}</td>
                  <td className="px-4 py-3">
                    {mentor.calcomUrl && (
                      <a
                        href={mentor.calcomUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs text-gold hover:underline"
                      >
                        View
                      </a>
                    )}
                  </td>
                  <td className="px-4 py-3">{getStatusBadge(mentor.status)}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-end gap-2">
                      {mentor.status === "PENDING" && (
                        <>
                          <button
                            onClick={() => handleApprove(mentor.id!)}
                            className="text-xs text-green-400 hover:text-green-300"
                          >
                            Approve
                          </button>
                          <button
                            onClick={() => openRejectModal(mentor)}
                            className="text-xs text-red-400 hover:text-red-300"
                          >
                            Reject
                          </button>
                        </>
                      )}
                      {(mentor.status === "APPROVED" || mentor.status === "SEEDED") && (
                        <button
                          onClick={() => handleDelete(mentor.id!)}
                          className="text-xs text-red-400 hover:text-red-300"
                        >
                          Remove
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 mt-6">
          <button
            onClick={() => setPage((p) => Math.max(0, p - 1))}
            disabled={page === 0}
            className="px-3 py-1 text-sm text-gray-400 hover:text-white disabled:opacity-50"
          >
            Previous
          </button>
          <span className="text-sm text-gray-400">
            Page {page + 1} of {totalPages}
          </span>
          <button
            onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
            disabled={page >= totalPages - 1}
            className="px-3 py-1 text-sm text-gray-400 hover:text-white disabled:opacity-50"
          >
            Next
          </button>
        </div>
      )}

      {/* Reject Modal */}
      {rejectModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-[#16162a] border border-[#2d2d4a] rounded-lg p-6 w-full max-w-md">
            <h2 className="text-lg font-semibold text-white mb-4">
              Reject {selectedMentor?.name}
            </h2>
            <p className="text-sm text-gray-400 mb-4">
              Please provide a reason for rejection. This will be sent to the applicant.
            </p>
            <textarea
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              placeholder="Reason for rejection..."
              className="w-full px-3 py-2 bg-[#1a1a2e] border border-[#2d2d4a] rounded text-white text-sm placeholder-gray-500 resize-none h-24 focus:outline-none focus:border-gold"
            />
            <div className="flex justify-end gap-3 mt-4">
              <Button
                variant="secondary"
                onClick={() => {
                  setRejectModalOpen(false);
                  setSelectedMentor(null);
                }}
              >
                Cancel
              </Button>
              <Button
                onClick={handleReject}
                className="bg-red-600 hover:bg-red-700"
              >
                Reject
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
