import React, { useEffect, useState, useCallback } from "react";
import {
    PlusCircleIcon,
    PencilIcon,
    TrashIcon,
    XMarkIcon,
    MagnifyingGlassIcon,
} from "@heroicons/react/24/outline";
import toast from "react-hot-toast";
import {
    getProducts,
    createProduct,
    updateProduct,
    deleteProduct,
} from "./productService";
import { getParties, createParty } from "../Customers/partyService";
import SupplierModal from "../../components/SupplierModal";

const emptyForm = {
    supplierId: "",
    name: "",
    hsnSac: "",
    gstRate: "",
    uom: "",
    isEligibleForItc: false,
    reorderLevel: "",
};

export default function Products() {
    const [products, setProducts] = useState([]);
    const [suppliers, setSuppliers] = useState([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isSupplierModalOpen, setIsSupplierModalOpen] = useState(false);
    const [form, setForm] = useState(emptyForm);
    const [supplierForm, setSupplierForm] = useState({
        name: "",
        type: "Supplier",
        contact: "",
        address: "",
        gstin: "",
        creditLimit: "",
        paymentTerms: "",
    });
    const [editing, setEditing] = useState(false);
    const [search, setSearch] = useState("");
    const [loading, setLoading] = useState(false);

    const loadProducts = useCallback(async () => {
        setLoading(true);
        try {
            const data = await getProducts();
            const filtered = data.filter((p) =>
                (p.name || "").toLowerCase().includes(search.toLowerCase())
            );
            setProducts(filtered);
        } catch {
            toast.error("Failed to load products");
        } finally {
            setLoading(false);
        }
    }, [search]);

    const loadSuppliers = async () => {
        try {
            const parties = await getParties();
            setSuppliers(parties.filter((p) => p.type === "Supplier"));
        } catch {
            toast.error("Failed to load suppliers");
        }
    };

    useEffect(() => {
        loadProducts();
        loadSuppliers();
    }, [loadProducts]);

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setForm({
            ...form,
            [name]: type === "checkbox" ? checked : value,
        });
    };

    const handleSave = async (e) => {
        e.preventDefault();

        const payload = {
            supplier: form.supplierId ? { id: Number(form.supplierId) } : null,
            name: form.name,
            hsnSac: form.hsnSac,
            gstRate: Number(form.gstRate),
            uom: form.uom,
            isEligibleForItc: Boolean(form.isEligibleForItc),
            reorderLevel: Number(form.reorderLevel || 0),
        };

        try {
            if (editing) {
                await updateProduct(form.productId, payload);
                toast.success("Product updated");
            } else {
                await createProduct(payload);
                toast.success("Product created");
            }
            setIsModalOpen(false);
            setForm(emptyForm);
            setEditing(false);
            loadProducts();
        } catch (err) {
            console.error("save product", err);
            toast.error("Failed to save product");
        }
    };

    const handleEdit = (p) => {
        setForm({
            productId: p.productId,
            supplierId: p.supplier?.id || "",
            name: p.name,
            hsnSac: p.hsnSac,
            gstRate: p.gstRate,
            uom: p.uom,
            isEligibleForItc: !!p.isEligibleForItc,
            reorderLevel: p.reorderLevel || "",
        });
        setEditing(true);
        setIsModalOpen(true);
    };

    const handleDelete = async (id) => {
        if (!window.confirm("Delete this product?")) return;
        try {
            await deleteProduct(id);
            toast.success("Product deleted");
            loadProducts();
        } catch {
            toast.error("Delete failed");
        }
    };

    const handleSupplierSave = async (e) => {
        e.preventDefault();
        try {
            await createParty(supplierForm);
            toast.success("Supplier added");
            setIsSupplierModalOpen(false);
            setSupplierForm({
                name: "",
                type: "Supplier",
                contact: "",
                address: "",
                gstin: "",
                creditLimit: "",
                paymentTerms: "",
            });
            loadSuppliers();
        } catch {
            toast.error("Failed to add supplier");
        }
    };

    if (loading)
        return <div className="p-6 text-center text-gray-500">Loading Products...</div>;

    return (
        <div className="p-6 bg-gray-50 min-h-screen">
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 space-y-4 md:space-y-0">
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-6 gap-3">
                <h1 className="text-3xl font-bold text-gray-800">Products</h1>
            </div>

            {/* Search Bar */}
            <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
            <div className="relative w-full sm:w-64">
                <MagnifyingGlassIcon className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2 pointer-events-none"/>
                <input
                    type="text"
                    placeholder="Search products..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border rounded-md focus:outline-none focus:ring focus:ring-indigo-200"
                />
            </div>
            <button
                onClick={() => {
                    setForm(emptyForm);
                    setEditing(false);
                    setIsModalOpen(true);
                }}
                className="flex items-center justify-center px-4 py-2 bg-indigo-600 text-white rounded-lg shadow hover:bg-indigo-700 transition w-full sm:w-auto">
                <PlusCircleIcon className="w-5 h-5" /> Add Product
            </button>
            </div>

            {/* Table */}
                <div className="bg-white rounded shadow overflow-hidden">
                <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200 text-sm">
                    <thead className="bg-gray-100">
                    <tr>
                        {["#", "Name", "Supplier", "GST%", "UOM", "ITC", "Reorder", "Action"].map(
                            (h) => (
                                <th
                                    key={h}
                                    className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase"
                                >
                                    {h}
                                </th>
                            )
                        )}
                    </tr>
                    </thead>
                    <tbody>
                    {products.length ? (
                        products.map((p, i) => (
                            <tr key={p.productId} className="hover:bg-indigo-50/50">
                                <td className="px-4 py-3">{i + 1}</td>
                                <td className="px-4 py-3">{p.name}</td>
                                <td className="px-4 py-3">{p.supplier?.name || "-"}</td>
                                <td className="px-4 py-3">{p.gstRate}</td>
                                <td className="px-4 py-3">{p.uom}</td>
                                <td className="px-4 py-3">{p.isEligibleForItc ? "✅" : "❌"}</td>
                                <td className="px-4 py-3">{p.reorderLevel}</td>
                                <td className="px-4 py-3 flex gap-2">
                                    <button
                                        onClick={() => handleEdit(p)}
                                        className="text-blue-600 hover:text-blue-800"
                                    >
                                        <PencilIcon className="w-5 h-5" />
                                    </button>
                                    <button
                                        onClick={() => handleDelete(p.productId)}
                                        className="text-red-600 hover:text-red-800"
                                    >
                                        <TrashIcon className="w-5 h-5" />
                                    </button>
                                </td>
                            </tr>
                        ))
                    ) : (
                        <tr>
                            <td colSpan="10" className="text-center py-6 text-gray-500">
                                No products found
                            </td>
                        </tr>
                    )}
                    </tbody>
                </table>
            </div>
            </div>

            {/* Product Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 z-50 overflow-hidden">
                    <div
                        className="absolute inset-0 bg-gray-900/60"
                        onClick={() => setIsModalOpen(false)}
                    />
                    <section className="absolute inset-y-0 right-0 max-w-full flex">
                        <div className="w-screen max-w-md bg-white shadow-2xl flex flex-col">
                            <div className="flex justify-between items-center px-6 py-4 bg-indigo-50 border-b">
                                <h2 className="text-lg font-bold">
                                    {editing ? "Edit Product" : "Add Product"}
                                </h2>
                                <button
                                    onClick={() => setIsModalOpen(false)}
                                    className="text-gray-600 hover:text-gray-900"
                                >
                                    <XMarkIcon className="w-6 h-6" />
                                </button>
                            </div>

                            <form onSubmit={handleSave} className="p-6 space-y-4 overflow-y-auto">
                                {/* Supplier Dropdown */}
                                <div>
                                    <label className="block text-sm font-medium mb-1">Supplier</label>
                                    <div className="flex gap-2">
                                        <select
                                            name="supplierId"
                                            value={form.supplierId}
                                            onChange={handleChange}
                                            className="w-full border rounded p-2"
                                            required
                                        >
                                            <option value="">-- Select Supplier --</option>
                                            {suppliers.map((s) => (
                                                <option key={s.id} value={s.id}>
                                                    {s.name}
                                                </option>
                                            ))}
                                        </select>
                                        <button
                                            type="button"
                                            onClick={() => setIsSupplierModalOpen(true)}
                                            className="bg-green-600 text-white px-3 rounded hover:bg-green-700"
                                            title="Add New Supplier"
                                        >
                                            +
                                        </button>
                                    </div>
                                </div>

                                {/* Fields */}
                                {[
                                    ["name", "Product Name"],
                                    ["hsnSac", "HSN/SAC"],
                                    ["gstRate", "GST Rate %"],
                                    ["uom", "Unit of Measure"],
                                    ["reorderLevel", "Reorder Level"],
                                ].map(([key, label]) => (
                                    <div key={key}>
                                        <label className="block text-sm font-medium mb-1">{label}</label>
                                        <input
                                            name={key}
                                            value={form[key]}
                                            onChange={handleChange}
                                            className="w-full border rounded p-2"
                                            required={["name"].includes(key)}
                                        />
                                    </div>
                                ))}

                                <div className="flex items-center gap-2">
                                    <input
                                        type="checkbox"
                                        name="isEligibleForItc"
                                        checked={form.isEligibleForItc}
                                        onChange={handleChange}
                                    />
                                    <label className="text-sm font-medium">Eligible for ITC</label>
                                </div>

                                <button
                                    type="submit"
                                    className="w-full bg-indigo-600 text-white rounded py-2 mt-2 hover:bg-indigo-700"
                                >
                                    {editing ? "Update Product" : "Save Product"}
                                </button>
                            </form>
                        </div>
                    </section>
                </div>
            )}

            {/* Supplier Modal */}
            <SupplierModal
                open={isSupplierModalOpen}
                onClose={() => setIsSupplierModalOpen(false)}
                form={supplierForm}
                onChange={(e) =>
                    setSupplierForm({ ...supplierForm, [e.target.name]: e.target.value })
                }
                onSave={handleSupplierSave}
                editing={false}
            />
        </div>
        </div>
    );
}
