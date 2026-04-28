import axios from 'axios';

const API = 'http://localhost:5000/api/admin';

const getHeaders = () => ({
  headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
});

// Stats
export const getAdminStats = () => axios.get(`${API}/stats`, getHeaders());

// Domains
export const getDomains = () => axios.get(`${API}/domains`, getHeaders());
export const addDomain = (data) => axios.post(`${API}/domains`, data, getHeaders());
export const deleteDomain = (id) => axios.delete(`${API}/domains/${id}`, getHeaders());

// Questions
export const getQuestions = (domainId) => {
  const params = domainId ? `?domainId=${domainId}` : '';
  return axios.get(`${API}/questions${params}`, getHeaders());
};
export const addQuestion = (data) => axios.post(`${API}/questions`, data, getHeaders());
export const updateQuestion = (id, data) => axios.put(`${API}/questions/${id}`, data, getHeaders());
export const deleteQuestion = (id) => axios.delete(`${API}/questions/${id}`, getHeaders());
