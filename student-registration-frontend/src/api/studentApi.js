import api from "./axios";

export const studentApi = {
  getAll: (params) => api.get("/students", { params }),
  getOne: (id) => api.get(`/students/${id}`),
  create: (payload) => api.post("/students", payload),
  update: (id, payload) => api.put(`/students/${id}`, payload),
  remove: (id) => api.delete(`/students/${id}`),
  uploadPhoto: (id, formData) =>
    api.post(`/students/${id}/photo`, formData, {
      headers: { "Content-Type": "multipart/form-data" }
    })
};
