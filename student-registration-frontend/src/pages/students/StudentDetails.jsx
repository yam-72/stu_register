import React, { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { FiArrowLeft, FiEdit2, FiMail, FiPhone, FiMapPin, FiCalendar } from "react-icons/fi";
import DashboardLayout from "../../layouts/DashboardLayout";
import Card from "../../components/Card";
import Loading from "../../components/Loading";
import StatusBadge from "../../components/StatusBadge";
import EmptyState from "../../components/EmptyState";
import { studentApi } from "../../api/studentApi";
import { registrationApi } from "../../api/registrationApi";
import { gradeApi } from "../../api/gradeApi";
import { useToast } from "../../context/ToastContext";
import { extractErrorMessage } from "../../api/axios";
import { fullName, formatDate, resolveUploadUrl, initials, gpaRemark } from "../../utils/formatters";

const TABS = [
  { key: "courses", label: "Registered Courses" },
  { key: "grades", label: "Grades" },
  { key: "gpa", label: "GPA" }
];

export default function StudentDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const toast = useToast();

  const [student, setStudent] = useState(null);
  const [courses, setCourses] = useState([]);
  const [grades, setGrades] = useState([]);
  const [gpa, setGpa] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("courses");

  useEffect(() => {
    setIsLoading(true);
    Promise.allSettled([
      studentApi.getOne(id),
      registrationApi.getByStudent(id),
      gradeApi.getByStudent(id),
      gradeApi.getGpa(id)
    ]).then(([studentRes, coursesRes, gradesRes, gpaRes]) => {
      if (studentRes.status === "fulfilled") {
        setStudent(studentRes.value.data?.data || studentRes.value.data);
      } else {
        toast.error(extractErrorMessage(studentRes.reason, "Student not found."));
        navigate("/students");
        return;
      }
      if (coursesRes.status === "fulfilled") {
        const list = coursesRes.value.data?.data || coursesRes.value.data || [];
        setCourses(Array.isArray(list) ? list : []);
      }
      if (gradesRes.status === "fulfilled") {
        const list = gradesRes.value.data?.data || gradesRes.value.data || [];
        setGrades(Array.isArray(list) ? list : []);
      }
      if (gpaRes.status === "fulfilled") {
        setGpa(gpaRes.value.data?.data || gpaRes.value.data);
      }
      setIsLoading(false);
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  if (isLoading) {
    return (
      <DashboardLayout>
        <Loading label="Loading student profile..." />
      </DashboardLayout>
    );
  }

  if (!student) return null;

  const photo = resolveUploadUrl(student.photo || student.photo_url);
  const gpaValue = gpa?.gpa ?? gpa?.value;

  return (
    <DashboardLayout>
      <div className="max-w-4xl mx-auto">
        <Link to="/students" className="inline-flex items-center gap-1.5 text-sm text-navy-600 hover:text-navy-800 mb-4">
          <FiArrowLeft size={14} /> Back to Students
        </Link>

        <div className="grid md:grid-cols-3 gap-5">
          {/* Profile card */}
          <Card className="p-6 text-center md:col-span-1 h-fit">
            <div className="h-24 w-24 rounded-full overflow-hidden bg-navy-100 mx-auto flex items-center justify-center text-navy-600 font-display text-2xl">
              {photo ? <img src={photo} alt="" className="h-full w-full object-cover" /> : initials(student)}
            </div>
            <h2 className="font-display text-lg text-navy-800 mt-3">{fullName(student)}</h2>
            <p className="font-mono text-xs text-navy-600 mt-1">{student.registration_number}</p>
            <div className="mt-2"><StatusBadge status={student.status} /></div>

            <div className="hairline my-4" />

            <div className="text-left space-y-2.5 text-sm">
              <p className="flex items-center gap-2 text-muted"><FiMail size={14} /> {student.email}</p>
              <p className="flex items-center gap-2 text-muted"><FiPhone size={14} /> {student.phone}</p>
              <p className="flex items-center gap-2 text-muted"><FiMapPin size={14} /> {student.address || "—"}</p>
              <p className="flex items-center gap-2 text-muted"><FiCalendar size={14} /> {formatDate(student.date_of_birth)}</p>
            </div>

            <div className="hairline my-4" />

            <div className="text-left space-y-1.5 text-sm">
              <p className="flex justify-between"><span className="text-muted">Department</span><span className="font-medium text-ink">{student.department_name || student.department?.name || "—"}</span></p>
              <p className="flex justify-between"><span className="text-muted">Admission Year</span><span className="font-medium text-ink">{student.admission_year}</span></p>
              <p className="flex justify-between"><span className="text-muted">Gender</span><span className="font-medium text-ink">{student.gender}</span></p>
            </div>

            <Link
              to={`/students/${id}/edit`}
              className="mt-5 flex items-center justify-center gap-2 w-full py-2.5 rounded-lg text-sm bg-navy-700 text-white hover:bg-navy-800 transition"
            >
              <FiEdit2 size={14} /> Edit Student
            </Link>
          </Card>

          {/* Tabs */}
          <Card className="p-0 md:col-span-2">
            <div className="flex border-b border-line overflow-x-auto no-scrollbar">
              {TABS.map((tab) => (
                <button
                  key={tab.key}
                  onClick={() => setActiveTab(tab.key)}
                  className={`px-5 py-3.5 text-sm font-medium whitespace-nowrap border-b-2 transition ${
                    activeTab === tab.key
                      ? "border-navy-700 text-navy-800"
                      : "border-transparent text-muted hover:text-ink"
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            <div className="p-5">
              {activeTab === "courses" && (
                courses.length === 0 ? (
                  <EmptyState title="No courses registered yet." description="Register this student into a course to see it here." />
                ) : (
                  <div className="space-y-2">
                    {courses.map((c) => (
                      <div key={c.id} className="flex items-center justify-between bg-paper rounded-lg px-4 py-3">
                        <div>
                          <p className="text-sm font-medium text-ink">{c.course_name || c.course?.name}</p>
                          <p className="text-xs text-muted font-mono">{c.course_code || c.course?.code} · {c.semester} · {c.academic_year}</p>
                        </div>
                        <StatusBadge status={c.status || "registered"} />
                      </div>
                    ))}
                  </div>
                )
              )}

              {activeTab === "grades" && (
                grades.length === 0 ? (
                  <EmptyState title="No grades available for this student." />
                ) : (
                  <div className="space-y-2">
                    {grades.map((g) => (
                      <div key={g.id} className="flex items-center justify-between bg-paper rounded-lg px-4 py-3">
                        <div>
                          <p className="text-sm font-medium text-ink">{g.course_name || g.course?.name}</p>
                          <p className="text-xs text-muted font-mono">{g.course_code || g.course?.code} · {g.semester} · {g.academic_year}</p>
                        </div>
                        <span className="font-mono text-sm font-semibold text-navy-800 bg-navy-50 px-2.5 py-1 rounded">
                          {g.grade}
                        </span>
                      </div>
                    ))}
                  </div>
                )
              )}

              {activeTab === "gpa" && (
                gpaValue === undefined || gpaValue === null ? (
                  <EmptyState title="GPA not available yet." description="GPA appears once grades have been recorded." />
                ) : (
                  <div className="flex flex-col items-center py-6">
                    <div className="relative h-40 w-40 flex items-center justify-center">
                      <svg viewBox="0 0 120 120" className="h-40 w-40 -rotate-90">
                        <circle cx="60" cy="60" r="52" fill="none" stroke="#E3E7EF" strokeWidth="10" />
                        <circle
                          cx="60"
                          cy="60"
                          r="52"
                          fill="none"
                          stroke="#C89B3C"
                          strokeWidth="10"
                          strokeLinecap="round"
                          strokeDasharray={`${(Number(gpaValue) / 4) * 326.7} 326.7`}
                        />
                      </svg>
                      <div className="absolute text-center">
                        <p className="font-mono text-3xl text-navy-800">{Number(gpaValue).toFixed(2)}</p>
                        <p className="text-xs text-muted uppercase tracking-wide mt-0.5">{gpaRemark(gpaValue)}</p>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4 mt-6 w-full max-w-xs text-center">
                      <div className="bg-paper rounded-lg py-3">
                        <p className="font-mono text-lg text-navy-800">{gpa?.total_credit_hours ?? gpa?.credit_hours ?? "—"}</p>
                        <p className="text-xs text-muted mt-1">Credit Hours</p>
                      </div>
                      <div className="bg-paper rounded-lg py-3">
                        <p className="font-mono text-lg text-navy-800">{gpa?.quality_points ?? "—"}</p>
                        <p className="text-xs text-muted mt-1">Quality Points</p>
                      </div>
                    </div>
                  </div>
                )
              )}
            </div>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
}
