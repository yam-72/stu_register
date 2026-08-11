import api from "./axios";

export const courseApi = {
  getAll: (params) => api.get("/courses", { params }),
  getOne: (id) => api.get(`/courses/${id}`),
  create: (payload) => api.post("/courses", payload),
  update: (id, payload) => api.put(`/courses/${id}`, payload),
  remove: (id) => api.delete(`/courses/${id}`)
};
