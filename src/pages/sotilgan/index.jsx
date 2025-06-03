import { ArrowRightFromLine } from "lucide-react";
import React, { useEffect, useState } from "react";
import GlobalTable from "../../components/global-table";
import { useNavigate, useSearchParams } from "react-router-dom";
import $api from "../../http/api";
import NoData from "../../assets/no-data.png";
import { Box, CircularProgress, Typography } from "@mui/material";
import { getStatusStyle } from "../../utils/status";
import { format } from "date-fns";
import { useStatusFilterStore } from "../../hooks/useFilterStore";

export default function Sotilgan() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  // URL-dan current page va search so‘rovini o‘qiymiz
  const searchQuery = searchParams.get("search") || "";
  const initialPage = parseInt(searchParams.get("page")) || 0;

  const { setValue, setId } = useStatusFilterStore();

  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);

  const [pagination, setPagination] = useState({
    page: initialPage,         // 0-based MUI paginatsiya uchun
    rowsPerPage: 100,
    total: 0,
    currentPage: initialPage + 1, // 1-based API uchun
  });

  // Jadval ustunlari
  const columns = [
    { field: "id", headerName: "№" },
    { field: "event_number", headerName: "Yuk xati raqami" },
    { field: "mib_number", headerName: "MIB ning dalolatnoma raqami" },
    { field: "mib_region", headerName: "MIB ning hududi" },
    { field: "sud_number", headerName: "Sudning ijro varaqa no'meri" },
    { field: "sud_region", headerName: "Sudning hududi" },
    { field: "sud_date", headerName: "Sudning sanasi" },
    { field: "total_price", headerName: "Umumiy narxi" },
    { field: "status", headerName: "Status" },
    { field: "actions", headerName: "Taxrirlash" },
  ];

  // Ma'lumotlarni olish funksiyasi
  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await $api.get(
        "/statuses/products/by/3cb7247b-88b9-4769-bbfa-47341e339b89",
        {
          params: {
            page: pagination.currentPage,
            limit: pagination.rowsPerPage,
            search: searchQuery,
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

  // Ma'lumotlarni sahifa, rowsPerPage yoki qidiruv o‘zgarganda olish
  useEffect(() => {
    fetchData();
  }, [pagination.page, pagination.rowsPerPage, searchQuery]);

  // Sahifa o‘zgarganda URL paramsni yangilash va paginationni set qilish
  const handlePageChange = (event, newPage) => {
    setPagination((prev) => ({
      ...prev,
      page: newPage,
      currentPage: newPage + 1,
    }));

    setSearchParams((params) => {
      params.set("page", newPage);
      if (searchQuery) {
        params.set("search", searchQuery);
      }
      return params;
    });
  };

  // Rows per page o‘zgarganda ham shunga o‘xshash yangilash
  const handleRowsPerPageChange = (value) => {
    const newRowsPerPage = parseInt(value);
    setPagination({
      page: 0,
      rowsPerPage: newRowsPerPage,
      currentPage: 1,
      total: pagination.total,
    });

    setSearchParams((params) => {
      params.set("page", 0);
      if (searchQuery) {
        params.set("search", searchQuery);
      }
      return params;
    });
  };

  // "Keyingi" tugma bosilganda navigatsiya va filter store'ga yozish
  const handleNext = (id) => {
    navigate(`/holatlar/${id}`);
    setValue("Sotilgan");
    setId("3cb7247b-88b9-4769-bbfa-47341e339b89");
  };

  // Jadvalga kerakli formatda ma'lumot tayyorlash
  const rows = data.map((row, index) => ({
    id: index + 1 + pagination.page * pagination.rowsPerPage,
    name: row.name || "Noma’lum",
    event_number: "#" + `${row.event_product?.event_number}` || "Noma’lum",
    mib_region:
      row.document_product[row.document_product.length - 1]?.mib_document
        ?.name || "Yo'q",
    mib_number:
      row.document_product[row.document_product.length - 1]?.mib_dalolatnoma || "Yo'q",
    sud_number:
      row.document_product[row.document_product.length - 1]?.sud_dalolatnoma || "Yo'q",
    sud_region:
      row.document_product[row.document_product.length - 1]?.sud_document
        ?.name || "Yo'q",
    sud_date: row.document_product[row.document_product.length - 1]?.sud_date
      ? format(
          new Date(row.document_product[row.document_product.length - 1]?.sud_date),
          "dd-MM-yyyy"
        )
      : "Noma’lum",
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
          Mavjud sotilgan yuk xatlari ro'yxati
        </p>
      </div>

      {loading ? (
        <div className="text-center text-gray-500">
          <CircularProgress color="success" />
        </div>
      ) : data.length === 0 ? (
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
    </div>
  );
}
