import {
  ArrowRightFromLine,
  ChevronDown,
  ChevronUp,
  CirclePlus,
  Pencil,
  Trash,
} from "lucide-react";
import React, { useEffect, useState } from "react";
import GlobalTable from "../../components/global-table";
import { useEventStore, useProductStore } from "../../hooks/useModalState";
import { useNavigate, useSearchParams } from "react-router-dom";
import { usePathStore } from "../../hooks/usePathStore";
import { format } from "date-fns";
import EventsModal from "../../modals/holatlar-modal";
import $api from "../../http/api";
import { Box, CircularProgress, Typography } from "@mui/material";
import NoData from "../../assets/no-data.png";
import { getStatusStyle } from "../../utils/status";
import IsAddProduct from "../../components/Add-product/IsAddProduct";
import { notification } from "../../components/notification";
import ConfirmationModal from "../../components/Add-product/IsAddProduct";
import StatusSelector from "../../components/status-selector";
import ShipperSelector from "../../components/shipper-selector";
import {
  useDateFilterStore,
  useShipperFilterStore,
  useSortFilterStore,
  useStatusFilterStore,
} from "../../hooks/useFilterStore";
import DoubleDateModal from "../../components/DoubleDateModal";

export default function Events() {
  const navigate = useNavigate();
  const {
    onOpen,
    data,
    pageTotal,
    setData,
    setTotal,
    setEditData,
    type,
    isOnSubmit,
  } = useEventStore();
  const { onOpen: openProductModal } = useProductStore();
  const { setName } = usePathStore();
  const [searchParams, setSearchParams] = useSearchParams();

  // Initialize page and rowsPerPage from URL
  const [page, setPage] = useState(() => {
    const pageParam = parseInt(searchParams.get("page"));
    return isNaN(pageParam) || pageParam < 1 ? 0 : pageParam - 1; // 0-based indexing
  });
  const [rowsPerPage, setRowsPerPage] = useState(() => {
    const limitParam = parseInt(searchParams.get("limit"));
    return isNaN(limitParam) || limitParam < 1 ? 100 : limitParam;
  });

  const [loading, setLoading] = useState(true);
  const searchQuery = searchParams.get("search") || "";
  const [confirm, setConfirm] = useState({
    open: false,
    id: null,
    event_number: null,
    message: "",
  });
  const { startDate, endDate, setStartDate, setEndDate } = useDateFilterStore();
  const { toggleGrow, setField } = useSortFilterStore();
  const {
    id: shipperId,
    setValue: setShipperValue,
    setId: setShipperId,
  } = useShipperFilterStore();
  const { id, setValue, setId } = useStatusFilterStore();

  const handleSort = (field) => {
    setField(field);
    toggleGrow();
  };

  // Fetch data based on URL params and filters
  useEffect(() => {
    const fetchData = async () => {
      const pageNum = page + 1;
      const limit = rowsPerPage;
      const hasSearchParams =
        searchQuery || id || shipperId || startDate || endDate;

      if (!hasSearchParams) setLoading(true);
      else setLoading(true);

      try {
        const res = await $api.get(
          `/events/all?page=${pageNum}&limit=${limit}&event_number=${
            searchQuery || ""
          }&statusId=${id || ""}&shipperId=${shipperId || ""}&startDate=${
            startDate || ""
          }&endDate=${endDate || ""}`
        );

        const results = res.data.events || [];
        if (results.length === 0 && page > 0) {
          setPage((prev) => prev - 1);
        } else {
          setData(results);
          setTotal(res.data.total);
        }
      } catch (error) {
        notification(
          error.response?.data?.message || "Ma'lumot yuklashda xatolik"
        );
      } finally {
        setLoading(false);
      }
    };

    const timer = setTimeout(fetchData, 300); // Debounce qo'shish
    return () => clearTimeout(timer);
  }, [page, rowsPerPage, searchQuery, id, shipperId, startDate, endDate]);

  useEffect(() => {
    if (searchQuery) {
      const pageParam = parseInt(searchParams.get("page"));
      if (isNaN(pageParam) || pageParam < 1) {
        const newParams = new URLSearchParams(searchParams);
        newParams.set("page", "1");
        setSearchParams(newParams, { replace: true });
      }
    }
  }, [searchQuery]);

  useEffect(() => {
    const newParams = new URLSearchParams(searchParams);
    newParams.set("page", (page + 1).toString());
    newParams.set("limit", rowsPerPage.toString());

    if (!searchQuery) newParams.delete("search");

    setSearchParams(newParams, { replace: true });
  }, [page, rowsPerPage, searchQuery, searchParams]);

  useEffect(() => {
    setValue("");
    setId(null);
    setStartDate(null);
    setEndDate(null);
    setShipperValue("");
    setShipperId(null);
  }, [
    setValue,
    setId,
    setStartDate,
    setEndDate,
    setShipperValue,
    setShipperId,
  ]);

  // Qatorga bosilganda ishlaydigan funksiya
  const handleRowClick = (row) => {
    onOpen(); // Modalni ochish
    setEditData(row); // Taxrirlash uchun ma'lumotlarni o'rnatish
  };

  const columns = [
    { field: "index", headerName: "№" },
    {
      field: "event_number",
      headerName: "Yuk xati raqami",
      vector: true,
      renderCell: (params) => (
        <div
          onClick={() => handleRowClick(params.row)}
          className="cursor-pointer hover:bg-gray-100 p-2 rounded"
        >
          {params.value}
        </div>
      ),
    },
    {
      field: "date",
      headerName: <DoubleDateModal title={"Yuk xati sanasi"} />,
    },
    {
      field: "productsCount",
      headerName: (
        <div
          onClick={() => handleSort("productsCount")}
          className="flex items-center justify-between cursor-pointer"
        >
          <span>Maxsulotlar turining soni</span>
        </div>
      ),
      vector: true,
    },
    {
      field: "totalQuantity",
      headerName: (
        <div
          onClick={() => handleSort("totalQuantity")}
          className="flex items-center justify-between cursor-pointer"
        >
          <span>Umumiy mahsulotlar soni</span>
        </div>
      ),
      vector: true,
    },
    {
      field: "shipperName",
      headerName: <ShipperSelector />,
    },
    {
      field: "status",
      headerName: <StatusSelector />,
    },
  ];

  const originalRows = data.map((item, i) => ({
    id: item.id,
    index: page * rowsPerPage + i + 1,
    event_number: item.event_number,
    shipperName: item.shipperName,
    totalQuantity: item.totalQuantity,
    status: (
      <div className="flex flex-wrap gap-1">
        {item.productStatuses?.map((status) => (
          <span
            key={status}
            className={`ml-2 text-xs font-medium px-2 py-0.5 rounded-full ${getStatusStyle(
              status
            )}`}
          >
            {status}
          </span>
        ))}
      </div>
    ),
    productsCount: item.productsCount,
    date: format(new Date(item.date), "dd-MM-yyyy"),
  }));

  const rows = originalRows.map((row) => ({
    ...row,
  }));

  const handleDelete = async () => {
    if (confirm.open && confirm.id) {
      try {
        const res = await $api.delete(`events/delete/${confirm.id}`);
        if (res.status === 200) {
          setData(data.filter((item) => item.id !== confirm.id));
          setConfirm((prev) => ({ ...prev, open: false }));
          notification("Yuk xati muvaffaqiyatli o'chirildi", "success");
        }
      } catch (error) {
        notification(
          error?.response?.data?.message || "O'chirishda xatolik yuz berdi"
        );
      }
    }
  };

  useEffect(() => {
    if (type === "event-delete") {
      // Handle event deletion if needed
    }
  }, [isOnSubmit, type]);

  const nextButton = (row) => {
    setName(row.event_number);
    navigate(`/holatlar/${row.id}`);
  };

  const handlePageChange = (event, newPage) => {
    setPage(newPage);
  };

  const handleRowsPerPageChange = (newRowsPerPage) => {
    setRowsPerPage(newRowsPerPage);
    setPage(0);
  };

  const handleSuccess = () => {
    navigate("/maxsulotlar");
    openProductModal();
  };

  return (
    <>
      <div className="flex flex-wrap items-center justify-between gap-3 !mb-1 sm:flex-nowrap sm:gap-0 sm:mb-1">
        <p className="text-lg sm:text-xl text-[#249B73] uppercase font-semibold">
          Mavjud yuk xatlar ro'yxati
        </p>
        <button
          onClick={onOpen}
          className="flex items-center gap-2 bg-[#249B73] text-white px-4 py-2 rounded-md hover:bg-[#1d7d5d] transition duration-200 text-sm sm:text-base"
        >
          <CirclePlus className="w-5 h-5" />
          <span>Yangi qo'shish</span>
        </button>
      </div>

      {loading ? (
        <div className="text-center text-gray-500">
          <CircularProgress color="success" />
        </div>
      ) : (
        <GlobalTable
          columns={columns}
          rows={rows}
          page={page}
          rowsPerPage={rowsPerPage}
          total={pageTotal}
          onPageChange={handlePageChange}
          onRowsPerPageChange={handleRowsPerPageChange}
          onRowClick={handleRowClick} // Qator bosish hodisasi
        />
      )}

      {pageTotal === 0 && !loading && (
        <Box textAlign="center" py={10} sx={{ userSelect: "none" }}>
          <Box
            component="img"
            src={NoData}
            alt="No data"
            sx={{ width: 128, height: 128, margin: "0 auto", mb: 2 }}
          />
          <Typography variant="body1" color="text.secondary">
            Hech qanday ma'lumot topilmadi
          </Typography>
        </Box>
      )}

      <IsAddProduct />
      <EventsModal setConfirm={setConfirm} />
      <ConfirmationModal
        isOpen={confirm.open}
        onClose={() => setConfirm((prev) => ({ ...prev, open: false }))}
        onConfirm={confirm.id ? handleDelete : handleSuccess}
        message={confirm.message}
      />
    </>
  );
}
