"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { getAdminGrants, publishGrant, unpublishGrant, expireGrant, deleteGrant } from "@/lib/api/admin";
import type { AdminGrantResponse } from "@/lib/api/types";
import { Button, Input, Select } from "@/components/ui";
import { toast } from "sonner";

type StatusFilter = "" | "published" | "draft" | "expired";

export default function AdminGrantsPage() {
  const [grants, setGrants] = useState<AdminGrantResponse[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("");
  const [searchQuery, setSearchQuery] = useState("");
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);

  const fetchGrants = async () => {
    setIsLoading(true);
    try {
      const response = await getAdminGrants({
        page,
        size: 20,
        status: statusFilter || undefined,
        q: searchQuery || undefined,
      });
      setGrants(response.content);
      setTotalPages(response.page?.totalPages || 0);
    } catch (error) {
      console.error("Failed to fetch grants:", error);
      toast.error("Failed to load grants");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchGrants();
  }, [page, statusFilter]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(0);
    fetchGrants();
  };

  const handlePublish = async (id: string) => {
    try {
      await publishGrant(id);
      toast.success("Grant published");
      fetchGrants();
    } catch {
      toast.error("Failed to publish grant");
    }
  };

  const handleUnpublish = async (id: string) => {
    try {
      await unpublishGrant(id);
      toast.success("Grant unpublished");
      fetchGrants();
    } catch {
      toast.error("Failed to unpublish grant");
    }
  };

  const handleExpire = async (id: string) => {
    try {
      await expireGrant(id);
      toast.success("Grant marked as expired");
      fetchGrants();
    } catch {
      toast.error("Failed to expire grant");
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this grant?")) return;
    try {
      await deleteGrant(id);
      toast.success("Grant deleted");
      fetchGrants();
    } catch {
      toast.error("Failed to delete grant");
    }
  };

  const getStatusBadge = (grant: AdminGrantResponse) => {
    if (grant.expired) {
      return <span className="px-2 py-0.5 text-xs rounded bg-gray-600 text-gray-200">Expired</span>;
    }
    if (grant.published) {
      return <span className="px-2 py-0.5 text-xs rounded bg-green-600 text-white">Published</span>;
    }
    return <span className="px-2 py-0.5 text-xs rounded bg-yellow-600 text-white">Draft</span>;
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-white">Grants Management</h1>
        <Link href="/admin/grants/new">
          <Button>+ New Grant</Button>
        </Link>
      </div>

      {/* Filters */}
      <div className="flex gap-4 mb-6">
        <form onSubmit={handleSearch} className="flex-1">
          <Input
            type="text"
            placeholder="Search grants..."
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
          <option value="published">Published</option>
          <option value="draft">Draft</option>
          <option value="expired">Expired</option>
        </Select>
      </div>

      {/* Table */}
      <div className="bg-[#16162a] border border-[#2d2d4a] rounded-lg overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-[#2d2d4a]">
              <th className="text-left px-4 py-3 text-sm font-medium text-gray-400">Name</th>
              <th className="text-left px-4 py-3 text-sm font-medium text-gray-400">Issuing Body</th>
              <th className="text-left px-4 py-3 text-sm font-medium text-gray-400">Type</th>
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
            ) : grants.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-4 py-8 text-center text-gray-400">
                  No grants found
                </td>
              </tr>
            ) : (
              grants.map((grant) => (
                <tr key={grant.id} className="border-b border-[#2d2d4a] hover:bg-[#1e1e3a]">
                  <td className="px-4 py-3">
                    <Link
                      href={`/admin/grants/${grant.id}`}
                      className="text-white hover:text-gold transition-colors"
                    >
                      {grant.name}
                    </Link>
                  </td>
                  <td className="px-4 py-3 text-gray-300">{grant.issuingBody}</td>
                  <td className="px-4 py-3 text-gray-300">{grant.type}</td>
                  <td className="px-4 py-3 text-gray-300">
                    {grant.deadline || "Rolling"}
                  </td>
                  <td className="px-4 py-3">{getStatusBadge(grant)}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-end gap-2">
                      <Link href={`/admin/grants/${grant.id}`}>
                        <button className="text-xs text-gray-400 hover:text-white">Edit</button>
                      </Link>
                      {!grant.expired && (
                        <>
                          {grant.published ? (
                            <button
                              onClick={() => handleUnpublish(grant.id!)}
                              className="text-xs text-yellow-400 hover:text-yellow-300"
                            >
                              Unpublish
                            </button>
                          ) : (
                            <button
                              onClick={() => handlePublish(grant.id!)}
                              className="text-xs text-green-400 hover:text-green-300"
                            >
                              Publish
                            </button>
                          )}
                          <button
                            onClick={() => handleExpire(grant.id!)}
                            className="text-xs text-orange-400 hover:text-orange-300"
                          >
                            Expire
                          </button>
                        </>
                      )}
                      <button
                        onClick={() => handleDelete(grant.id!)}
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
