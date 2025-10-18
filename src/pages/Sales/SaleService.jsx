// src/services/saleService.js


import api from "../../api/apiClient";

export const createSale = (payload) => api.post('/sales', payload);
export const updateSale = (saleId, payload) => api.put(`/sales/${saleId}`, payload);
export const listSales = () => api.get('/sales');
export const getSaleInvoiceByRef = (referenceNo) =>
    api.get(`/sales/invoice`, { params: { ref: referenceNo } });
export const deleteSale = (saleId) => api.delete(`/sales/${saleId}`);
export const getSale = (saleId) => api.get(`/sales/${saleId}`);
