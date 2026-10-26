import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import {
  CircleCheck,
  Clock3,
  Eye,
  Info,
  MoreHorizontal,
  Pencil,
  Plus,
  RotateCcw,
  Search,
  Trash2,
  X,
} from "lucide-react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";

const transactions = [
  {
    id: "#04910",
    customer: "Ryan Korsgaard",
    product: "Ergo Office Chair",
    status: "Success",
    quantity: 12,
    unitPrice: "$3,450",
    totalRevenue: "$41,400",
  },
  {
    id: "#04911",
    customer: "Madelyn Lubin",
    product: "Sunset Desk 02",
    status: "Success",
    quantity: 20,
    unitPrice: "$2,980",
    totalRevenue: "$89,200",
  },
  {
    id: "#04912",
    customer: "Abram Bergson",
    product: "Eco Bookshelf",
    status: "Pending",
    quantity: 22,
    unitPrice: "$1,750",
    totalRevenue: "$75,900",
  },
  {
    id: "#04913",
    customer: "Phillip Mango",
    product: "Green Leaf Desk",
    status: "Refunded",
    quantity: 24,
    unitPrice: "$1,950",
    totalRevenue: "$19,500",
  },
  {
    id: "#04914",
    customer: "Avery Chen",
    product: "Oak Standing Desk",
    status: "Success",
    quantity: 8,
    unitPrice: "$2,250",
    totalRevenue: "$18,000",
  },
  {
    id: "#04915",
    customer: "Jordan Ellis",
    product: "Arc Task Lamp",
    status: "Pending",
    quantity: 16,
    unitPrice: "$180",
    totalRevenue: "$2,880",
  },
  {
    id: "#04916",
    customer: "Nora Williams",
    product: "Linen Lounge Chair",
    status: "Success",
    quantity: 6,
    unitPrice: "$1,420",
    totalRevenue: "$8,520",
  },
  {
    id: "#04917",
    customer: "Mateo Silva",
    product: "Modular Storage Unit",
    status: "Refunded",
    quantity: 4,
    unitPrice: "$890",
    totalRevenue: "$3,560",
  },
  {
    id: "#04918",
    customer: "Amara Okafor",
    product: "Walnut Side Table",
    status: "Success",
    quantity: 11,
    unitPrice: "$540",
    totalRevenue: "$5,940",
  },
  {
    id: "#04919",
    customer: "Ethan Brooks",
    product: "Ergo Office Chair",
    status: "Pending",
    quantity: 9,
    unitPrice: "$3,450",
    totalRevenue: "$31,050",
  },
  {
    id: "#04920",
    customer: "Zara Patel",
    product: "Green Leaf Desk",
    status: "Success",
    quantity: 5,
    unitPrice: "$1,950",
    totalRevenue: "$9,750",
  },
  {
    id: "#04921",
    customer: "Noah Kim",
    product: "Eco Bookshelf",
    status: "Success",
    quantity: 7,
    unitPrice: "$1,750",
    totalRevenue: "$12,250",
  },
  {
    id: "#04922",
    customer: "Mila Laurent",
    product: "Sunset Desk 02",
    status: "Pending",
    quantity: 3,
    unitPrice: "$2,980",
    totalRevenue: "$8,940",
  },
];

const statusStyles = {
  Success: {
    className: "border-[#D1FAE5] bg-[#ECFDF5] text-[#059669]",
    Icon: CircleCheck,
  },
  Pending: {
    className: "border-[#FDE68A] bg-[#FEF3C7] text-[#B45309]",
    Icon: Clock3,
  },
  Refunded: {
    className: "border-[#E5E7EB] bg-[#F3F4F6] text-[#6B7280]",
    Icon: RotateCcw,
  },
};

const emptyForm = {
  customer: "",
  product: "",
  status: "Success",
  quantity: "1",
  unitPrice: "",
};
const moneyFormatter = new Intl.NumberFormat("en-US", {
  maximumFractionDigits: 2,
});

function RecentTransactionsTable({ globalSearchQuery = "" }) {
  const [rows, setRows] = useState(transactions);
  const [nextTransactionNumber, setNextTransactionNumber] = useState(() =>
    Math.max(...transactions.map((transaction) => Number(transaction.id.replace(/\D/g, "")))) + 1,
  );
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedIds, setSelectedIds] = useState([]);
  const [openActionId, setOpenActionId] = useState(null);
  const [showTableMenu, setShowTableMenu] = useState(false);
  const [modal, setModal] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const actionMenuRef = useRef(null);
  const tableMenuRef = useRef(null);
  const queryTerms = [searchQuery, globalSearchQuery]
    .flatMap((query) => query.trim().toLowerCase().split(/\s+/))
    .filter(Boolean);
  const visibleTransactions = rows.filter((transaction) =>
    queryTerms.every((query) =>
      Object.values(transaction).some((value) => String(value).toLowerCase().includes(query)),
    ),
  );
  const visibleIds = visibleTransactions.map((transaction) => transaction.id);
  const allVisibleSelected = visibleIds.length > 0 && visibleIds.every((id) => selectedIds.includes(id));

  useEffect(() => {
    if (!modal) return undefined;

    function closeOnEscape(event) {
      if (event.key === "Escape") setModal(null);
    }

    window.addEventListener("keydown", closeOnEscape);
    return () => window.removeEventListener("keydown", closeOnEscape);
  }, [modal]);

  useEffect(() => {
    if (!openActionId) return undefined;

    function closeOnPointer(event) {
      if (event.target.closest?.("[data-row-action-trigger]")) return;
      if (!actionMenuRef.current?.contains(event.target)) setOpenActionId(null);
    }

    function closeOnScroll() {
      setOpenActionId(null);
    }

    function closeOnEscape(event) {
      if (event.key === "Escape") setOpenActionId(null);
    }

    document.addEventListener("pointerdown", closeOnPointer);
    window.addEventListener("keydown", closeOnEscape);
    window.addEventListener("scroll", closeOnScroll, true);
    window.addEventListener("resize", closeOnScroll);
    return () => {
      document.removeEventListener("pointerdown", closeOnPointer);
      window.removeEventListener("keydown", closeOnEscape);
      window.removeEventListener("scroll", closeOnScroll, true);
      window.removeEventListener("resize", closeOnScroll);
    };
  }, [openActionId]);

  useEffect(() => {
    if (!showTableMenu) return undefined;

    function closeOnPointer(event) {
      if (!tableMenuRef.current?.contains(event.target)) setShowTableMenu(false);
    }

    function closeOnEscape(event) {
      if (event.key === "Escape") setShowTableMenu(false);
    }

    document.addEventListener("pointerdown", closeOnPointer);
    window.addEventListener("keydown", closeOnEscape);
    return () => {
      document.removeEventListener("pointerdown", closeOnPointer);
      window.removeEventListener("keydown", closeOnEscape);
    };
  }, [showTableMenu]);

  function toggleRow(id) {
    setSelectedIds((current) =>
      current.includes(id) ? current.filter((selectedId) => selectedId !== id) : [...current, id],
    );
  }

  function toggleAllVisible() {
    setSelectedIds((current) => {
      if (allVisibleSelected) return current.filter((id) => !visibleIds.includes(id));
      return [...new Set([...current, ...visibleIds])];
    });
  }

  function openTransactionForm(transaction = null) {
    setOpenActionId(null);
    setShowTableMenu(false);
    setForm(transaction ? {
      customer: transaction.customer,
      product: transaction.product,
      status: transaction.status,
      quantity: String(transaction.quantity),
      unitPrice: transaction.unitPrice.replace(/[^\d.]/g, ""),
    } : emptyForm);
    setModal({ type: "form", mode: transaction ? "edit" : "add", transaction });
  }

  function saveTransaction(event) {
    event.preventDefault();

    const quantity = Number(form.quantity);
    const unitPrice = Number(form.unitPrice);
    if (
      !form.customer.trim() ||
      !form.product.trim() ||
      !Number.isFinite(quantity) ||
      !Number.isFinite(unitPrice) ||
      quantity < 1 ||
      unitPrice < 0
    ) return;

    const transaction = {
      id: modal.mode === "edit"
        ? modal.transaction.id
        : `#${String(nextTransactionNumber).padStart(5, "0")}`,
      customer: form.customer.trim(),
      product: form.product.trim(),
      status: form.status,
      quantity,
      unitPrice: `$${moneyFormatter.format(unitPrice)}`,
      totalRevenue: `$${moneyFormatter.format(quantity * unitPrice)}`,
    };

    setRows((current) => modal.mode === "edit"
      ? current.map((row) => row.id === transaction.id ? transaction : row)
      : [transaction, ...current]);
    if (modal.mode === "add") setNextTransactionNumber((current) => current + 1);
    setModal(null);
  }

  function confirmDelete() {
    const idsToDelete = new Set(modal.ids);
    setRows((current) => current.filter((row) => !idsToDelete.has(row.id)));
    setSelectedIds((current) => current.filter((id) => !idsToDelete.has(id)));
    setModal(null);
    setOpenActionId(null);
  }

  function toggleActionMenu(event, transactionId) {
    const bounds = event.currentTarget.getBoundingClientRect();
    const menuHeight = 126;
    const openAbove = window.innerHeight - bounds.bottom < menuHeight + 12;
    const top = openAbove
      ? Math.max(8, bounds.top - menuHeight - 4)
      : Math.min(window.innerHeight - menuHeight - 8, bounds.bottom + 4);
    const left = Math.min(window.innerWidth - 152, Math.max(8, bounds.right - 144));

    setOpenActionId((current) => current?.id === transactionId
      ? null
      : { id: transactionId, top, left });
  }

  function openDeleteDialog(ids) {
    setShowTableMenu(false);
    setOpenActionId(null);
    setModal({ type: "delete", ids });
  }

  return (
    <>
      <Card className="mt-3 min-w-0 overflow-hidden rounded-xl border-0 bg-[#F5F4F2] p-px shadow-[0_1px_2px_rgba(17,24,39,0.03)]">
      <CardHeader className="flex min-h-9 grid-cols-none grid-rows-none flex-wrap items-center justify-between gap-2 px-3 py-1 sm:px-4">
        <div className="flex shrink-0 items-center gap-1.5">
          <h2 className="origin-left scale-y-[1.2] font-sans text-[10px] font-semibold leading-[14px] text-[#6B7280]">
            RECENT TRANSACTIONS
          </h2>
          <Info aria-hidden="true" className="text-[#9CA3AF]" size={11} />
        </div>

        <div className="flex min-w-0 flex-1 flex-wrap items-center justify-end gap-1.5">
          <label className="flex h-7 min-w-[130px] flex-1 items-center gap-1.5 rounded-md border border-[#E5E7EB] bg-white px-2 text-[#9CA3AF] sm:max-w-[190px]">
            <Search aria-hidden="true" size={13} />
            <input
              aria-label="Search transactions"
              className="min-w-0 flex-1 bg-transparent text-[10px] text-[#111827] outline-none placeholder:text-[#9CA3AF]"
              onChange={(event) => setSearchQuery(event.target.value)}
              placeholder="Search transactions..."
              type="search"
              value={searchQuery}
            />
          </label>
          <button
            className="inline-flex h-7 shrink-0 items-center gap-1 rounded-md border border-[#E5E7EB] bg-white px-2 text-[10px] font-medium text-[#111827] hover:bg-[#F9FAFB]"
            onClick={() => openTransactionForm()}
            type="button"
          >
            <Plus aria-hidden="true" size={12} />
            Add Transaction
          </button>
          {selectedIds.length > 0 && (
            <button
              className="inline-flex h-7 shrink-0 items-center gap-1 rounded-md border border-[#FECACA] bg-white px-2 text-[10px] font-medium text-[#B91C1C] hover:bg-[#FEF2F2]"
              onClick={() => openDeleteDialog([...selectedIds])}
              type="button"
            >
              <Trash2 aria-hidden="true" size={12} />
              Delete ({selectedIds.length})
            </button>
          )}
          <div className="relative" ref={tableMenuRef}>
            <button
              aria-expanded={showTableMenu}
              aria-label="Transaction table options"
              className="grid size-7 shrink-0 place-items-center rounded-md text-[#9CA3AF] hover:bg-white"
              onClick={() => setShowTableMenu((isOpen) => !isOpen)}
              type="button"
            >
              <MoreHorizontal aria-hidden="true" size={15} />
            </button>
            {showTableMenu && (
              <div className="absolute top-full right-0 z-30 mt-1 w-40 rounded-lg border border-[#E5E7EB] bg-white p-1 shadow-lg">
                <button
                  className="w-full rounded-md px-2.5 py-2 text-left text-[11px] text-[#111827] hover:bg-[#F5F4F2]"
                  onClick={() => {
                    toggleAllVisible();
                    setShowTableMenu(false);
                  }}
                  type="button"
                >
                  {allVisibleSelected ? "Deselect visible rows" : "Select visible rows"}
                </button>
                <button
                  className="w-full rounded-md px-2.5 py-2 text-left text-[11px] text-[#B91C1C] hover:bg-[#FEF2F2] disabled:cursor-not-allowed disabled:opacity-40"
                  disabled={selectedIds.length === 0}
                  onClick={() => openDeleteDialog([...selectedIds])}
                  type="button"
                >
                  Delete selected rows
                </button>
              </div>
            )}
          </div>
        </div>
      </CardHeader>

      <CardContent className="relative overflow-hidden rounded-xl border border-[#E5E7EB] bg-white p-0">
        <div className="max-h-[150px] w-full overflow-auto">
          <table className="w-full min-w-[820px] table-fixed border-collapse text-left font-sans">
            <colgroup>
              <col className="w-8" />
              <col className="w-[78px]" />
              <col className="w-[142px]" />
              <col className="w-[142px]" />
              <col className="w-[104px]" />
              <col className="w-[62px]" />
              <col className="w-[112px]" />
              <col className="w-[120px]" />
              <col className="w-10" />
            </colgroup>
            <thead className="sticky top-0 z-10 bg-white">
              <tr className="h-[29px] border-b border-[#E5E7EB]">
                <th className="pl-3 pr-1">
                  <input
                    aria-label="Select all visible transactions"
                    checked={allVisibleSelected}
                    className="size-3 accent-[#111827]"
                    onChange={toggleAllVisible}
                    type="checkbox"
                  />
                </th>
                {["ID", "CUSTOMER", "PRODUCT", "STATUS", "QTY", "UNIT PRICE", "TOTAL REVENUE", "ACTIONS"].map((heading) => (
                  <th
                    className="whitespace-nowrap px-2 text-[9px] font-medium leading-3 tracking-[0.04em] text-[#6B7280]"
                    key={heading}
                    scope="col"
                  >
                    {heading}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {visibleTransactions.length > 0 ? visibleTransactions.map((transaction) => {
                const { className, Icon } = statusStyles[transaction.status];
                const isRefunded = transaction.status === "Refunded";
                const rowTextColor = isRefunded ? "text-[#9CA3AF]" : "text-[#111827]";

                return (
                  <tr className="h-[35px] border-b border-[#E5E7EB] last:border-b-0" key={transaction.id}>
                    <td className="pl-3 pr-1">
                      <input
                        aria-label={`Select transaction ${transaction.id}`}
                        checked={selectedIds.includes(transaction.id)}
                        className="size-3 accent-[#111827]"
                        onChange={() => toggleRow(transaction.id)}
                        type="checkbox"
                      />
                    </td>
                    <td className={`truncate px-2 text-[10px] ${rowTextColor}`}>{transaction.id}</td>
                    <td className={`truncate px-2 text-[10px] font-medium ${rowTextColor}`}>{transaction.customer}</td>
                    <td className={`truncate px-2 text-[10px] ${rowTextColor}`}>{transaction.product}</td>
                    <td className="px-2">
                      <span className={`inline-flex h-[19px] items-center gap-1 rounded-full border px-1.5 text-[9px] font-medium ${className}`}>
                        <Icon aria-hidden="true" size={10} strokeWidth={2} />
                        {transaction.status}
                      </span>
                    </td>
                    <td className={`px-2 text-[10px] font-medium ${rowTextColor}`}>{transaction.quantity}</td>
                    <td className={`whitespace-nowrap px-2 text-[10px] font-medium ${rowTextColor}`}>{transaction.unitPrice}</td>
                    <td className={`whitespace-nowrap px-2 text-[10px] font-semibold ${rowTextColor}`}>{transaction.totalRevenue}</td>
                    <td className="px-1">
                      <button
                        aria-expanded={openActionId?.id === transaction.id}
                        aria-label={`Actions for transaction ${transaction.id}`}
                        className="grid size-[22px] place-items-center rounded-md border border-[#E5E7EB] bg-white text-[#6B7280] hover:bg-[#F9FAFB]"
                        data-row-action-trigger="true"
                        onClick={(event) => toggleActionMenu(event, transaction.id)}
                        type="button"
                      >
                        <MoreHorizontal aria-hidden="true" size={13} />
                      </button>
                    </td>
                  </tr>
                );
              }) : (
                <tr>
                  <td className="h-16 px-4 text-center text-[11px] text-[#9CA3AF]" colSpan={9}>
                    No transactions match your search.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        {queryTerms.length === 0 && visibleTransactions.length > 0 && (
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-x-0 bottom-0 h-14 bg-gradient-to-b from-transparent via-white/65 to-white/95"
          />
        )}
      </CardContent>
      </Card>

      {openActionId && createPortal(
        <div
          className="fixed z-[110] w-36 rounded-lg border border-[#E5E7EB] bg-white p-1 shadow-lg"
          ref={actionMenuRef}
          role="menu"
          style={{ left: openActionId.left, top: openActionId.top }}
        >
          {(() => {
            const transaction = rows.find((row) => row.id === openActionId.id);
            if (!transaction) return null;

            return (
              <>
                <button
                  className="flex w-full items-center gap-2 rounded-md px-2 py-2 text-left text-[11px] text-[#111827] hover:bg-[#F5F4F2]"
                  onClick={() => {
                    setModal({ type: "view", transaction });
                    setOpenActionId(null);
                  }}
                  role="menuitem"
                  type="button"
                >
                  <Eye aria-hidden="true" size={13} />
                  View details
                </button>
                <button
                  className="flex w-full items-center gap-2 rounded-md px-2 py-2 text-left text-[11px] text-[#111827] hover:bg-[#F5F4F2]"
                  onClick={() => openTransactionForm(transaction)}
                  role="menuitem"
                  type="button"
                >
                  <Pencil aria-hidden="true" size={13} />
                  Edit transaction
                </button>
                <button
                  className="flex w-full items-center gap-2 rounded-md px-2 py-2 text-left text-[11px] text-[#B91C1C] hover:bg-[#FEF2F2]"
                  onClick={() => openDeleteDialog([transaction.id])}
                  role="menuitem"
                  type="button"
                >
                  <Trash2 aria-hidden="true" size={13} />
                  Delete transaction
                </button>
              </>
            );
          })()}
        </div>,
        document.body,
      )}

      {modal && createPortal(
        <div
          className="fixed inset-0 z-[120] grid place-items-center bg-[#111827]/25 p-4 backdrop-blur-[3px]"
          onClick={() => setModal(null)}
        >
          <section
            aria-labelledby="transaction-dialog-title"
            aria-modal="true"
            className="w-full max-w-md rounded-2xl border border-[#E5E7EB] bg-white p-5 shadow-2xl sm:p-6"
            onClick={(event) => event.stopPropagation()}
            role="dialog"
          >
            <div className="mb-4 flex items-start justify-between gap-4">
              <div>
                <p className="mb-1 text-[10px] font-semibold uppercase tracking-[0.08em] text-[#6B7280]">
                  Recent transactions
                </p>
                <h2 className="text-[17px] font-semibold text-[#111827]" id="transaction-dialog-title">
                  {modal.type === "form"
                    ? `${modal.mode === "add" ? "Add" : "Edit"} transaction`
                    : modal.type === "view"
                      ? "Transaction details"
                      : "Delete transaction"}
                </h2>
              </div>
              <button
                aria-label="Close dialog"
                className="grid size-7 shrink-0 place-items-center rounded-md text-[#6B7280] hover:bg-[#F3F4F6]"
                onClick={() => setModal(null)}
                type="button"
              >
                <X aria-hidden="true" size={15} />
              </button>
            </div>

            {modal.type === "form" && (
              <form className="space-y-3" onSubmit={saveTransaction}>
                <label className="block space-y-1 text-[11px] font-medium text-[#374151]">
                  Customer
                  <input
                    autoFocus
                    className="h-9 w-full rounded-lg border border-[#E5E7EB] px-3 text-[13px] font-normal text-[#111827] outline-none focus:border-[#9CA3AF]"
                    onChange={(event) => setForm((current) => ({ ...current, customer: event.target.value }))}
                    placeholder="Customer name"
                    required
                    value={form.customer}
                  />
                </label>
                <label className="block space-y-1 text-[11px] font-medium text-[#374151]">
                  Product
                  <input
                    className="h-9 w-full rounded-lg border border-[#E5E7EB] px-3 text-[13px] font-normal text-[#111827] outline-none focus:border-[#9CA3AF]"
                    onChange={(event) => setForm((current) => ({ ...current, product: event.target.value }))}
                    placeholder="Product name"
                    required
                    value={form.product}
                  />
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <label className="block space-y-1 text-[11px] font-medium text-[#374151]">
                    Status
                    <select
                      className="h-9 w-full rounded-lg border border-[#E5E7EB] bg-white px-3 text-[13px] font-normal text-[#111827] outline-none focus:border-[#9CA3AF]"
                      onChange={(event) => setForm((current) => ({ ...current, status: event.target.value }))}
                      value={form.status}
                    >
                      {Object.keys(statusStyles).map((status) => <option key={status}>{status}</option>)}
                    </select>
                  </label>
                  <label className="block space-y-1 text-[11px] font-medium text-[#374151]">
                    Quantity
                    <input
                      className="h-9 w-full rounded-lg border border-[#E5E7EB] px-3 text-[13px] font-normal text-[#111827] outline-none focus:border-[#9CA3AF]"
                      min="1"
                      onChange={(event) => setForm((current) => ({ ...current, quantity: event.target.value }))}
                      required
                      type="number"
                      value={form.quantity}
                    />
                  </label>
                </div>
                <label className="block space-y-1 text-[11px] font-medium text-[#374151]">
                  Unit price ($)
                  <input
                    className="h-9 w-full rounded-lg border border-[#E5E7EB] px-3 text-[13px] font-normal text-[#111827] outline-none focus:border-[#9CA3AF]"
                    min="0"
                    onChange={(event) => setForm((current) => ({ ...current, unitPrice: event.target.value }))}
                    placeholder="0.00"
                    required
                    step="0.01"
                    type="number"
                    value={form.unitPrice}
                  />
                </label>
                <div className="flex justify-end gap-2 pt-2">
                  <button
                    className="h-9 rounded-lg border border-[#E5E7EB] px-3 text-[12px] font-medium text-[#374151] hover:bg-[#F9FAFB]"
                    onClick={() => setModal(null)}
                    type="button"
                  >
                    Cancel
                  </button>
                  <button
                    className="h-9 rounded-lg bg-[#111827] px-4 text-[12px] font-medium text-white hover:bg-[#1F2937]"
                    type="submit"
                  >
                    {modal.mode === "add" ? "Add transaction" : "Save changes"}
                  </button>
                </div>
              </form>
            )}

            {modal.type === "view" && (
              <div>
                <dl className="grid grid-cols-2 gap-x-4 gap-y-3 rounded-xl bg-[#F9FAFB] p-4 text-[12px]">
                  {[
                    ["ID", modal.transaction.id],
                    ["Customer", modal.transaction.customer],
                    ["Product", modal.transaction.product],
                    ["Status", modal.transaction.status],
                    ["Quantity", modal.transaction.quantity],
                    ["Unit price", modal.transaction.unitPrice],
                    ["Total revenue", modal.transaction.totalRevenue],
                  ].map(([label, value]) => (
                    <div className="min-w-0" key={label}>
                      <dt className="mb-1 text-[10px] text-[#6B7280]">{label}</dt>
                      <dd className="truncate font-medium text-[#111827]">{value}</dd>
                    </div>
                  ))}
                </dl>
                <div className="mt-4 flex justify-end">
                  <button
                    className="h-9 rounded-lg bg-[#111827] px-4 text-[12px] font-medium text-white hover:bg-[#1F2937]"
                    onClick={() => setModal(null)}
                    type="button"
                  >
                    Done
                  </button>
                </div>
              </div>
            )}

            {modal.type === "delete" && (
              <div>
                <p className="text-[13px] leading-5 text-[#6B7280]">
                  Delete {modal.ids.length === 1 ? "this transaction" : `these ${modal.ids.length} transactions`}? This action cannot be undone.
                </p>
                <div className="mt-5 flex justify-end gap-2">
                  <button
                    className="h-9 rounded-lg border border-[#E5E7EB] px-3 text-[12px] font-medium text-[#374151] hover:bg-[#F9FAFB]"
                    onClick={() => setModal(null)}
                    type="button"
                  >
                    Cancel
                  </button>
                  <button
                    className="h-9 rounded-lg bg-[#B91C1C] px-4 text-[12px] font-medium text-white hover:bg-[#991B1B]"
                    onClick={confirmDelete}
                    type="button"
                  >
                    Delete
                  </button>
                </div>
              </div>
            )}
          </section>
        </div>,
        document.body,
      )}
    </>
  );
}

export default RecentTransactionsTable;
