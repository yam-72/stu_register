import React, { useState } from "react";
import { Link } from "react-router-dom";
import { FiPlus, FiEye, FiEdit2, FiTrash2, FiUsers, FiUser } from "react-icons/fi";
import DashboardLayout from "../../layouts/DashboardLayout";
import Card from "../../components/Card";
import DataTable from "../../components/DataTable";
import SearchBar from "../../components/SearchBar";
import Pagination from "../../components/Pagination";
import ConfirmDialog from "../../components/ConfirmDialog";
import StatusBadge from "../../components/StatusBadge";
import { useApiResource } from "../../hooks/useApiResource";
import { studentApi } from "../../api/studentApi";
import { useToast } from "../../context/ToastContext";
import { extractErrorMessage } from "../../api/axios";
import { fullName, resolveUploadUrl, initials } from "../../utils/formatters";

export default function Students() {
  const toast = useToast();
  const {
    rows, total, page, setPage, pageSize, search, setSearch,
    sortKey, sortDir, handleSort, isLoading, error, refetch
  } = useApiResource(studentApi.getAll, { pageSize: 10, initialSort: "last_name" });

  const [deleteTarget, setDeleteTarget] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  async function confirmDelete() {
    setIsDeleting(true);
    try {
      await studentApi.remove(deleteTarget.id);
      toast.success("Student deleted successfully");
      setDeleteTarget(null);
      refetch();
    } catch (err) {
      toast.error(extractErrorMessage(err, "Unable to delete this student."));
    } finally {
      setIsDeleting(false);
    }
  }

  const columns = [
    {
      key: "photo",
      label: "",
      className: "w-12",
      render: (r) => {
        const src = resolveUploadUrl(r.photo || r.photo_url);
        return (
          <div className="h-9 w-9 rounded-full overflow-hidden bg-navy-100 flex items-center justify-center text-navy-600 text-xs font-semibold">
            {src ? <img src={src} alt="" className="h-full w-full object-cover" /> : initials(r)}
          </div>
        );
      },
      hideOnMobile: true
    },
    {
      key: "registration_number",
      label: "Reg. Number",
      sortable: true,
      render: (r) => <span className="font-mono text-xs text-navy-700">{r.registration_number}</span>
    },
    { key: "last_name", label: "Full Name", sortable: true, render: (r) => <span className="font-medium text-ink">{fullName(r)}</span> },
    { key: "gender", label: "Gender", hideOnMobile: true },
    { key: "email", label: "Email", hideOnMobile: true },
    { key: "phone", label: "Phone", hideOnMobile: true },
    { key: "department_name", label: "Department", render: (r) => r.department_name || r.department?.name || "—" },
    { key: "admission_year", label: "Admission Year", hideOnMobile: true },
    { key: "status", label: "Status", render: (r) => <StatusBadge status={r.status} /> },
    {
      key: "actions",
      label: "Actions",
      render: (r) => (
        <div className="flex items-center gap-1.5">
          <Link to={`/students/${r.id}`} className="p-1.5 rounded-md hover:bg-navy-50 text-navy-600" aria-label="View">
            <FiEye size={15} />
          </Link>
          <Link to={`/students/${r.id}/edit`} className="p-1.5 rounded-md hover:bg-navy-50 text-navy-600" aria-label="Edit">
            <FiEdit2 size={15} />
          </Link>
          <button
            onClick={() => setDeleteTarget(r)}
            className="p-1.5 rounded-md hover:bg-red-50 text-red-600"
            aria-label="Delete"
          >
            <FiTrash2 size={15} />
          </button>
        </div>
      )
    }
  ];

  return (
    <DashboardLayout>
      <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
        <div className="flex items-center gap-2">
          <div className="h-9 w-9 rounded-lg bg-navy-100 text-navy-700 flex items-center justify-center">
            <FiUsers size={16} />
          </div>
          <h1 className="font-display text-xl text-navy-800">Students</h1>
        </div>
        <Link
          to="/students/create"
          className="flex items-center gap-2 bg-navy-700 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-navy-800 transition"
        >
          <FiPlus size={15} /> Add Student
        </Link>
      </div>

      <Card>
        <div className="p-4 border-b border-line">
          <SearchBar value={search} onChange={setSearch} placeholder="Search by name, reg. number, or email..." />
        </div>
        <DataTable
          columns={columns}
          rows={rows}
          isLoading={isLoading}
          error={error}
          sortKey={sortKey}
          sortDir={sortDir}
          onSort={handleSort}
          emptyTitle="No students found."
          emptyDescription="Add a student record to begin building the registry."
          emptyAction={{ label: "Add Student", onClick: () => (window.location.href = "/students/create") }}
          icon={FiUser}
        />
        <Pagination page={page} pageSize={pageSize} total={total} onPageChange={setPage} />
      </Card>

      <ConfirmDialog
        isOpen={Boolean(deleteTarget)}
        onClose={() => setDeleteTarget(null)}
        onConfirm={confirmDelete}
        isLoading={isDeleting}
        title="Delete student?"
        itemLabel={deleteTarget ? fullName(deleteTarget) : ""}
        description="This action cannot be undone. All related course registrations and grades will be affected."
      />
    </DashboardLayout>
  );
}
