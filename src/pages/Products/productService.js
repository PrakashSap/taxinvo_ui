import api from "../../api/apiClient";


export const getProducts = () => api.get("/products");

export const getProductById = (id) => api.get(`/products/${id}`);

export const createProduct = (product) => api.post("/products", product);

export const updateProduct = (id, product) => api.put(`/products/${id}`, product);

export const deleteProduct = (id) => api.delete(`/products/${id}`);
