import React, {useCallback, useEffect, useState} from "react";
import {PlusCircleIcon, PencilIcon, TrashIcon, MagnifyingGlassIcon} from "@heroicons/react/24/outline";
import toast from "react-hot-toast";
import {
    getParties,
    createParty,
    updateParty,
    deleteParty,} from "./partyService";
import Modal from "../../components/Modal";
import PartyModal from "../../components/PartyModal";

const emptyCustomer = {
    name: "",
    type: "Customer",
    contact: "",
    address: "",
    gstin: "",
};

export default function Parties() {
    const [customers, setCustomers] = useState([]);
    const [form, setForm] = useState(emptyCustomer);
    const [editing, setEditing] = useState(false);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [search, setSearch] = useState("");
    const [loading, setLoading] = useState(false);

    const loadCustomers = useCallback(async () => {
        setLoading(true);
        try {
            const data = await getParties();
            const filtered = data.filter((p) =>
                (p.type=== "Customer") &&
                (p.name || "").toLowerCase().includes(search.toLowerCase())
            );
            setCustomers(filtered);
        } catch {
            toast.error("Failed to load customers");
        } finally {
            setLoading(false);
        }
    },[search]);

    useEffect(() => {
        loadCustomers();
    }, [loadCustomers]);

    const handleChange = (e) =>
        setForm({ ...form, [e.target.name]: e.target.value });

    const handleSave = async (e) => {
        e.preventDefault();
        try {
            if (editing) {
                await updateParty(form.id, form);
                toast.success("Customer updated");
            } else {
                await createParty(form);
                toast.success("Customer added");
            }
            setIsModalOpen(false);
            setEditing(false);
            setForm(emptyCustomer);
            loadCustomers();
        } catch {
            toast.error("Failed to save");
        }
    };

    const handleEdit = (customer) => {
        setForm(customer);
        setEditing(true);
        setIsModalOpen(true);
    };

    const handleDelete = async (id) => {
        if (!window.confirm("Delete this customer?")) return;
        try {
            await deleteParty(id);
            toast.success("Customer deleted");
            loadCustomers();
        } catch {
            toast.error("Delete failed");
        }
    };

    return (
        <div className="p-4 sm:p-6 bg-gray-50 min-h-screen">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3 mb-6">
                <h1 className="text-3xl font-bold text-gray-800 mb-4 sm:mb-0">Customers</h1>
            </div>
            {/* Search Bar */}
            <div className="mb-4 flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3">
                <div className="relative w-full sm:w-80">
                    <input
                        type="text"
                        placeholder="Search Customer..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="pl-10 pr-4 py-2 border rounded-md w-full focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                    />
                    <MagnifyingGlassIcon className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
                </div>
                <button
                    onClick={() => {
                        setForm(emptyCustomer);
                        setEditing(false);
                        setIsModalOpen(true);
                    }}
                    className="flex items-center px-4 py-2 bg-indigo-600 text-white rounded shadow hover:bg-indigo-700 transition"
                >
                    <PlusCircleIcon className="w-5 h-5 mr-2" /> Add Customer
                </button>
            </div>

            {/* List */}
            <div className="bg-white rounded shadow overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-100">
                    <tr>
                        {["#", "Name", "Contact", "Address", "GSTIN", "Actions"].map((h) => (
                            <th
                                key={h}
                                className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase"
                            >
                                {h}
                            </th>
                        ))}
                    </tr>
                    </thead>
                    <tbody>
                    {customers.length ? (
                        customers.map((c, i) => (
                            <tr key={c.id} className="hover:bg-indigo-50/50">
                                <td className="px-6 py-3 text-sm">{i + 1}</td>
                                <td className="px-6 py-3 text-sm">{c.name}</td>
                                <td className="px-6 py-3 text-sm">{c.contact}</td>
                                <td className="px-6 py-3 text-sm">{c.address}</td>
                                <td className="px-6 py-3 text-sm">{c.gstin}</td>
                                <td className="px-6 py-3 flex gap-2">
                                    <button
                                        onClick={() => handleEdit(c)}
                                        className="text-blue-600 hover:text-blue-800"
                                    >
                                        <PencilIcon className="w-5 h-5" />
                                    </button>
                                    <button
                                        onClick={() => handleDelete(c.id)}
                                        className="text-red-600 hover:text-red-800"
                                    >
                                        <TrashIcon className="w-5 h-5" />
                                    </button>
                                </td>
                            </tr>
                        ))
                    ) : (
                        <tr>
                            <td
                                colSpan="6"
                                className="text-center py-6 text-gray-500"
                            >
                                No customers found
                            </td>
                        </tr>
                    )}
                    </tbody>
                </table>
            </div>

            {/* Shared modal */}
            <PartyModal
                open={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                form={form}
                onChange={handleChange}
                onSave={handleSave}
                editing={editing}
            />
        </div>
    );
}
