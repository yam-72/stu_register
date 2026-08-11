import api from "./axios";

export const departmentApi = {
  getAll: (params) => api.get("/departments", { params }),
  getOne: (id) => api.get(`/departments/${id}`),
  create: (payload) => api.post("/departments", payload),
  update: (id, payload) => api.put(`/departments/${id}`, payload),
  remove: (id) => api.delete(`/departments/${id}`)
};
