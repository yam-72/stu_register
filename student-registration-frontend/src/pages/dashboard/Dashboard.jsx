
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  FiUsers,
  FiBriefcase,
  FiBookOpen,
  FiUserCheck,
  FiClipboard,
  FiAward
} from "react-icons/fi";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
  CartesianGrid
} from "recharts";
import DashboardLayout from "../../layouts/DashboardLayout";
import Card from "../../components/Card";
import { CardSkeleton } from "../../components/Loading";
import { useAuth } from "../../context/AuthContext";
import { studentApi } from "../../api/studentApi";
import { departmentApi } from "../../api/departmentApi";
import { courseApi } from "../../api/courseApi";
import { instructorApi } from "../../api/instructorApi";
import { registrationApi } from "../../api/registrationApi";
import { gradeApi } from "../../api/gradeApi";

const CHART_COLORS = [
  "#1F3A5F",
  "#C89B3C",
  "#4E6FA0",
  "#E6C784",
  "#7F9BC3",
  "#8C6822"
];

const SUMMARY_CONFIG = [
  {
    key: "students",
    label: "Total Students",
    icon: FiUsers,
    tone: "bg-navy-50 text-navy-700",
    path: "/students"
  },
  {
    key: "departments",
    label: "Total Departments",
    icon: FiBriefcase,
    tone: "bg-gold-50 text-gold-600",
    path: "/departments"
  },
  {
    key: "courses",
    label: "Total Courses",
    icon: FiBookOpen,
    tone: "bg-navy-50 text-navy-700",
    path: "/courses"
  },
  {
    key: "instructors",
    label: "Total Instructors",
    icon: FiUserCheck,
    tone: "bg-gold-50 text-gold-600",
    path: "/instructors"
  },
  {
    key: "registrations",
    label: "Registered Courses",
    icon: FiClipboard,
    tone: "bg-navy-50 text-navy-700",
    path: "/registrations"
  },
  {
    key: "grades",
    label: "Grades Recorded",
    icon: FiAward,
    tone: "bg-gold-50 text-gold-600",
    path: "/grades"
  }
];

function countOf(response) {
  if (!response) return 0;

  if (Array.isArray(response)) {
    return response.length;
  }

  if (typeof response.total === "number") {
    return response.total;
  }

  if (typeof response.count === "number") {
    return response.count;
  }

  if (Array.isArray(response.students)) {
    return response.students.length;
  }

  if (Array.isArray(response.departments)) {
    return response.departments.length;
  }

  if (Array.isArray(response.courses)) {
    return response.courses.length;
  }

  if (Array.isArray(response.instructors)) {
    return response.instructors.length;
  }

  if (Array.isArray(response.registrations)) {
    return response.registrations.length;
  }

  if (Array.isArray(response.grades)) {
    return response.grades.length;
  }

  if (Array.isArray(response.data)) {
    return response.data.length;
  }

  return 0;
}

function listOf(response, key) {
  if (!response) return [];

  if (Array.isArray(response)) {
    return response;
  }

  if (Array.isArray(response[key])) {
    return response[key];
  }

  if (Array.isArray(response.data)) {
    return response.data;
  }

  return [];
}

export default function Dashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [summary, setSummary] = useState(null);
  const [byDepartment, setByDepartment] = useState([]);
  const [gradeDistribution, setGradeDistribution] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let isCurrent = true;

    Promise.allSettled([
      studentApi.getAll({ limit: 1 }),
      departmentApi.getAll({ limit: 1 }),
      courseApi.getAll({ limit: 1 }),
      instructorApi.getAll({ limit: 1 }),
      registrationApi.getAll({ limit: 1 }),
      gradeApi.getAll({ limit: 1 }),

      departmentApi.getAll({ limit: 100 }),
      gradeApi.getAll({ limit: 500 })
    ]).then((results) => {
      if (!isCurrent) return;

      const [
        studentsRes,
        departmentsRes,
        coursesRes,
        instructorsRes,
        registrationsRes,
        gradesRes,
        allDepartmentsRes,
        allGradesRes
      ] = results;

      setSummary({
        students:
          studentsRes.status === "fulfilled"
            ? countOf(studentsRes.value.data)
            : 0,

        departments:
          departmentsRes.status === "fulfilled"
            ? countOf(departmentsRes.value.data)
            : 0,

        courses:
          coursesRes.status === "fulfilled"
            ? countOf(coursesRes.value.data)
            : 0,

        instructors:
          instructorsRes.status === "fulfilled"
            ? countOf(instructorsRes.value.data)
            : 0,

        registrations:
          registrationsRes.status === "fulfilled"
            ? countOf(registrationsRes.value.data)
            : 0,

        grades:
          gradesRes.status === "fulfilled"
            ? countOf(gradesRes.value.data)
            : 0
      });

      if (allDepartmentsRes.status === "fulfilled") {
        const response = allDepartmentsRes.value.data;

        const depts = listOf(
          response,
          "departments"
        );

        setByDepartment(
          depts.map((d) => ({
            name:
              d.department_code ||
              d.code ||
              d.department_name ||
              d.name ||
              "Unknown",

            students:
              Number(
                d.student_count ??
                  d.students_count ??
                  d.total_students ??
                  0
              ),

            courses:
              Number(
                d.course_count ??
                  d.courses_count ??
                  d.total_courses ??
                  0
              )
          }))
        );
      }

      if (allGradesRes.status === "fulfilled") {
        const response = allGradesRes.value.data;

        const grades = listOf(
          response,
          "grades"
        );

        const tally = {};

        grades.forEach((g) => {
          const key = g.grade || "N/A";

          tally[key] =
            (tally[key] || 0) + 1;
        });

        setGradeDistribution(
          Object.entries(tally).map(
            ([grade, value]) => ({
              name: grade,
              value
            })
          )
        );
      }

      setIsLoading(false);
    });

    return () => {
      isCurrent = false;
    };
  }, []);

  return (
    <DashboardLayout>

      {/* Welcome */}

      <div className="mb-6">

        <p className="text-sm text-muted">
          Welcome back,
        </p>

        <h1 className="font-display text-2xl text-navy-800">
          {user?.first_name
            ? `${user.first_name} ${user.last_name || ""}`
            : "Registrar"}
        </h1>

      </div>

      {/* Summary Cards */}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4 mb-8">

        {isLoading || !summary ? (

          Array.from({ length: 6 }).map(
            (_, i) => (
              <CardSkeleton key={i} />
            )
          )

        ) : (

          SUMMARY_CONFIG.map((item) => (

            <Card
              key={item.key}
              className="p-5 cursor-pointer hover:shadow-md transition"
              onClick={() => navigate(item.path)}
            >

              <div
                className={`h-10 w-10 rounded-lg flex items-center justify-center mb-3 ${item.tone}`}
              >
                <item.icon size={18} />
              </div>

              <p className="font-mono text-2xl text-navy-800">
                {summary[item.key] ?? 0}
              </p>

              <p className="text-xs text-muted mt-1">
                {item.label}
              </p>

            </Card>

          ))

        )}

      </div>

      {/* Charts */}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">

        {/* Department Chart */}

        <Card className="p-5 lg:col-span-2">

          <p className="font-display text-base text-navy-800 mb-1">
            Students &amp; Courses by Department
          </p>

          <p className="text-xs text-muted mb-4">
            Distribution across the institution's academic units
          </p>

          <div className="h-64">

            {byDepartment.length === 0 ? (

              <div className="h-full flex items-center justify-center text-sm text-muted">
                No department data yet.
              </div>

            ) : (

              <ResponsiveContainer
                width="100%"
                height="100%"
              >

                <BarChart data={byDepartment}>

                  <CartesianGrid
                    strokeDasharray="3 3"
                    stroke="#E3E7EF"
                    vertical={false}
                  />

                  <XAxis
                    dataKey="name"
                    tick={{
                      fontSize: 12,
                      fill: "#64748B"
                    }}
                    axisLine={false}
                    tickLine={false}
                  />

                  <YAxis
                    tick={{
                      fontSize: 12,
                      fill: "#64748B"
                    }}
                    axisLine={false}
                    tickLine={false}
                  />

                  <Tooltip
                    contentStyle={{
                      borderRadius: 10,
                      border: "1px solid #E3E7EF",
                      fontSize: 12
                    }}
                  />

                  <Bar
                    dataKey="students"
                    name="Students"
                    fill="#1F3A5F"
                    radius={[4, 4, 0, 0]}
                  />

                  <Bar
                    dataKey="courses"
                    name="Courses"
                    fill="#C89B3C"
                    radius={[4, 4, 0, 0]}
                  />

                </BarChart>

              </ResponsiveContainer>

            )}

          </div>

        </Card>

        {/* Grade Chart */}

        <Card className="p-5">

          <p className="font-display text-base text-navy-800 mb-1">
            Grade Distribution
          </p>

          <p className="text-xs text-muted mb-4">
            Across all recorded grades
          </p>

          <div className="h-64">

            {gradeDistribution.length === 0 ? (

              <div className="h-full flex items-center justify-center text-sm text-muted">
                No grades recorded yet.
              </div>

            ) : (

              <ResponsiveContainer
                width="100%"
                height="100%"
              >

                <PieChart>

                  <Pie
                    data={gradeDistribution}
                    dataKey="value"
                    nameKey="name"
                    innerRadius={45}
                    outerRadius={75}
                    paddingAngle={2}
                  >

                    {gradeDistribution.map(
                      (_, idx) => (
                        <Cell
                          key={idx}
                          fill={
                            CHART_COLORS[
                              idx %
                                CHART_COLORS.length
                            ]
                          }
                        />
                      )
                    )}

                  </Pie>

                  <Legend
                    wrapperStyle={{
                      fontSize: 12
                    }}
                  />

                  <Tooltip
                    contentStyle={{
                      borderRadius: 10,
                      border: "1px solid #E3E7EF",
                      fontSize: 12
                    }}
                  />

                </PieChart>

              </ResponsiveContainer>

            )}

          </div>

        </Card>

      </div>

    </DashboardLayout>
  );
}

