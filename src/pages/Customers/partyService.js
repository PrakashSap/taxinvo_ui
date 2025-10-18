import api from "../../api/apiClient";

export const getParties = () => api.get("/parties");

export const getPartyById = (id) => api.get(`/parties/${id}`);

export const createParty = (party) => api.post("/parties", party);

export const updateParty = (id, party) => api.put(`/parties/${id}`, party);

export const deleteParty = (id) => api.delete(`/parties/${id}`);

export const getCreditByPartyId = (partyId) =>
    api.get(`/credit/party/${partyId}`);

export const recordPayment = (partyId, payload) =>
    api.post(`/credit/payment/${partyId}`, payload);

// ✅ Fetch all credit records
export const getAllCredits = () => api.get("/credit");


// ✅ Fetch credit history for a given party
export const getCreditHistory = (partyId) => api.get(`/credit/history/${partyId}`);

// ✅ Fetch all customers (filtered from Parties)
export const getAllCustomers = () =>
    api.get("/parties", { params: { type: "Customer" } });
