import React, { useEffect, useRef, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Box, CircularProgress, Typography } from "@mui/material";
import { ArrowRightFromLine } from "lucide-react";
import { format } from "date-fns";

import $api from "../../http/api";
import GlobalTable from "../../components/global-table";
import MibSelector from "../../components/mib-location";
import SudSelector from "../../components/sud-location";
import DoubleDateModal from "../../components/DoubleDateModal";
import StatusSelector from "../../components/status-selector";

import NoData from "../../assets/no-data.png";
import { getStatusStyle } from "../../utils/status";
import {
  useDateFilterStore,
  useMibStore,
  useStatusFilterStore,
  useSudStore,
} from "../../hooks/useFilterStore";

export default function EgasigaQaytarilgan() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const searchQuery = searchParams.get("search");
  const prevSearchQuery = useRef(searchQuery);
  const { setValue, setId } = useStatusFilterStore();

  // 1. Get `page` and `limit` from URL
  const urlPage = parseInt(searchParams.get("page")) || 0;
  const urlLimit = parseInt(searchParams.get("limit")) || 100;
  const { id: mibId } = useMibStore();
  const { id: sudId } = useSudStore();
  const { startDate, endDate } = useDateFilterStore();

  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);

  const [pagination, setPagination] = useState({
    page: urlPage,
    rowsPerPage: urlLimit,
    total: 0,
    currentPage: urlPage + 1,
  });

  const columns = [
    { field: "id", headerName: "№" },
    { field: "event_number", headerName: "Yuk xati raqami" },
    { field: "mib_number", headerName: "MIB ning dalolatnoma raqami" },
    {
      field: "mib_region",
      headerName: <MibSelector title="MIB ning hududi" />,
    },
    { field: "sud_number", headerName: "Sudning ijro varaqa no'meri" },
    {
      field: "sud_region",
      headerName: <SudSelector title="Sudning hududi" />,
    },
    {
      field: "sud_date",
      headerName: <DoubleDateModal title="Sudning sanasi" />,
    },
    {
      field: "status",
      headerName: <StatusSelector />,
    },
    { field: "actions", headerName: "Tahrirlash" },
  ];

  const fetchData = async () => {
    try {
      setLoading(true);
      const res = await $api.get(
        "/statuses/products/by/ea2d9a99-0e0b-41ba-bf8b-d77e9b24bd4b",
        {
          params: {
            page: pagination.currentPage,
            limit: pagination.rowsPerPage,
            search: searchQuery,
            mibId: mibId || "",
            sudId: sudId || "",
            startDate: startDate || "",
            endDate: endDate || "",
          },
        }
      );
      setData(res.data.data.data || []);
      setPagination((prev) => ({
        ...prev,
        total: res.data.data.pagination.totalItems || 0,
      }));
    } catch (error) {
      console.error("Ma'lumotlarni olishda xatolik:", error);
    } finally {
      setLoading(false);
    }
  };

  // 2. Fetch data when pagination or search changes
  useEffect(() => {
    fetchData();
  }, [pagination.page, pagination.rowsPerPage, searchQuery, sudId, mibId, startDate, endDate]);

  // 3. Reset to page 0 when search changes, and update URL
  useEffect(() => {
    if (prevSearchQuery.current !== searchQuery) {
      prevSearchQuery.current = searchQuery;

      setPagination((prev) => ({ ...prev, page: 0, currentPage: 1 }));

      setSearchParams({
        page: 0,
        limit: pagination.rowsPerPage,
        search: searchQuery || "",
      });
    }
  }, [searchQuery]);

  // 4. Change page and update URL
  const handlePageChange = (_, newPage) => {
    setPagination((prev) => ({
      ...prev,
      page: newPage,
      currentPage: newPage + 1,
    }));

    setSearchParams({
      page: newPage,
      limit: pagination.rowsPerPage,
      search: searchQuery || "",
    });
  };

  // 5. Change limit and update URL
  const handleRowsPerPageChange = (value) => {
    const newLimit = parseInt(value);
    setPagination({
      page: 0,
      rowsPerPage: newLimit,
      currentPage: 1,
      total: pagination.total,
    });

    setSearchParams({
      page: 0,
      limit: newLimit,
      search: searchQuery || "",
    });
  };

  const handleNext = (id) => {
    navigate(`/holatlar/${id}`);
    setValue("Egasiga qaytarildi");
    setId("ea2d9a99-0e0b-41ba-bf8b-d77e9b24bd4b");
  };

  const rows = data.map((row, index) => {
    const doc = row.document_product?.[row.document_product.length - 1] || {};
    return {
      id: index + 1 + pagination.page * pagination.rowsPerPage,
      name: row.name || "Noma’lum",
      event_number: "#" + (row.event_product?.event_number || "Noma’lum"),
      mib_region: doc.mib_document?.name || "Yo'q",
      mib_number: doc.mib_dalolatnoma || "Yo'q",
      sud_number: doc.sud_dalolatnoma || "Yo'q",
      sud_region: doc.sud_document?.name || "Yo'q",
      sud_date: doc.sud_date
        ? format(new Date(doc.sud_date), "dd-MM-yyyy")
        : "Yo'q",
      total_price: row.total_price || "0",
      status: (
        <span
          className={`ml-2 text-xs font-medium px-2 py-0.5 rounded-full ${getStatusStyle(
            row.statusProduct?.product_status
          )}`}
        >
          {row.statusProduct?.product_status}
        </span>
      ),
      actions: (
        <div>
          <button
            className="w-7 h-7 flex items-center justify-center rounded-full border border-gray-400 cursor-pointer"
            onClick={() => handleNext(row.event_product?.id)}
          >
            <ArrowRightFromLine size={16} />
          </button>
        </div>
      ),
    };
  });

  return (
    <div>
      <div className="flex items-center justify-between mb-5">
        <p className="text-xl text-[#249B73] uppercase font-semibold">
          Egasiga qaytarilgan yuk xatlar ro'yxati
        </p>
      </div>

      {loading ? (
        <div className="text-center text-gray-500">
          <CircularProgress color="success" />
        </div>
      ) : (
        <GlobalTable
          columns={columns}
          rows={rows}
          page={pagination.page}
          rowsPerPage={pagination.rowsPerPage}
          total={pagination.total}
          onPageChange={handlePageChange}
          onRowsPerPageChange={handleRowsPerPageChange}
        />
      )}

      {data.length === 0 && (
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
    </div>
  );
}
