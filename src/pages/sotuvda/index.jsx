import { ArrowRightFromLine, Pencil } from "lucide-react";
import React, { useEffect, useState } from "react";
import GlobalTable from "../../components/global-table";
import { useNavigate, useSearchParams } from "react-router-dom";
import $api from "../../http/api";
import NoData from "../../assets/no-data.png";
import { Box, CircularProgress, Typography } from "@mui/material";
import { getStatusStyle } from "../../utils/status";
import { format } from "date-fns";
import StatusSelector from "../../components/status-selector";
import {
  useDateFilterStore,
  useMibStore,
  useStatusFilterStore,
  useSudStore,
} from "../../hooks/useFilterStore";
import MibSelector from "../../components/mib-location";
import SudSelector from "../../components/sud-location";
import DoubleDateModal from "../../components/DoubleDateModal";

export default function Sotuvda() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const searchQuery = searchParams.get("search") || "";
  const { setValue, setId } = useStatusFilterStore();
  const { id } = useMibStore();
  const { id: sudId } = useSudStore();

  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(() => {
    const pageParam = parseInt(searchParams.get("page"));
    return isNaN(pageParam) || pageParam < 1 ? 0 : pageParam - 1; // 0-based indexing
  });
  const [rowsPerPage, setRowsPerPage] = useState(() => {
    const limitParam = parseInt(searchParams.get("limit"));
    return isNaN(limitParam) || limitParam < 1 ? 100 : limitParam;
  });
  const [total, setTotal] = useState(0);
  const { startDate, endDate } = useDateFilterStore();

  const columns = [
    { field: "id", headerName: "№" },
    { field: "event_number", headerName: "Yuk xati raqami", vector: true },
    { field: "mib_number", headerName: "MIB ning dalolatnoma raqami" },
    {
      field: "mib_region",
      headerName: (
        <div>
          <MibSelector title={"MIB ning hududi"} />
        </div>
      ),
    },
    { field: "sud_number", headerName: "Sudning ijro varaqa no'meri" },
    {
      field: "sud_region",
      headerName: (
        <div>
          <SudSelector title={"Sudning hududi"} />
        </div>
      ),
    },
    {
      field: "sud_date",
      headerName: (
        <div>
          <DoubleDateModal title={"Sudning sanasi"} />
        </div>
      ),
    },
    { field: "total_price", headerName: "Umumiy narxi", vector: true },
    {
      field: "status",
      headerName: "Status",
    },
    { field: "actions", headerName: "Taxrirlash" },
  ];

  const fetchData = async () => {
    const isSearching = Boolean(searchQuery);

    if (!isSearching) {
      setLoading(true); // faqat umumiy ma'lumot olayotganda loading chiqsin
    }

    try {
      const res = await $api.get(
        "/statuses/products/by/d395b9e9-c9f4-4bf3-a1b5-7dbfa1bb0783",
        {
          params: {
            page: page + 1,
            limit: rowsPerPage,
            search: searchQuery,
            mibId: id || "",
            sudId: sudId || "",
            startDate: startDate || "",
            endDate: endDate || "",
          },
        }
      );

      setData(res.data.data.data || []);
      setTotal(res.data.data.pagination.totalItems || 0);
    } catch (error) {
      console.error("Ma'lumotlarni olishda xatolik:", error);
    } finally {
      if (!isSearching) {
        setLoading(false); // faqat umumiy holatda loadingni yopamiz
      }
    }
  };

  useEffect(() => {
    fetchData();
  }, [page, rowsPerPage, searchQuery, id, sudId, startDate, endDate]);

  useEffect(() => {
    if (searchQuery) {
      const pageParam = parseInt(searchParams.get("page"));
      if (!pageParam || pageParam < 1) {
        setPage(0);
      }
    }
  }, [searchQuery, searchParams]);

  useEffect(() => {
    const newParams = new URLSearchParams(searchParams);
    newParams.set("page", (page + 1).toString()); // 1-based indexing for URL
    newParams.set("limit", rowsPerPage.toString());
    setSearchParams(newParams, { replace: true });
  }, [page, rowsPerPage, setSearchParams]);

  const handlePageChange = (event, newPage) => {
    setPage(newPage);
  };

  const handleRowsPerPageChange = (value) => {
    const newRowsPerPage = parseInt(value);
    setRowsPerPage(newRowsPerPage);
    setPage(0);
  };

  const handleNext = (id) => {
    navigate(`/holatlar/${id}`);
    setValue("Sotuvda");
    setId("d395b9e9-c9f4-4bf3-a1b5-7dbfa1bb0783");
  };

  const rows = data.map((row, index) => ({
    id: index + 1 + page * rowsPerPage,
    name: row.name || "Noma’lum",
    event_number: "#" + `${row.event_product?.event_number}` || "Noma’lum",
    mib_region:
      row.sales_product[row.sales_product.length - 1]?.mib_sales_product
        ?.name || "Yo'q",
    mib_number:
      row.sales_product[row.sales_product.length - 1]?.mib_dalolatnoma,
    sud_number:
      row.sales_product[row.sales_product.length - 1]?.sud_dalolatnoma ||
      "Yo'q",
    sud_region:
      row.sales_product[row.sales_product.length - 1]?.sud_sale_product?.name,
    sud_date:
      row.sales_product.length > 0 &&
      row.sales_product[row.sales_product.length - 1]?.sud_date
        ? format(
            new Date(row.sales_product[row.sales_product.length - 1].sud_date),
            "dd-MM-yyyy"
          )
        : "Noma'lum sana",
    total_price: Number(row.total_price).toLocaleString("en-US", {
      minimumFractionDigits: row.total_price % 1 === 0 ? 0 : 2,
      maximumFractionDigits: 2,
    }),

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
          onClick={() => handleNext(row.event_product.id)}
        >
          <ArrowRightFromLine size={16} />
        </button>
      </div>
    ),
  }));

  return (
    <div>
      <div className="flex items-center justify-between mb-5">
        <p className="text-xl text-[#249B73] uppercase font-semibold">
          Mavjud sotuvdagi yuk xatlari ro'yxati
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
          page={page}
          rowsPerPage={rowsPerPage}
          total={total}
          onPageChange={handlePageChange}
          onRowsPerPageChange={handleRowsPerPageChange}
        />
      )}

      {data.length === 0 ? (
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
      ) : null}
    </div>
  );
}
