// src/services/PurchaseService.jsx

import api from "../../api/apiClient";
// Adjust the path to apiClient as needed. If SaleService path is correct, this one is too.

// Function to fetch the purchase invoice details by reference number
export const getPurchaseInvoiceByRef = (referenceNo) =>
    api.get(`/stocks/${referenceNo}`);

// You would add other purchase-related service calls here later (e.g., listPurchases)
// export const listPurchases = () => api.get('/purchases');