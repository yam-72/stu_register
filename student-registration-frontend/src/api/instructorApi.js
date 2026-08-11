import api from "./axios";

export const instructorApi = {
  getAll: (params) => api.get("/instructors", { params }),
  getOne: (id) => api.get(`/instructors/${id}`),
  create: (payload) => api.post("/instructors", payload),
  update: (id, payload) => api.put(`/instructors/${id}`, payload),
  remove: (id) => api.delete(`/instructors/${id}`)
};
