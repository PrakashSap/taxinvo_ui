// src/components/Sales/AddSaleModal.jsx
import React, { useEffect, useState } from 'react';
import { XMarkIcon, CheckIcon, PlusCircleIcon, TrashIcon } from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';
import api from '../../api/apiClient';
import {createSale, updateSale} from "./SaleService";


const genRef = () => {
    const d = new Date();
    return `INV-${d.getFullYear()}/${String(d.getMonth() + 1).padStart(2, '0')}/${Date.now()}`;
};
const toNum = (v) => (v === '' || v === null || v === undefined ? 0 : Number(v));

const AddSaleModal = ({ isOpen, onClose, onSuccess, editingSale = null, onPreview }) => {
    const [form, setForm] = useState({
        saleId: null,
        partyId: '',
        shopId: 1,
        paymentMethod: 'Cash',
        referenceNo: genRef(),
        lineItems: [
            {
                productId: '',
                stockId: '',
                saleQuantity: 0,
                unitSellingPrice: 0,
                discountAmount: 0,
                gstRate: 0,
                taxableValue: 0,
                gstAmount: 0,
                cgst: 0,
                sgst: 0,
                lineTotal: 0,
            },
        ],
        roundOff: 0,
    });

    const [products, setProducts] = useState([]);
    const [stocks, setStocks] = useState([]); // available stock batches
    const [parties, setParties] = useState([]);
    const [saving, setSaving] = useState(false);

    // load selects and set editing data
    useEffect(() => {
        if (!isOpen) return;
        Promise.all([api.get('/products'), api.get('/stocks'), api.get('/parties')])
            .then(([prod, st, pty]) => {
                setProducts(prod || []);
                setStocks(st || []);
                setParties(pty || []);

                if (editingSale) {
                    // map backend sale -> form
                    const mapped = {
                        saleId: editingSale.saleId,
                        partyId: editingSale.party?.id ?? editingSale.partyId ?? '',
                        shopId: editingSale.shop?.id ?? 1,
                        paymentMethod: editingSale.paymentMethod ?? 'Cash',
                        referenceNo: editingSale.referenceNo ?? genRef(),
                        lineItems:
                            (editingSale.lineItems || editingSale.items || []).map((li) => {
                                const productId =
                                    li.product?.productId ?? li.productId ?? (li.stock?.product?.productId ?? '');
                                const unit =
                                    toNum(li.unitSellingPrice) ||
                                    toNum(li.unitPrice) ||
                                    toNum(li.stock?.sellingPrice) ||
                                    toNum(li.product?.sellingPrice);
                                const qtyRaw = li.saleQuantity ?? li.saleQty ?? 0;
                                const qty = Math.abs(Number(qtyRaw)); // use absolute value and coerce to number
                                const discount = toNum(li.discountAmount);
                                const gstRate = toNum(li.gstRate ?? li.stock?.product?.gstRate ?? li.product?.gstRate);
                                const taxable = Math.max(0, qty * unit - discount);
                                const gst = taxable * (gstRate / 100);
                                const cgst = gst / 2;
                                const sgst = gst / 2;
                                return {
                                    productId,
                                    stockId: li.stock?.stockId ?? li.stockId ?? '',
                                    saleQuantity: qty,
                                    unitSellingPrice: unit,
                                    discountAmount: discount,
                                    gstRate,
                                    taxableValue: taxable,
                                    gstAmount: gst,
                                    cgst,
                                    sgst,
                                    lineTotal: taxable + gst,
                                };
                            }) || [],
                        roundOff: toNum(editingSale.roundOff || 0),
                    };
                    setForm(mapped);
                } else {
                    setForm((f) => ({ ...f, referenceNo: genRef() }));
                }
            })
            .catch((e) => {
                console.error('load selects', e);
                toast.error('Failed to load products / stocks / parties');
            });
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isOpen, editingSale]);

    // helper to recalc a line item
    const recalcLine = (li) => {
        const qty = toNum(li.saleQuantity);
        const unit = toNum(li.unitSellingPrice);
        const discount = toNum(li.discountAmount);
        const gstRate = toNum(li.gstRate);
        const taxable = Math.max(0, qty * unit - discount);
        const gst = taxable * (gstRate / 100);
        const cgst = gst / 2;
        const sgst = gst / 2;
        const lineTotal = taxable + gst;
        return { ...li, taxableValue: taxable, gstAmount: gst, cgst, sgst, lineTotal };
    };

    // update line fields and auto-calc
    const updateLine = (i, key, value) => {
        setForm((prev) => {
            const copy = [...prev.lineItems];
            copy[i] = { ...copy[i], [key]: value };

            // if stockId changed, populate price/gst from stocks list
            if (key === 'stockId') {
                const s = stocks.find((x) => Number(x.stockId) === Number(value));
                if (s) {
                    copy[i].unitSellingPrice = toNum(s.sellingPrice ?? s.sellingPrice ?? s.sellingPrice);
                    copy[i].gstRate = toNum(s.product?.gstRate ?? copy[i].gstRate);
                    copy[i].productId = s.product?.productId ?? copy[i].productId;
                }
            }

            // if productId changed and no stock chosen, attempt to fill from products
            if (key === 'productId' && !copy[i].stockId) {
                const p = products.find((x) => Number(x.productId) === Number(value));
                if (p) {
                    copy[i].unitSellingPrice = toNum(p.sellingPrice ?? p.purchasePrice);
                    copy[i].gstRate = toNum(p.gstRate ?? copy[i].gstRate);
                }
            }

            // recalc
            copy[i] = recalcLine(copy[i]);
            return { ...prev, lineItems: copy };
        });
    };

    const addLine = () =>
        setForm((f) => ({
            ...f,
            lineItems: [
                ...f.lineItems,
                {
                    productId: '',
                    stockId: '',
                    saleQuantity: 0,
                    unitSellingPrice: 0,
                    discountAmount: 0,
                    gstRate: 0,
                    taxableValue: 0,
                    gstAmount: 0,
                    cgst: 0,
                    sgst: 0,
                    lineTotal: 0,
                },
            ],
        }));

    const removeLine = (idx) =>
        setForm((f) => ({ ...f, lineItems: f.lineItems.filter((_, i) => i !== idx) }));

    const computeTotals = () => {
        const subtotalTaxable = form.lineItems.reduce((s, li) => s + toNum(li.taxableValue), 0);
        const subtotalGst = form.lineItems.reduce((s, li) => s + toNum(li.gstAmount), 0);
        const rawTotal = subtotalTaxable + subtotalGst;
        const rounded = Math.round(rawTotal); // nearest rupee
        const roundOff = Number((rounded - rawTotal).toFixed(2));
        const grandTotal = Number((rawTotal + roundOff).toFixed(2));
        return { subtotalTaxable, subtotalGst, rawTotal, roundOff, grandTotal };
    };

    const handlePreview = () => {
        const totals = computeTotals();
        const invoiceForPreview = {
            ...form,
            totals,
            partyName: parties.find((p) => Number(p.id) === Number(form.partyId))?.name ?? '',
        };
        onPreview && onPreview(invoiceForPreview);
    };

    const handleSubmit = async (e) => {
        e && e.preventDefault();
        // validation
        if (!form.partyId) return toast.error('Select customer');
        if (!form.lineItems.length) return toast.error('Add at least one line');
        for (const li of form.lineItems) {
            if (!li.productId) return toast.error('Select product in each line');
            if (toNum(li.saleQuantity) <= 0) return toast.error('Qty must be > 0');
        }

        const payload = {
            partyId: Number(form.partyId),
            shopId: Number(form.shopId),
            paymentMethod: form.paymentMethod,
            referenceNo: form.referenceNo,
            lineItems: form.lineItems.map((li) => ({
                productId: Number(li.productId),
                stockId: li.stockId ? Number(li.stockId) : undefined,
                saleQuantity: Number(li.saleQuantity),
                discountAmount: Number(li.discountAmount || 0),
                unitSellingPrice: Number(li.unitSellingPrice || 0),
                gstRate: Number(li.gstRate || 0),
                taxableValue: Number(li.taxableValue || 0),
                gstValue: Number(li.gstAmount || 0),
            })),
            roundOff: computeTotals().roundOff,
        };

        try {
            setSaving(true);
            if (form.saleId) {
                const updatePayload = {
                    transactionType: "Invoice", // or set from UI if you allow changing it
                    referenceNo: form.referenceNo,
                    paymentMethod: form.paymentMethod
                };
                await updateSale(form.saleId, updatePayload);
                toast.success(`Invoice ${form.referenceNo} updated`);
            } else {
                // Create new invoice (array of lineItems) as before
                await createSale(payload);
                toast.success(`Invoice ${form.referenceNo} created`);
            }
            onSuccess && onSuccess();
        } catch (err) {
            console.error('save sale', err);
            toast.error(typeof err === 'string' ? err : 'Failed to save invoice');
        } finally {
            setSaving(false);
        }
    };

    if (!isOpen) return null;

    const totals = computeTotals();

    return (
        <div className="fixed inset-0 z-50 overflow-hidden">
            <div className="absolute inset-0 bg-gray-900/60" onClick={onClose} />
            <section className="absolute inset-y-0 right-0 max-w-full flex">
                <div className="w-screen max-w-3xl bg-white shadow-2xl flex flex-col">
                    <div className="flex justify-between items-center px-6 py-4 bg-indigo-50 border-b">
                        <h2 className="text-lg font-bold">{form.saleId ? 'Edit Sale Invoice' : 'New Sale Invoice'}</h2>
                        <button onClick={onClose} className="text-gray-600 hover:text-gray-900">
                            <XMarkIcon className="w-6 h-6" />
                        </button>
                    </div>

                    <form onSubmit={handleSubmit} className="p-6 space-y-6 overflow-y-auto">
                        {/* Header */}
                        <div className="grid grid-cols-3 gap-4">
                            <div>
                                <label className="block text-sm font-medium">Reference</label>
                                <input readOnly value={form.referenceNo} className="mt-1 w-full border rounded p-2" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium">Payment</label>
                                <select value={form.paymentMethod} onChange={(e) => setForm({ ...form, paymentMethod: e.target.value })} className="mt-1 w-full border rounded p-2">
                                    <option>Cash</option>
                                    <option>Credit</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium">Customer (Party)</label>
                                <select value={form.partyId || ""} onChange={(e) => setForm({ ...form, partyId: e.target.value })} className="mt-1 w-full border rounded p-2">
                                    <option value="">-- select party --</option>
                                    {parties
                                        ?.filter(p => p.type === "Customer" || p.type === "SubDealer") // ✅ only valid types
                                        .map(p => (
                                            <option key={p.id} value={p.id}>
                                                {p.name}
                                    {/*{parties.map((p) => <option key={p.id} value={p.id}>{p.name}*/}
                                    </option>))}
                                </select>
                            </div>
                        </div>

                        {/* Line items */}
                        <div>
                            <div className="flex justify-between items-center mb-2">
                                <h3 className="font-semibold">Line Items</h3>
                                <button type="button" onClick={addLine} className="flex items-center text-indigo-600">
                                    <PlusCircleIcon className="w-5 h-5 mr-1" /> Add Item
                                </button>
                            </div>

                            {form.lineItems.map((li, idx) => (
                                <div key={idx} className="grid grid-cols-12 gap-2 items-center mb-3 p-2 border rounded">
                                    {/* stock select (shows batches with price) */}
                                    <div className="col-span-4">
                                        <select className="w-full border rounded p-2" value={li.stockId || ''} onChange={(e) => updateLine(idx, 'stockId', e.target.value)}>
                                            <option value="">-- Select stock/batch (or product) --</option>
                                            {stocks.map((s) => (
                                                <option key={s.stockId} value={s.stockId}>
                                                    {s.product?.name} — Batch:{s.batchNumber} — ₹ {(s.sellingPrice || s.purchasePrice || 0).toFixed(2)}
                                                </option>
                                            ))}
                                        </select>
                                    </div>

                                    {/* fallback product select */}
                                    <div className="col-span-2">
                                        <select className="w-full border rounded p-2" value={li.productId || ''} onChange={(e) => updateLine(idx, 'productId', e.target.value)}>
                                            <option value="">-- Product --</option>
                                            {products.map((p) => <option key={p.productId} value={p.productId}>{p.name}</option>)}
                                        </select>
                                    </div>

                                    <div className="col-span-1">
                                        <input type="number" min="0" className="w-full border rounded p-2" value={li.saleQuantity} onChange={(e) => updateLine(idx, 'saleQuantity', e.target.value)} placeholder="Qty" />
                                    </div>

                                    <div className="col-span-2">
                                        <input type="number" min="0" step="0.01" className="w-full border rounded p-2" value={li.unitSellingPrice} onChange={(e) => updateLine(idx, 'unitSellingPrice', e.target.value)} placeholder="Unit Price" />
                                    </div>

                                    <div className="col-span-1">
                                        <input type="number" min="0" step="0.01" className="w-full border rounded p-2" value={li.discountAmount} onChange={(e) => updateLine(idx, 'discountAmount', e.target.value)} placeholder="Discount" />
                                    </div>

                                    <div className="col-span-1 text-xs text-right">
                                        <div>Tax ₹{toNum(li.taxableValue).toFixed(2)}</div>
                                        <div>GST ₹{toNum(li.gstAmount).toFixed(2)}</div>
                                        <div className="font-semibold text-indigo-700">Tot ₹{toNum(li.lineTotal).toFixed(2)}</div>
                                    </div>

                                    <div className="col-span-1 text-right">
                                        <button type="button" onClick={() => removeLine(idx)} className="text-red-600"><TrashIcon className="w-5 h-5" /></button>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* totals */}
                        <div className="bg-gray-50 p-4 rounded flex justify-between items-center">
                            <div>
                                <div className="text-sm text-gray-600">Taxable: ₹ {totals.subtotalTaxable.toFixed(2)}</div>
                                <div className="text-sm text-gray-600">GST: ₹ {totals.subtotalGst.toFixed(2)}</div>
                                <div className="text-sm text-gray-600">Raw Total: ₹ {totals.rawTotal.toFixed(2)}</div>
                                <div className="text-sm text-gray-600">Round Off: ₹ {totals.roundOff.toFixed(2)}</div>
                                <div className="text-lg font-bold text-indigo-700">Grand: ₹ {totals.grandTotal.toFixed(2)}</div>
                            </div>

                            <div className="space-x-2">
                                <button type="button" onClick={handlePreview} className="px-3 py-1 border rounded">Preview Invoice</button>
                                <button type="button" onClick={handleSubmit} disabled={saving} className="px-4 py-2 bg-indigo-600 text-white rounded">
                                    {saving ? 'Saving...' : form.saleId ? 'Update & Close' : 'Save & Close'}
                                </button>
                            </div>
                        </div>
                    </form>
                </div>
            </section>
        </div>
    );
};

export default AddSaleModal;
