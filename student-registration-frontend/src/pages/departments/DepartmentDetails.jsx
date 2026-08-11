import React, { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { FiArrowLeft, FiEdit2, FiUsers, FiBookOpen } from "react-icons/fi";
import DashboardLayout from "../../layouts/DashboardLayout";
import Card from "../../components/Card";
import Loading from "../../components/Loading";
import { departmentApi } from "../../api/departmentApi";
import { useToast } from "../../context/ToastContext";
import { extractErrorMessage } from "../../api/axios";
import { formatDate } from "../../utils/formatters";

export default function DepartmentDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const toast = useToast();
  const [department, setDepartment] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    departmentApi
      .getOne(id)
      .then(({ data }) => setDepartment(data?.data || data))
      .catch((err) => {
        toast.error(extractErrorMessage(err, "Unable to load this department."));
        navigate("/departments");
      })
      .finally(() => setIsLoading(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  if (isLoading) {
    return (
      <DashboardLayout>
        <Loading label="Loading department..." />
      </DashboardLayout>
    );
  }

  if (!department) return null;

  return (
    <DashboardLayout>
      <div className="max-w-2xl mx-auto">
        <Link to="/departments" className="inline-flex items-center gap-1.5 text-sm text-navy-600 hover:text-navy-800 mb-4">
          <FiArrowLeft size={14} /> Back to Departments
        </Link>

        <Card className="p-6">
          <div className="flex items-start justify-between mb-6">
            <div>
              <h1 className="font-display text-2xl text-navy-800">{department.name}</h1>
              <span className="inline-block mt-2 font-mono text-xs bg-navy-50 text-navy-700 px-2 py-1 rounded">
                {department.code}
              </span>
            </div>
            <Link
              to={`/departments/${id}/edit`}
              className="flex items-center gap-1.5 text-sm bg-navy-700 text-white px-3 py-2 rounded-lg hover:bg-navy-800 transition"
            >
              <FiEdit2 size={14} /> Edit
            </Link>
          </div>

          <div className="grid grid-cols-2 gap-4 mb-6">
            <div className="bg-paper rounded-lg p-4 flex items-center gap-3">
              <div className="h-9 w-9 rounded-lg bg-navy-100 text-navy-700 flex items-center justify-center">
                <FiUsers size={16} />
              </div>
              <div>
                <p className="font-mono text-lg text-navy-800">
                  {department.student_count ?? department.students_count ?? 0}
                </p>
                <p className="text-xs text-muted">Students</p>
              </div>
            </div>
            <div className="bg-paper rounded-lg p-4 flex items-center gap-3">
              <div className="h-9 w-9 rounded-lg bg-gold-50 text-gold-600 flex items-center justify-center">
                <FiBookOpen size={16} />
              </div>
              <div>
                <p className="font-mono text-lg text-navy-800">
                  {department.course_count ?? department.courses_count ?? 0}
                </p>
                <p className="text-xs text-muted">Courses</p>
              </div>
            </div>
          </div>

          <div className="hairline mb-4" />
          <p className="text-sm text-muted">
            Created on <span className="text-ink font-medium">{formatDate(department.created_at)}</span>
          </p>
        </Card>
      </div>
    </DashboardLayout>
  );
}
