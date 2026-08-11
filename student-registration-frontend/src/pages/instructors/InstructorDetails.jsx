import React, { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { FiArrowLeft, FiEdit2, FiMail, FiPhone } from "react-icons/fi";
import DashboardLayout from "../../layouts/DashboardLayout";
import Card from "../../components/Card";
import Loading from "../../components/Loading";
import { instructorApi } from "../../api/instructorApi";
import { useToast } from "../../context/ToastContext";
import { extractErrorMessage } from "../../api/axios";
import { fullName, initials, formatDate } from "../../utils/formatters";

export default function InstructorDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const toast = useToast();
  const [instructor, setInstructor] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    instructorApi
      .getOne(id)
      .then(({ data }) => setInstructor(data?.data || data))
      .catch((err) => {
        toast.error(extractErrorMessage(err, "Unable to load this instructor."));
        navigate("/instructors");
      })
      .finally(() => setIsLoading(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  if (isLoading) {
    return (
      <DashboardLayout>
        <Loading label="Loading instructor..." />
      </DashboardLayout>
    );
  }

  if (!instructor) return null;

  return (
    <DashboardLayout>
      <div className="max-w-2xl mx-auto">
        <Link to="/instructors" className="inline-flex items-center gap-1.5 text-sm text-navy-600 hover:text-navy-800 mb-4">
          <FiArrowLeft size={14} /> Back to Instructors
        </Link>

        <Card className="p-6">
          <div className="flex items-start justify-between mb-6">
            <div className="flex items-center gap-4">
              <div className="h-14 w-14 rounded-full bg-navy-100 text-navy-700 flex items-center justify-center font-display text-lg">
                {initials(instructor)}
              </div>
              <div>
                <h1 className="font-display text-xl text-navy-800">{fullName(instructor)}</h1>
                <p className="text-sm text-muted">{instructor.department_name || instructor.department?.name || "—"}</p>
              </div>
            </div>
            <Link
              to={`/instructors/${id}/edit`}
              className="flex items-center gap-1.5 text-sm bg-navy-700 text-white px-3 py-2 rounded-lg hover:bg-navy-800 transition"
            >
              <FiEdit2 size={14} /> Edit
            </Link>
          </div>

          <div className="hairline mb-4" />

          <div className="space-y-2.5 text-sm">
            <p className="flex items-center gap-2 text-muted"><FiMail size={14} /> {instructor.email}</p>
            <p className="flex items-center gap-2 text-muted"><FiPhone size={14} /> {instructor.phone}</p>
            <p className="flex justify-between pt-2"><span className="text-muted">Created At</span><span className="font-medium text-ink">{formatDate(instructor.created_at)}</span></p>
          </div>
        </Card>
      </div>
    </DashboardLayout>
  );
}
