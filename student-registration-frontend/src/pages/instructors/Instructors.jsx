
import React, { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  FiPlus,
  FiEye,
  FiEdit2,
  FiTrash2,
  FiUserCheck,
  FiRefreshCw
} from "react-icons/fi";

import DashboardLayout from "../../layouts/DashboardLayout";
import Card from "../../components/Card";
import DataTable from "../../components/DataTable";
import SearchBar from "../../components/SearchBar";
import Pagination from "../../components/Pagination";
import ConfirmDialog from "../../components/ConfirmDialog";

import { instructorApi } from "../../api/instructorApi";
import { useToast } from "../../context/ToastContext";
import { extractErrorMessage } from "../../api/axios";
import { fullName, formatDate } from "../../utils/formatters";

export default function Instructors() {
  const toast = useToast();

  const [instructors, setInstructors] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);

  const pageSize = 10;

  const [deleteTarget, setDeleteTarget] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // =========================================================
  // LOAD INSTRUCTORS
  // =========================================================

  const loadInstructors = async () => {
    try {
      setIsLoading(true);
      setError("");

      const response = await instructorApi.getAll();

      console.log("Instructor API response:", response.data);

      const data = response?.data;

      let list = [];

      // Backend response:
      // {
      //   success: true,
      //   total: 2,
      //   instructors: [...]
      // }

      if (Array.isArray(data?.instructors)) {
        list = data.instructors;
      } else if (Array.isArray(data?.data)) {
        list = data.data;
      } else if (Array.isArray(data?.items)) {
        list = data.items;
      } else if (Array.isArray(data)) {
        list = data;
      }

      setInstructors(list);

    } catch (err) {
      console.error("Failed to load instructors:", err);

      setInstructors([]);

      const message = extractErrorMessage(
        err,
        "Unable to load instructors."
      );

      setError(message);

      toast.error(message);

    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadInstructors();

    // We intentionally load once when page opens.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // =========================================================
  // SEARCH
  // =========================================================

  const filteredInstructors = useMemo(() => {
    const keyword = search.trim().toLowerCase();

    if (!keyword) {
      return instructors;
    }

    return instructors.filter((instructor) => {
      const firstName =
        instructor.first_name || "";

      const lastName =
        instructor.last_name || "";

      const email =
        instructor.email || "";

      const phone =
        instructor.phone || "";

      const department =
        instructor.department_name || "";

      return (
        firstName.toLowerCase().includes(keyword) ||
        lastName.toLowerCase().includes(keyword) ||
        email.toLowerCase().includes(keyword) ||
        phone.toLowerCase().includes(keyword) ||
        department.toLowerCase().includes(keyword)
      );
    });
  }, [instructors, search]);

  // =========================================================
  // PAGINATION
  // =========================================================

  const total = filteredInstructors.length;

  const totalPages = Math.max(
    1,
    Math.ceil(total / pageSize)
  );

  useEffect(() => {
    if (page > totalPages) {
      setPage(totalPages);
    }
  }, [page, totalPages]);

  const paginatedInstructors = useMemo(() => {
    const start =
      (page - 1) * pageSize;

    return filteredInstructors.slice(
      start,
      start + pageSize
    );
  }, [filteredInstructors, page]);

  // =========================================================
  // SEARCH CHANGE
  // =========================================================

  function handleSearch(value) {
    setSearch(value);
    setPage(1);
  }

  // =========================================================
  // DELETE
  // =========================================================

  async function confirmDelete() {
    if (!deleteTarget) {
      return;
    }

    try {
      setIsDeleting(true);

      // IMPORTANT:
      // Backend uses instructor_id, NOT id.
      const instructorId =
        deleteTarget.instructor_id;

      if (!instructorId) {
        toast.error("Instructor ID is missing.");
        return;
      }

      await instructorApi.remove(
        instructorId
      );

      toast.success(
        "Instructor deleted successfully."
      );

      setDeleteTarget(null);

      await loadInstructors();

    } catch (err) {
      console.error(
        "Delete instructor error:",
        err
      );

      toast.error(
        extractErrorMessage(
          err,
          "Unable to delete this instructor."
        )
      );

    } finally {
      setIsDeleting(false);
    }
  }

  // =========================================================
  // TABLE COLUMNS
  // =========================================================

  const columns = [
    {
      key: "last_name",
      label: "Name",

      render: (instructor) => (
        <span className="font-medium text-ink">
          {fullName(instructor)}
        </span>
      )
    },

    {
      key: "email",
      label: "Email",

      render: (instructor) =>
        instructor.email || "—"
    },

    {
      key: "phone",
      label: "Phone",

      render: (instructor) =>
        instructor.phone || "—",

      hideOnMobile: true
    },

    {
      key: "department_name",
      label: "Department",

      render: (instructor) =>
        instructor.department_name ||
        "—"
    },

    {
      key: "created_at",
      label: "Created At",

      render: (instructor) =>
        instructor.created_at
          ? formatDate(
              instructor.created_at
            )
          : "—",

      hideOnMobile: true
    },

    {
      key: "actions",
      label: "Actions",

      render: (instructor) => {
        // IMPORTANT:
        // Backend returns instructor_id.
        const id =
          instructor.instructor_id;

        return (
          <div className="flex items-center gap-1.5">

            <Link
              to={`/instructors/${id}`}
              className="p-1.5 rounded-md hover:bg-navy-50 text-navy-600"
              aria-label="View instructor"
            >
              <FiEye size={15} />
            </Link>

            <Link
              to={`/instructors/${id}/edit`}
              className="p-1.5 rounded-md hover:bg-navy-50 text-navy-600"
              aria-label="Edit instructor"
            >
              <FiEdit2 size={15} />
            </Link>

            <button
              type="button"
              onClick={() =>
                setDeleteTarget(
                  instructor
                )
              }
              className="p-1.5 rounded-md hover:bg-red-50 text-red-600"
              aria-label="Delete instructor"
            >
              <FiTrash2 size={15} />
            </button>

          </div>
        );
      }
    }
  ];

  // =========================================================
  // PAGE
  // =========================================================

  return (
    <DashboardLayout>

      {/* HEADER */}

      <div className="flex flex-wrap items-center justify-between gap-3 mb-6">

        <div className="flex items-center gap-2">

          <div className="h-9 w-9 rounded-lg bg-navy-100 text-navy-700 flex items-center justify-center">
            <FiUserCheck size={16} />
          </div>

          <div>
            <h1 className="font-display text-xl text-navy-800">
              Instructors
            </h1>

            <p className="text-xs text-muted mt-0.5">
              {total} instructor
              {total !== 1 ? "s" : ""}
            </p>
          </div>

        </div>

        <div className="flex items-center gap-2">

          <button
            type="button"
            onClick={loadInstructors}
            disabled={isLoading}
            className="flex items-center gap-2 border border-line text-ink px-3 py-2 rounded-lg text-sm hover:bg-paper transition disabled:opacity-50"
          >
            <FiRefreshCw
              size={14}
              className={
                isLoading
                  ? "animate-spin"
                  : ""
              }
            />

            Refresh
          </button>

          <Link
            to="/instructors/create"
            className="flex items-center gap-2 bg-navy-700 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-navy-800 transition"
          >
            <FiPlus size={15} />

            Add Instructor
          </Link>

        </div>

      </div>

      {/* CONTENT */}

      <Card>

        {/* SEARCH */}

        <div className="p-4 border-b border-line">

          <SearchBar
            value={search}
            onChange={handleSearch}
            placeholder="Search by name, email, phone or department..."
          />

        </div>

        {/* ERROR */}

        {error && !isLoading && (
          <div className="p-5 border-b border-line">

            <div className="rounded-lg border border-red-200 bg-red-50 p-4">

              <p className="text-sm font-medium text-red-700">
                Could not load instructors
              </p>

              <p className="text-xs text-red-600 mt-1">
                {error}
              </p>

              <button
                type="button"
                onClick={loadInstructors}
                className="mt-3 text-xs font-medium text-red-700 underline"
              >
                Try again
              </button>

            </div>

          </div>
        )}

        {/* TABLE */}

        <DataTable
          columns={columns}
          rows={paginatedInstructors}
          isLoading={isLoading}
          error={error}
          emptyTitle={
            search
              ? "No instructors match your search."
              : "No instructors found."
          }
          emptyDescription={
            search
              ? "Try a different name, email, phone number or department."
              : "Add teaching staff to assign them to courses."
          }
          emptyAction={
            !search
              ? {
                  label: "Add Instructor",
                  onClick: () => {
                    window.location.href =
                      "/instructors/create";
                  }
                }
              : undefined
          }
        />

        {/* PAGINATION */}

        {!isLoading &&
          !error &&
          total > 0 && (
            <Pagination
              page={page}
              pageSize={pageSize}
              total={total}
              onPageChange={setPage}
            />
          )}

      </Card>

      {/* DELETE CONFIRMATION */}

      <ConfirmDialog
        isOpen={Boolean(deleteTarget)}
        onClose={() => {
          if (!isDeleting) {
            setDeleteTarget(null);
          }
        }}
        onConfirm={confirmDelete}
        isLoading={isDeleting}
        title="Delete instructor?"
        itemLabel={
          deleteTarget
            ? fullName(deleteTarget)
            : ""
        }
      />

    </DashboardLayout>
  );
}

