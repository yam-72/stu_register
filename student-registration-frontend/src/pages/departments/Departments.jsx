
import React, { useState } from "react";
import { Link } from "react-router-dom";
import {
  FiPlus,
  FiEye,
  FiEdit2,
  FiTrash2,
  FiBriefcase
} from "react-icons/fi";

import DashboardLayout from "../../layouts/DashboardLayout";
import Card from "../../components/Card";
import DataTable from "../../components/DataTable";
import SearchBar from "../../components/SearchBar";
import Pagination from "../../components/Pagination";
import ConfirmDialog from "../../components/ConfirmDialog";

import { useApiResource } from "../../hooks/useApiResource";
import { departmentApi } from "../../api/departmentApi";

import { useToast } from "../../context/ToastContext";
import { extractErrorMessage } from "../../api/axios";
import { formatDate } from "../../utils/formatters";

export default function Departments() {
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
  } = useApiResource(departmentApi.getAll, {
    pageSize: 10,
    initialSort: "department_name"
  });

  const [deleteTarget, setDeleteTarget] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  async function confirmDelete() {
    if (!deleteTarget) return;

    setIsDeleting(true);

    try {
      await departmentApi.remove(deleteTarget.department_id);

      toast.success("Department deleted successfully");

      setDeleteTarget(null);

      refetch();
    } catch (err) {
      toast.error(
        extractErrorMessage(
          err,
          "Department cannot be deleted."
        )
      );
    } finally {
      setIsDeleting(false);
    }
  }

  const columns = [
    {
      key: "department_name",
      label: "Department Name",
      sortable: true,
      render: (r) => (
        <span className="font-medium text-ink">
          {r.department_name || "—"}
        </span>
      )
    },

    {
      key: "department_code",
      label: "Code",
      sortable: true,
      render: (r) => (
        <span className="font-mono text-xs bg-navy-50 text-navy-700 px-2 py-1 rounded">
          {r.department_code || "—"}
        </span>
      )
    },

    {
      key: "created_at",
      label: "Created At",
      sortable: true,
      render: (r) => formatDate(r.created_at),
      hideOnMobile: true
    },

    {
      key: "student_count",
      label: "Students",
      render: (r) =>
        r.student_count ??
        r.students_count ??
        "—"
    },

    {
      key: "course_count",
      label: "Courses",
      render: (r) =>
        r.course_count ??
        r.courses_count ??
        "—"
    },

    {
      key: "actions",
      label: "Actions",

      render: (r) => (
        <div className="flex items-center gap-1.5">

          {/* View */}
          <Link
            to={`/departments/${r.department_id}`}
            className="p-1.5 rounded-md hover:bg-navy-50 text-navy-600"
            aria-label="View department"
          >
            <FiEye size={15} />
          </Link>

          {/* Edit */}
          <Link
            to={`/departments/${r.department_id}/edit`}
            className="p-1.5 rounded-md hover:bg-navy-50 text-navy-600"
            aria-label="Edit department"
          >
            <FiEdit2 size={15} />
          </Link>

          {/* Delete */}
          <button
            type="button"
            onClick={() => setDeleteTarget(r)}
            className="p-1.5 rounded-md hover:bg-red-50 text-red-600"
            aria-label="Delete department"
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
            <FiBriefcase size={16} />
          </div>

          <h1 className="font-display text-xl text-navy-800">
            Departments
          </h1>

        </div>

        <Link
          to="/departments/create"
          className="flex items-center gap-2 bg-navy-700 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-navy-800 transition"
        >
          <FiPlus size={15} />
          Add Department
        </Link>

      </div>

      {/* Table Card */}
      <Card>

        {/* Search */}
        <div className="p-4 border-b border-line">

          <SearchBar
            value={search}
            onChange={setSearch}
            placeholder="Search departments..."
          />

        </div>

        {/* Data Table */}
        <DataTable
          columns={columns}
          rows={rows}
          isLoading={isLoading}
          error={error}
          sortKey={sortKey}
          sortDir={sortDir}
          onSort={handleSort}

          emptyTitle="No departments found."

          emptyDescription="Add the institution's first academic department to get started."

          emptyAction={{
            label: "Add Department",
            onClick: () => {
              window.location.href = "/departments/create";
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

        title="Delete department?"

        itemLabel={
          deleteTarget
            ? deleteTarget.department_name
            : ""
        }

        description="This action cannot be undone. Departments with existing students or courses cannot be deleted."
      />

    </DashboardLayout>
  );
}
