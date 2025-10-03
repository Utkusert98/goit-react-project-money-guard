import { useForm, Controller } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { useDispatch, useSelector } from "react-redux";
import s from "./EditTransactionForm.module.css";
import Button from "../Button/Button";
import ButtonCancel from "../ButtonCancel/ButtonCancel";
import {
 setEditTransaction,
 useTransactionsPagination,
} from "../../redux/transactions/slice";
import {
 updateTransaction,
 getCategories,
 getTransactions,
} from "../../redux/transactions/operations";
import { toast } from "react-toastify";
import { BiCalendar } from "react-icons/bi";
import { IoIosArrowDown } from "react-icons/io";
import { useEffect, useState, useRef } from "react";
import {
 selectIncomeCategories,
 selectExpenseCategories,
} from "../../redux/transactions/selectors";
import { EditTransactionSchema } from "../../helpers/editTransactionSchema";
import { format, parseISO } from "date-fns";

const EditTransactionForm = ({ transaction }) => {
 const dispatch = useDispatch();
 const pagination = useTransactionsPagination();

 const [isSelectOpen, setIsSelectOpen] = useState(false);
 const [isCalendarOpen, setIsCalendarOpen] = useState(false);
 const selectRef = useRef(null);
 const [startDate, setStartDate] = useState(new Date());

 const incomeCategories = useSelector(selectIncomeCategories);
 const expenseCategories = useSelector(selectExpenseCategories);
 const [availableCategories, setAvailableCategories] = useState([]);

 const {
  register,
  handleSubmit,
  control,
  formState: { errors },
  watch,
  setValue,
  getValues,
 } = useForm({
  resolver: yupResolver(EditTransactionSchema),
  defaultValues: {
   sum: transaction?.sum,
   date: transaction?.date ? parseISO(transaction.date) : null,
   comment: transaction?.comment || "",
   type: transaction?.type || "expense",
   categoryId: transaction?.categoryId?._id || transaction?.categoryId || "",
  },
 });

 const watchType = watch("type");

 useEffect(() => {
  if (incomeCategories.length === 0 && expenseCategories.length === 0) {
   dispatch(getCategories());
  }
 }, [dispatch, incomeCategories, expenseCategories]);

 useEffect(() => {
  let filteredCategories = [];
  if (watchType === "expense") {
   filteredCategories = expenseCategories;
  } else if (watchType === "income") {
   filteredCategories = incomeCategories;
  }

  setAvailableCategories(filteredCategories);

  const currentCategoryId = getValues("categoryId");
  const isCurrentCategoryAvailable = filteredCategories.some(
   (cat) => cat._id === currentCategoryId
  );

  if (!isCurrentCategoryAvailable && filteredCategories.length > 0) {
   setValue("categoryId", filteredCategories[0]._id);
  } else if (filteredCategories.length === 0) {
   setValue("categoryId", "");
  }
 }, [watchType, incomeCategories, expenseCategories, setValue, getValues]);

 const handleTypeChange = (type) => {
  if (type !== watchType) {
   setValue("type", type);
  }
 };

 const handleSelectFocus = () => {
  setIsSelectOpen(true);
 };

 const handleSelectBlur = () => {
  setIsSelectOpen(false);
 };

 const handleSelectChange = (e) => {
  setIsSelectOpen(false);
  const { onChange } = register("categoryId");
  onChange(e);
 };

 const handleCalendarClick = () => {
  setIsCalendarOpen(!isCalendarOpen);
 };

 const onSubmit = async (data) => {
  const updatedTransaction = {
   _id: transaction._id,
   sum: data.sum,
   date: data.date ? format(data.date, "yyyy-MM-dd'T'HH:mm:ss.SSS'Z'") : null,
   comment: data.comment,
   type: data.type,
   categoryId: data.categoryId,
  };

  try {
   await dispatch(updateTransaction(updatedTransaction)).unwrap();
   toast.success("Transaction updated successfully!");
   dispatch(setEditTransaction(null));
   dispatch(
    getTransactions({ page: pagination.page, perPage: pagination.perPage })
   );
  } catch (error) {
   const errorMessage = error.message || "Something went wrong";
   if (error.data?.message && error.data.message.includes("does not match")) {
    toast.error(
     "Category type does not match transaction type. Please select a compatible category."
    );
   } else {
    const backendErrorMessage = error.data?.message || errorMessage;
    toast.error(`Error: ${backendErrorMessage}`);
   }
  }
 };

 return (
  <div className={s.wrapper}>
   <form className={s.transaction_form} onSubmit={handleSubmit(onSubmit)}>
    <div className={s.type_toggle}>
     <span
      className={`${s.type_option} ${watchType === "income" ? s.active : ""}`}
      onClick={() => handleTypeChange("income")}
     >
      Income
     </span>
     <span className={s.separator}>/</span>
     <span
      className={`${s.type_option} ${watchType === "expense" ? s.active : ""}`}
      onClick={() => handleTypeChange("expense")}
     >
      Expense
     </span>
    </div>
    <input type="hidden" {...register("type")} />
    <div className={s.select_error_box}>
     <>
      <div className={s.select_box}>
       <select
        ref={selectRef}
        className={s.select}
        name="categoryId"
        defaultValue=""
        {...register("categoryId")}
        onFocus={handleSelectFocus}
        onBlur={handleSelectBlur}
        onChange={handleSelectChange}
        disabled={availableCategories.length === 0}
       >
        <option value="" disabled hidden>
         {availableCategories.length === 0
          ? "No categories available"
          : "Select a category"}
        </option>

        {availableCategories.map((items) => (
         <option key={items._id} value={items._id}>
          {items.name}
         </option>
        ))}
       </select>
       <IoIosArrowDown
        className={`${s.select_icon} ${isSelectOpen ? s.select_icon_open : ""}`}
       />
      </div>
      <div className={s.error_box}>
       {errors.categoryId && (
        <p className={s.errors}>{errors.categoryId.message}</p>
       )}
      </div>
     </>
    </div>

    <div className={s.box_sum_date}>
     <div className={s.date_box}>
      <input
       className={s.sum}
       {...register("sum")}
       type="number"
       defaultValue=""
       placeholder="0.00"
       step={0.01}
       min={0.01}
      />
      <div className={s.error_box}>
       {errors.sum && <p className={s.errors}>{errors.sum.message}</p>}
      </div>
     </div>
     <div className={s.date_box}>
      <Controller
       name="date"
       control={control}
       className={s.controller}
       render={({ field }) => (
        <div className={s.date_picker_container}>
         <DatePicker
          {...field}
          selected={field.value || startDate}
          onChange={(date) => {
           field.onChange(date);
           setStartDate(date);
           setIsCalendarOpen(false);
          }}
          dateFormat="dd.MM.yyyy"
          className={s.DatePicker}
          maxDate={new Date()}
          open={isCalendarOpen}
          onClickOutside={() => setIsCalendarOpen(false)}
          onFocus={() => setIsCalendarOpen(true)}
         />
         <div className={s.date_icon} onClick={handleCalendarClick}>
          <BiCalendar size={24} />
         </div>
        </div>
       )}
      />

      <div className={s.error_box}>
       {errors.date && <p className={s.errors}>{errors.date.message}</p>}
      </div>
     </div>
    </div>

    <div className={s.comment_error_box}>
     <input
      className={s.comment}
      {...register("comment")}
      placeholder="Comment"
      autoComplete="off"
      type="text"
     />
     <div className={s.error_box}>
      {errors.comment && <p className={s.errors}>{errors.comment.message}</p>}
     </div>
    </div>

    <div className={s.buttonGroup}>
     <Button text="Save" className={s.submitButton} type="submit" />
     <ButtonCancel onClick={() => dispatch(setEditTransaction(null))} />
    </div>
   </form>
  </div>
 );
};

export default EditTransactionForm;
