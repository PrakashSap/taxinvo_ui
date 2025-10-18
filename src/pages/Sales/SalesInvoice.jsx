import React, { useState, useEffect } from "react";
import api from "../../api/apiClient";
import { createSaleInvoice, getSaleInvoice } from "../../services/saleService";

const SalesInvoice = () => {
    const [products, setProducts] = useState([]);
    const [parties, setParties] = useState([]);
    const [invoice, setInvoice] = useState({
        partyId: "",
        shopId: 1,
        paymentMethod: "Cash",
        referenceNo: `INV-${new Date().getFullYear()}/${new Date().getMonth() + 1}/${Date.now()}`,
        lineItems: [],
    });

    const [response, setResponse] = useState(null);

    useEffect(() => {
        const loadData = async () => {
            try {
                const [prodData, partyData] = await Promise.all([
                    api.get("/products"),
                    api.get("/parties"),
                ]);
                setProducts(prodData);
                setParties(partyData);
            } catch (err) {
                console.error("Failed to load dropdown data:", err);
            }
        };
        loadData();
    }, []);

    const handleAddItem = () => {
        setInvoice({
            ...invoice,
            lineItems: [...invoice.lineItems, { productId: "", saleQuantity: "", discountAmount: 0 }],
        });
    };

    const handleItemChange = (index, field, value) => {
        const updatedItems = [...invoice.lineItems];
        updatedItems[index][field] = value;
        setInvoice({ ...invoice, lineItems: updatedItems });
    };

    const handleSave = async () => {
        try {
            const result = await createSaleInvoice(invoice);
            setResponse(result);
            alert("Sale invoice created successfully!");
        } catch (err) {
            console.error("Error saving sale invoice:", err);
            alert("Failed to save invoice.");
        }
    };

    return (
        <div className="p-6">
            <h2 className="text-2xl font-bold mb-4">Create Sale Invoice</h2>

            {/* Party Selector */}
            <div className="mb-3">
                <label className="block font-medium mb-1">Select Customer:</label>
                <select
                    value={invoice.partyId}
                    onChange={(e) => setInvoice({ ...invoice, partyId: e.target.value })}
                    className="border rounded p-2 w-full"
                >
                    <option value="">-- Select Party --</option>
                    {parties.map((p) => (
                        <option key={p.id} value={p.id}>
                            {p.name}
                        </option>
                    ))}
                </select>
            </div>

            {/* Payment Method */}
            <div className="mb-3">
                <label className="block font-medium mb-1">Payment Method:</label>
                <select
                    value={invoice.paymentMethod}
                    onChange={(e) => setInvoice({ ...invoice, paymentMethod: e.target.value })}
                    className="border rounded p-2 w-full"
                >
                    <option value="Cash">Cash</option>
                    <option value="Credit">Credit</option>
                </select>
            </div>

            {/* Line Items */}
            <h3 className="font-semibold mb-2">Products</h3>
            {invoice.lineItems.map((item, i) => (
                <div key={i} className="grid grid-cols-4 gap-2 mb-2">
                    <select
                        value={item.productId}
                        onChange={(e) => handleItemChange(i, "productId", e.target.value)}
                        className="border p-2 rounded"
                    >
                        <option value="">-- Select Product --</option>
                        {products.map((p) => (
                            <option key={p.productId} value={p.productId}>
                                {p.name}
                            </option>
                        ))}
                    </select>
                    <input
                        type="number"
                        value={item.saleQuantity}
                        onChange={(e) => handleItemChange(i, "saleQuantity", e.target.value)}
                        className="border p-2 rounded"
                        placeholder="Quantity"
                    />
                    <input
                        type="number"
                        value={item.discountAmount}
                        onChange={(e) => handleItemChange(i, "discountAmount", e.target.value)}
                        className="border p-2 rounded"
                        placeholder="Discount"
                    />
                </div>
            ))}
            <button onClick={handleAddItem} className="bg-gray-200 px-3 py-1 rounded mb-3">
                + Add Item
            </button>

            {/* Save */}
            <button
                onClick={handleSave}
                className="bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-700"
            >
                Save Invoice
            </button>

            {/* Response */}
            {response && (
                <div className="mt-6 bg-gray-50 border p-4 rounded">
                    <h3 className="font-semibold mb-2">Generated Invoice</h3>
                    <pre className="text-xs">{JSON.stringify(response, null, 2)}</pre>
                </div>
            )}
        </div>
    );
};

export default SalesInvoice;
