"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { getAdminChallenges, publishChallenge, unpublishChallenge, closeChallenge, deleteChallenge } from "@/lib/api/admin";
import type { ChallengeResponse } from "@/lib/api/types";
import { Button, Input, Select } from "@/components/ui";
import { toast } from "sonner";

type StatusFilter = "" | "OPEN" | "CLOSED";

export default function AdminChallengesPage() {
  const [challenges, setChallenges] = useState<ChallengeResponse[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("");
  const [searchQuery, setSearchQuery] = useState("");
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);

  const fetchChallenges = async () => {
    setIsLoading(true);
    try {
      const response = await getAdminChallenges({
        page,
        size: 20,
        status: statusFilter || undefined,
        q: searchQuery || undefined,
      });
      setChallenges(response.content);
      setTotalPages(response.page?.totalPages || 0);
    } catch (error) {
      console.error("Failed to fetch challenges:", error);
      toast.error("Failed to load challenges");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchChallenges();
  }, [page, statusFilter]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(0);
    fetchChallenges();
  };

  const handlePublish = async (id: string) => {
    try {
      await publishChallenge(id);
      toast.success("Challenge published");
      fetchChallenges();
    } catch {
      toast.error("Failed to publish challenge");
    }
  };

  const handleUnpublish = async (id: string) => {
    try {
      await unpublishChallenge(id);
      toast.success("Challenge unpublished");
      fetchChallenges();
    } catch {
      toast.error("Failed to unpublish challenge");
    }
  };

  const handleClose = async (id: string) => {
    try {
      await closeChallenge(id);
      toast.success("Challenge closed");
      fetchChallenges();
    } catch {
      toast.error("Failed to close challenge");
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this challenge?")) return;
    try {
      await deleteChallenge(id);
      toast.success("Challenge deleted");
      fetchChallenges();
    } catch {
      toast.error("Failed to delete challenge");
    }
  };

  const getStatusBadge = (challenge: ChallengeResponse) => {
    if (challenge.status === "CLOSED") {
      return <span className="px-2 py-0.5 text-xs rounded bg-gray-600 text-gray-200">Closed</span>;
    }
    if (challenge.published) {
      return <span className="px-2 py-0.5 text-xs rounded bg-green-600 text-white">Published</span>;
    }
    return <span className="px-2 py-0.5 text-xs rounded bg-yellow-600 text-white">Draft</span>;
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-white">Challenges Management</h1>
        <Link href="/admin/challenges/new">
          <Button>+ New Challenge</Button>
        </Link>
      </div>

      {/* Filters */}
      <div className="flex gap-4 mb-6">
        <form onSubmit={handleSearch} className="flex-1">
          <Input
            type="text"
            placeholder="Search challenges..."
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
          <option value="OPEN">Open</option>
          <option value="CLOSED">Closed</option>
        </Select>
      </div>

      {/* Table */}
      <div className="bg-[#16162a] border border-[#2d2d4a] rounded-lg overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-[#2d2d4a]">
              <th className="text-left px-4 py-3 text-sm font-medium text-gray-400">Title</th>
              <th className="text-left px-4 py-3 text-sm font-medium text-gray-400">Corporate</th>
              <th className="text-left px-4 py-3 text-sm font-medium text-gray-400">Theme</th>
              <th className="text-left px-4 py-3 text-sm font-medium text-gray-400">Deadline</th>
              <th className="text-left px-4 py-3 text-sm font-medium text-gray-400">Status</th>
              <th className="text-right px-4 py-3 text-sm font-medium text-gray-400">Actions</th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <tr>
                <td colSpan={6} className="px-4 py-8 text-center text-gray-400">
                  Loading...
                </td>
              </tr>
            ) : challenges.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-4 py-8 text-center text-gray-400">
                  No challenges found
                </td>
              </tr>
            ) : (
              challenges.map((challenge) => (
                <tr key={challenge.id} className="border-b border-[#2d2d4a] hover:bg-[#1e1e3a]">
                  <td className="px-4 py-3">
                    <Link
                      href={`/admin/challenges/${challenge.id}`}
                      className="text-white hover:text-gold transition-colors"
                    >
                      {challenge.title}
                    </Link>
                  </td>
                  <td className="px-4 py-3 text-gray-300">{challenge.corporateName}</td>
                  <td className="px-4 py-3 text-gray-300">{challenge.theme}</td>
                  <td className="px-4 py-3 text-gray-300">{challenge.deadline}</td>
                  <td className="px-4 py-3">{getStatusBadge(challenge)}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-end gap-2">
                      <Link href={`/admin/challenges/${challenge.id}`}>
                        <button className="text-xs text-gray-400 hover:text-white">Edit</button>
                      </Link>
                      {challenge.status !== "CLOSED" && (
                        <>
                          {challenge.published ? (
                            <button
                              onClick={() => handleUnpublish(challenge.id!)}
                              className="text-xs text-yellow-400 hover:text-yellow-300"
                            >
                              Unpublish
                            </button>
                          ) : (
                            <button
                              onClick={() => handlePublish(challenge.id!)}
                              className="text-xs text-green-400 hover:text-green-300"
                            >
                              Publish
                            </button>
                          )}
                          <button
                            onClick={() => handleClose(challenge.id!)}
                            className="text-xs text-orange-400 hover:text-orange-300"
                          >
                            Close
                          </button>
                        </>
                      )}
                      <button
                        onClick={() => handleDelete(challenge.id!)}
                        className="text-xs text-red-400 hover:text-red-300"
                      >
                        Delete
                      </button>
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
    </div>
  );
}
