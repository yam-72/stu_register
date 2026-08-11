import api from "./axios";

export const registrationApi = {
  getAll: (params) => api.get("/registrations", { params }),
  getByStudent: (studentId) => api.get(`/registrations/student/${studentId}`),
  create: (payload) => api.post("/registrations", payload),
  remove: (id) => api.delete(`/registrations/${id}`)
};
