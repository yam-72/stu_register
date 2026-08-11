import React, { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { FiArrowLeft, FiEdit2 } from "react-icons/fi";
import DashboardLayout from "../../layouts/DashboardLayout";
import Card from "../../components/Card";
import Loading from "../../components/Loading";
import { courseApi } from "../../api/courseApi";
import { useToast } from "../../context/ToastContext";
import { extractErrorMessage } from "../../api/axios";

export default function CourseDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const toast = useToast();
  const [course, setCourse] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    courseApi
      .getOne(id)
      .then(({ data }) => setCourse(data?.data || data))
      .catch((err) => {
        toast.error(extractErrorMessage(err, "Unable to load this course."));
        navigate("/courses");
      })
      .finally(() => setIsLoading(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  if (isLoading) {
    return (
      <DashboardLayout>
        <Loading label="Loading course..." />
      </DashboardLayout>
    );
  }

  if (!course) return null;

  return (
    <DashboardLayout>
      <div className="max-w-2xl mx-auto">
        <Link to="/courses" className="inline-flex items-center gap-1.5 text-sm text-navy-600 hover:text-navy-800 mb-4">
          <FiArrowLeft size={14} /> Back to Courses
        </Link>

        <Card className="p-6">
          <div className="flex items-start justify-between mb-6">
            <div>
              <span className="font-mono text-xs bg-navy-50 text-navy-700 px-2 py-1 rounded">{course.code}</span>
              <h1 className="font-display text-2xl text-navy-800 mt-2">{course.name}</h1>
            </div>
            <Link
              to={`/courses/${id}/edit`}
              className="flex items-center gap-1.5 text-sm bg-navy-700 text-white px-3 py-2 rounded-lg hover:bg-navy-800 transition"
            >
              <FiEdit2 size={14} /> Edit
            </Link>
          </div>

          <div className="hairline mb-4" />

          <div className="space-y-2.5 text-sm">
            <p className="flex justify-between"><span className="text-muted">Credit Hour</span><span className="font-medium text-ink">{course.credit_hour}</span></p>
            <p className="flex justify-between"><span className="text-muted">Department</span><span className="font-medium text-ink">{course.department_name || course.department?.name || "—"}</span></p>
          </div>
        </Card>
      </div>
    </DashboardLayout>
  );
}
