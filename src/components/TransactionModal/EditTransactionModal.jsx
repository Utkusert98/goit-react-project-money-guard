import React, { useEffect } from "react";
import { useForm, Controller } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

// Validation
const schema = yup
  .object({
    amount: yup
      .number()
      .typeError("Amount must be a number")
      .positive("Amount must be positive")
      .required("Amount is required"),
    category: yup.string().required("Category is required"),
    description: yup.string().max(200, "Description is too long"),
    date: yup.date().typeError("Invalid date").required("Date is required"),
    type: yup.string().oneOf(["income", "expense"]).required("Type is required"),
  })
  .required();

/**
 * Props:
 * - isOpen: boolean  -> Modal açık mı?
 * - onClose: () => void
 * - onSave: (data) => void
 * - transaction: { amount, category, description, date, type } | undefined
 */
function EditTransactionModal({ isOpen, onClose, onSave, transaction }) {
  // 🔒 KORUMA — Açık değilse ya da transaction yoksa hiç render etme
  if (!isOpen && !transaction) return null;

  // ESC ile kapatma
  useEffect(() => {
    const onEsc = (e) => {
      if (e.key === "Escape" && typeof onClose === "function") onClose();
    };
    document.addEventListener("keydown", onEsc);
    return () => document.removeEventListener("keydown", onEsc);
  }, [onClose]);

  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(schema),
    mode: "onChange",
    defaultValues: {
      amount: transaction?.amount ?? "",
      category: transaction?.category ?? "",
      description: transaction?.description ?? "",
      date: transaction?.date ? new Date(transaction.date) : null,
      type: transaction?.type ?? "expense",
    },
  });

  const onSubmit = (data) => {
    if (typeof onSave === "function") onSave(data);
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(0,0,0,0.4)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: 16,
        zIndex: 1000, // Sayfanın üstüne çıksın ama diğer sayfaları bozmasın
      }}
      onClick={(e) => {
        if (e.target === e.currentTarget && typeof onClose === "function") onClose();
      }}
    >
      <div
        style={{
          width: "100%",
          maxWidth: 520,
          background: "#fff",
          borderRadius: 12,
          padding: 20,
          boxShadow: "0 10px 30px rgba(0,0,0,0.15)",
        }}
      >
        <h3 style={{ marginBottom: 16 }}>Edit Transaction</h3>

        <form onSubmit={handleSubmit(onSubmit)}>
          {/* Amount */}
          <label style={{ display: "block", marginBottom: 8 }}>
            <span style={{ display: "block", marginBottom: 4 }}>Amount</span>
            <input
              type="number"
              step="0.01"
              {...register("amount")}
              style={{ width: "100%", padding: 10, borderRadius: 8, border: "1px solid #ddd" }}
              placeholder="e.g. 120.50"
            />
          </label>
          {errors.amount && (
            <p style={{ color: "#d33", marginTop: -6, marginBottom: 10 }}>
              {errors.amount.message}
            </p>
          )}

          {/* Category */}
          <label style={{ display: "block", marginBottom: 8 }}>
            <span style={{ display: "block", marginBottom: 4 }}>Category</span>
            <input
              type="text"
              {...register("category")}
              style={{ width: "100%", padding: 10, borderRadius: 8, border: "1px solid #ddd" }}
              placeholder="e.g. Groceries"
            />
          </label>
          {errors.category && (
            <p style={{ color: "#d33", marginTop: -6, marginBottom: 10 }}>
              {errors.category.message}
            </p>
          )}

          {/* Description */}
          <label style={{ display: "block", marginBottom: 8 }}>
            <span style={{ display: "block", marginBottom: 4 }}>Description (optional)</span>
            <input
              type="text"
              {...register("description")}
              style={{ width: "100%", padding: 10, borderRadius: 8, border: "1px solid #ddd" }}
              placeholder="Add a short note"
            />
          </label>
          {errors.description && (
            <p style={{ color: "#d33", marginTop: -6, marginBottom: 10 }}>
              {errors.description.message}
            </p>
          )}

          {/* Date */}
          <div style={{ marginBottom: 10 }}>
            <span style={{ display: "block", marginBottom: 4 }}>Date</span>
            <Controller
              name="date"
              control={control}
              render={({ field }) => (
                <DatePicker
                  selected={field.value}
                  onChange={(d) => field.onChange(d)}
                  dateFormat="yyyy-MM-dd"
                  placeholderText="Select date"
                  className="input"
                  wrapperClassName="datepicker-wrapper"
                  style={{ width: "100%" }}
                />
              )}
            />
            {errors.date && (
              <p style={{ color: "#d33", marginTop: 6 }}>
                {errors.date.message}
              </p>
            )}
          </div>

          {/* Type */}
          <div style={{ marginBottom: 14 }}>
            <span style={{ display: "block", marginBottom: 6 }}>Type</span>
            <label style={{ marginRight: 16 }}>
              <input type="radio" value="income" {...register("type")} /> Income
            </label>
            <label>
              <input type="radio" value="expense" {...register("type")} /> Expense
            </label>
            {errors.type && (
              <p style={{ color: "#d33", marginTop: 6 }}>
                {errors.type.message}
              </p>
            )}
          </div>

          {/* Actions */}
          <div style={{ display: "flex", gap: 12, justifyContent: "flex-end", marginTop: 16 }}>
            <button
              type="button"
              onClick={onClose}
              style={{
                padding: "10px 14px",
                borderRadius: 8,
                border: "1px solid #ddd",
                background: "#f6f6f6",
              }}
            >
              Cancel
            </button>
            <button
              type="submit"
              style={{
                padding: "10px 14px",
                borderRadius: 8,
                border: "none",
                background: "#2f6fed",
                color: "#fff",
                fontWeight: 600,
              }}
            >
              Save
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default EditTransactionModal;
