import React, { useEffect, useState } from "react";
import {
    PlusCircleIcon,
    PencilIcon,
    TrashIcon,
    XMarkIcon,
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
    // sellingPrice: "",
    // purchasePrice: "",
    isEligibleForItc: false,
    reorderLevel: "",
};

export default function Products() {
    const [products, setProducts] = useState([]);
    const [suppliers, setSuppliers] = useState([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isSupplierModalOpen, setIsSupplierModalOpen] = useState(false); // 👈 new
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

    useEffect(() => {
        loadProducts();
        loadSuppliers();
    }, []);

    const loadProducts = async () => {
        try {
            const data = await getProducts();
            setProducts(data);
        } catch {
            toast.error("Failed to load products");
        }
    };

    const loadSuppliers = async () => {
        try {
            const parties = await getParties();
            setSuppliers(parties.filter((p) => p.type === "Supplier"));
        } catch {
            toast.error("Failed to load suppliers");
        }
    };

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
            // sellingPrice: Number(form.sellingPrice),
            // purchasePrice: Number(form.purchasePrice),
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
            toast.error(typeof err === "string" ? err : "Failed to save product");
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
            // sellingPrice: p.sellingPrice,
            // purchasePrice: p.purchasePrice,
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
            loadSuppliers(); // refresh dropdown
        } catch {
            toast.error("Failed to add supplier");
        }
    };

    return (
        <div className="p-6 bg-gray-50 min-h-screen">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-3xl font-bold text-gray-800">Products</h1>
                <button
                    onClick={() => {
                        setForm(emptyForm);
                        setEditing(false);
                        setIsModalOpen(true);
                    }}
                    className="flex items-center px-4 py-2 bg-indigo-600 text-white rounded shadow hover:bg-indigo-700 transition"
                >
                    <PlusCircleIcon className="w-5 h-5 mr-2" /> Add Product
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
                            "Supplier",
                            "GST%",
                            "UOM",
                            // "Sell ₹",
                            // "Buy ₹",
                            "ITC",
                            "Reorder",
                            "Action",
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
                    {products.length ? (
                        products.map((p, i) => (
                            <tr key={p.productId} className="hover:bg-indigo-50/50">
                                <td className="px-6 py-3 text-sm">{i + 1}</td>
                                <td className="px-6 py-3 text-sm">{p.name}</td>
                                <td className="px-6 py-3 text-sm">
                                    {p.supplier?.name || "-"}
                                </td>
                                <td className="px-6 py-3 text-sm">{p.gstRate}</td>
                                <td className="px-6 py-3 text-sm">{p.uom}</td>
                                {/*<td className="px-6 py-3 text-sm">{p.sellingPrice}</td>*/}
                                {/*<td className="px-6 py-3 text-sm">{p.purchasePrice}</td>*/}
                                <td className="px-6 py-3 text-sm">
                                    {p.isEligibleForItc ? "✅" : "❌"}
                                </td>
                                <td className="px-6 py-3 text-sm">{p.reorderLevel}</td>
                                <td className="px-6 py-3 flex gap-2">
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
                                    <label className="block text-sm font-medium mb-1">
                                        Supplier
                                    </label>
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
                                            onClick={() => setIsSupplierModalOpen(true)} // 👈 open inline modal
                                            className="bg-green-600 text-white px-3 rounded hover:bg-green-700"
                                            title="Add New Supplier"
                                        >
                                            +
                                        </button>
                                    </div>
                                </div>

                                {/* Rest of fields */}
                                {[
                                    ["name", "Product Name"],
                                    ["hsnSac", "HSN/SAC"],
                                    ["gstRate", "GST Rate %"],
                                    ["uom", "Unit of Measure"],
                                    // ["sellingPrice", "Selling Price ₹"],
                                    // ["purchasePrice", "Purchase Price ₹"],
                                    ["reorderLevel", "Reorder Level"],
                                ].map(([key, label]) => (
                                    <div key={key}>
                                        <label className="block text-sm font-medium mb-1">
                                            {label}
                                        </label>
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

            {/* Inline Supplier Modal */}
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
    );
}
