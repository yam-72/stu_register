
import React, { useState } from "react";
import { Link } from "react-router-dom";
import {
  FiPlus,
  FiEye,
  FiEdit2,
  FiTrash2,
  FiBookOpen
} from "react-icons/fi";

import DashboardLayout from "../../layouts/DashboardLayout";
import Card from "../../components/Card";
import DataTable from "../../components/DataTable";
import SearchBar from "../../components/SearchBar";
import Pagination from "../../components/Pagination";
import ConfirmDialog from "../../components/ConfirmDialog";

import { useApiResource } from "../../hooks/useApiResource";
import { courseApi } from "../../api/courseApi";

import { useToast } from "../../context/ToastContext";
import { extractErrorMessage } from "../../api/axios";

export default function Courses() {
  const toast = useToast();

  const {
    rows,
    total,
    page,
    setPage,
    pageSize,
    search,
    setSearch,
    sortKey,
    sortDir,
    handleSort,
    isLoading,
    error,
    refetch
  } = useApiResource(courseApi.getAll, {
    pageSize: 10,
    initialSort: "course_code"
  });

  const [deleteTarget, setDeleteTarget] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  async function confirmDelete() {
    if (!deleteTarget) return;

    setIsDeleting(true);

    try {
      await courseApi.remove(deleteTarget.course_id);

      toast.success("Course deleted successfully");

      setDeleteTarget(null);

      refetch();
    } catch (err) {
      toast.error(
        extractErrorMessage(
          err,
          "Unable to delete this course."
        )
      );
    } finally {
      setIsDeleting(false);
    }
  }

  const columns = [
    {
      key: "course_code",
      label: "Course Code",
      sortable: true,

      render: (r) => (
        <span className="font-mono text-xs bg-navy-50 text-navy-700 px-2 py-1 rounded">
          {r.course_code || "—"}
        </span>
      )
    },

    {
      key: "course_name",
      label: "Course Name",
      sortable: true,

      render: (r) => (
        <span className="font-medium text-ink">
          {r.course_name || "—"}
        </span>
      )
    },

    {
      key: "credit_hour",
      label: "Credit Hour",

      render: (r) => (
        <span>
          {r.credit_hour ?? "—"}
        </span>
      )
    },

    {
      key: "department_name",
      label: "Department",

      render: (r) => (
        <span>
          {r.department_name ||
            r.department?.department_name ||
            r.department?.name ||
            "—"}
        </span>
      )
    },

    {
      key: "actions",
      label: "Actions",

      render: (r) => (
        <div className="flex items-center gap-1.5">

          {/* View */}
          <Link
            to={`/courses/${r.course_id}`}
            className="p-1.5 rounded-md hover:bg-navy-50 text-navy-600"
            aria-label="View course"
          >
            <FiEye size={15} />
          </Link>

          {/* Edit */}
          <Link
            to={`/courses/${r.course_id}/edit`}
            className="p-1.5 rounded-md hover:bg-navy-50 text-navy-600"
            aria-label="Edit course"
          >
            <FiEdit2 size={15} />
          </Link>

          {/* Delete */}
          <button
            type="button"
            onClick={() => setDeleteTarget(r)}
            className="p-1.5 rounded-md hover:bg-red-50 text-red-600"
            aria-label="Delete course"
          >
            <FiTrash2 size={15} />
          </button>

        </div>
      )
    }
  ];

  return (
    <DashboardLayout>

      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 mb-6">

        <div className="flex items-center gap-2">

          <div className="h-9 w-9 rounded-lg bg-navy-100 text-navy-700 flex items-center justify-center">
            <FiBookOpen size={16} />
          </div>

          <h1 className="font-display text-xl text-navy-800">
            Courses
          </h1>

        </div>

        <Link
          to="/courses/create"
          className="flex items-center gap-2 bg-navy-700 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-navy-800 transition"
        >
          <FiPlus size={15} />
          Add Course
        </Link>

      </div>

      {/* Courses Card */}
      <Card>

        {/* Search */}
        <div className="p-4 border-b border-line">

          <SearchBar
            value={search}
            onChange={setSearch}
            placeholder="Search by course code or name..."
          />

        </div>

        {/* Table */}
        <DataTable
          columns={columns}
          rows={rows}
          isLoading={isLoading}
          error={error}
          sortKey={sortKey}
          sortDir={sortDir}
          onSort={handleSort}

          emptyTitle="No courses found."

          emptyDescription="Add the first course to this department's catalog."

          emptyAction={{
            label: "Add Course",
            onClick: () => {
              window.location.href = "/courses/create";
            }
          }}
        />

        {/* Pagination */}
        <Pagination
          page={page}
          pageSize={pageSize}
          total={total}
          onPageChange={setPage}
        />

      </Card>

      {/* Delete Confirmation */}
      <ConfirmDialog
        isOpen={Boolean(deleteTarget)}

        onClose={() => setDeleteTarget(null)}

        onConfirm={confirmDelete}

        isLoading={isDeleting}

        title="Delete course?"

        itemLabel={
          deleteTarget
            ? `${deleteTarget.course_code || ""} — ${
                deleteTarget.course_name || ""
              }`
            : ""
        }

        description="This action cannot be undone. Existing registrations for this course will be affected."
      />

    </DashboardLayout>
  );
}

