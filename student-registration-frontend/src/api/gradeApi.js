
import api from "./axios";

export const gradeApi = {
  // Get all grades
  getAll: (params) =>
    api.get("/grades", { params }),

  // Get grades for one student
  getByStudent: (studentId) =>
    api.get(`/grades/student/${studentId}`),

  // Assign a grade
  // Backend route: POST /api/grades
  assign: (payload) =>
    api.post("/grades", payload),

  // Update a grade
  update: (id, payload) =>
    api.put(`/grades/${id}`, payload),

  // Calculate GPA
  getGpa: (studentId) =>
    api.get(`/grades/student/${studentId}/gpa`)
};
