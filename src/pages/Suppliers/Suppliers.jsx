import React, {useCallback, useEffect, useState} from "react";
import {PlusCircleIcon, PencilIcon, TrashIcon, MagnifyingGlassIcon} from "@heroicons/react/24/outline";
import toast from "react-hot-toast";
import {
    getParties,
    createParty,
    updateParty,
    deleteParty,
} from "../Customers/partyService";
import SupplierModal from "../../components/SupplierModal";

const emptySupplier = {
    name: "",
    type: "Supplier",
    contact: "",
    address: "",
    gstin: "",
    creditLimit: "",
    paymentTerms: "",
};

export default function Suppliers() {
    const [suppliers, setSuppliers] = useState([]);
    const [form, setForm] = useState(emptySupplier);
    const [editing, setEditing] = useState(false);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [search, setSearch] = useState("");
    const [loading, setLoading] = useState(false);

    const loadSuppliers = useCallback( async () => {
        try {
            const data = await getParties();
            const filtered = data.filter((p) =>
                (p.type=== "Supplier") &&
                (p.name || "").toLowerCase().includes(search.toLowerCase())
            );
            setSuppliers(filtered);
        } catch {
            toast.error("Failed to load suppliers");
        } finally {
            setLoading(false);
        }
    },[search]);

    useEffect(() => {
        loadSuppliers();
    }, [loadSuppliers]);

    const handleChange = (e) =>
        setForm({ ...form, [e.target.name]: e.target.value });

    const handleSave = async (e) => {
        e.preventDefault();
        const payload = {
            name: form.name,
            type: "Supplier",
            contact: form.contact,
            address: form.address,
            gstin: form.gstin,
            creditLimit: form.creditLimit ? Number(form.creditLimit) : null,
            paymentTerms: form.paymentTerms || null,
        };

        try {
            if (editing) {
                await updateParty(form.id, payload);
                toast.success("Supplier updated");
            } else {
                await createParty(payload);
                toast.success("Supplier added");
            }
            setIsModalOpen(false);
            setEditing(false);
            setForm(emptySupplier);
            loadSuppliers();
        } catch {
            toast.error("Failed to save supplier");
        }
    };

    const handleEdit = (supplier) => {
        setForm(supplier);
        setEditing(true);
        setIsModalOpen(true);
    };

    const handleDelete = async (id) => {
        if (!window.confirm("Delete this supplier?")) return;
        try {
            await deleteParty(id);
            toast.success("Supplier deleted");
            loadSuppliers();
        } catch {
            toast.error("Delete failed");
        }
    };

    return (
        <div className="p-6 bg-gray-50 min-h-screen">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6">
                <h1 className="text-3xl font-bold text-gray-800 mb-4 sm:mb-0">Suppliers</h1>
            </div>
            {/* Search Bar */}
            <div className="mb-4 flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3">
                <div className="relative w-full sm:w-80">
                    <input
                        type="text"
                        placeholder="Search Suppliers..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="pl-10 pr-4 py-2 border rounded-md w-full focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                    />
                    <MagnifyingGlassIcon className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
                </div>
                <button
                    onClick={() => {
                        setForm(emptySupplier);
                        setEditing(false);
                        setIsModalOpen(true);
                    }}
                    className="flex items-center px-4 py-2 bg-indigo-600 text-white rounded shadow hover:bg-indigo-700 transition w-full sm:w-auto">
                    <PlusCircleIcon className="w-5 h-5 mr-2" /> Add Supplier
                </button>
            </div>

            {/* Table */}
            <div className="bg-white rounded shadow overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-100">
                    <tr>
                        {[
                            "#",
                            "Name",
                            "Contact",
                            "Address",
                            "GSTIN",
                            "Credit Limit",
                            "Payment Terms",
                            "Actions",
                        ].map((h) => (
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
                    {suppliers.length ? (
                        suppliers.map((s, i) => (
                            <tr key={s.id} className="hover:bg-indigo-50/50">
                                <td className="px-6 py-3 text-sm">{i + 1}</td>
                                <td className="px-6 py-3 text-sm">{s.name}</td>
                                <td className="px-6 py-3 text-sm">{s.contact}</td>
                                <td className="px-6 py-3 text-sm">{s.address}</td>
                                <td className="px-6 py-3 text-sm">{s.gstin}</td>
                                <td className="px-6 py-3 text-sm">{s.creditLimit ?? "-"}</td>
                                <td className="px-6 py-3 text-sm">{s.paymentTerms ?? "-"}</td>
                                <td className="px-6 py-3 flex gap-2">
                                    <button
                                        onClick={() => handleEdit(s)}
                                        className="text-blue-600 hover:text-blue-800"
                                    >
                                        <PencilIcon className="w-5 h-5" />
                                    </button>
                                    <button
                                        onClick={() => handleDelete(s.id)}
                                        className="text-red-600 hover:text-red-800"
                                    >
                                        <TrashIcon className="w-5 h-5" />
                                    </button>
                                </td>
                            </tr>
                        ))
                    ) : (
                        <tr>
                            <td colSpan="8" className="text-center py-6 text-gray-500">
                                No suppliers found
                            </td>
                        </tr>
                    )}
                    </tbody>
                </table>
            </div>

            {/* Shared Modal */}
            <SupplierModal
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
