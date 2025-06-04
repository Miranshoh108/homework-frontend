import React, { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import GlobalTable from "../../components/global-table";
import $api from "../../http/api";
import NoData from "../../assets/no-data.png";
import { Box, CircularProgress, Typography } from "@mui/material";
import { format } from "date-fns";
import { ArrowRightFromLine } from "lucide-react";
import { getStatusStyle } from "../../utils/status";
import {
  useDateFilterStore,
  useMibStore,
  useStatusFilterStore,
  useSudStore,
} from "../../hooks/useFilterStore";
import MibSelector from "../../components/mib-location";
import SudSelector from "../../components/sud-location";
import DoubleDateModal from "../../components/DoubleDateModal";

export default function YoqQilingan() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  const { setValue, setId } = useStatusFilterStore();

  // URL dan page va rowsPerPage olish (default qiymatlar)
  const initialPage = parseInt(searchParams.get("page")) || 0; // 0-based
  const initialRowsPerPage = parseInt(searchParams.get("rowsPerPage")) || 100;
  const searchQuery = searchParams.get("search") || "";

  const { id: mibId } = useMibStore();
  const { id: sudId } = useSudStore();
  const { startDate, endDate } = useDateFilterStore();

  const [pagination, setPagination] = useState({
    page: initialPage,
    rowsPerPage: initialRowsPerPage,
    total: 0,
    currentPage: initialPage + 1, // API uchun 1-based
  });

  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);

  // URL dagi page, rowsPerPage, search o'zgarganda pagination state-ni moslashtirish
  useEffect(() => {
    setPagination((prev) => ({
      ...prev,
      page: initialPage,
      rowsPerPage: initialRowsPerPage,
      currentPage: initialPage + 1,
    }));
  }, [initialPage, initialRowsPerPage]);

  // Pagination o'zgarganda URL ga yozamiz
  useEffect(() => {
    setSearchParams((prev) => {
      const params = new URLSearchParams(prev.toString());
      params.set("page", pagination.page.toString());
      params.set("rowsPerPage", pagination.rowsPerPage.toString());
      if (searchQuery) params.set("search", searchQuery);
      else params.delete("search");
      return params;
    });
  }, [pagination.page, pagination.rowsPerPage, searchQuery, setSearchParams]);

  // Ma'lumotlarni olish funksiyasi
  const fetchData = async () => {
    try {
      setLoading(true);
      const res = await $api.get(
        "/statuses/products/by/ed207621-3867-4530-8886-0fa434dedc19",
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
      console.log(res);

      setData(res.data.data.data);
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

  // page, rowsPerPage yoki searchQuery o'zgarganda ma'lumotlarni qayta yuklash
  useEffect(() => {
    fetchData();
  }, [
    pagination.page,
    pagination.rowsPerPage,
    searchQuery,
    sudId,
    mibId,
    startDate,
    endDate,
  ]);

  // Sahifa o'zgarganda
  const handlePageChange = (event, newPage) => {
    setPagination((prev) => ({
      ...prev,
      page: newPage,
      currentPage: newPage + 1,
    }));
  };

  // Rows per page o'zgarganda
  const handleRowsPerPageChange = (value) => {
    const newRowsPerPage = parseInt(value);
    setPagination({
      page: 0,
      rowsPerPage: newRowsPerPage,
      total: pagination.total,
      currentPage: 1,
    });
  };

  // "Keyingi" tugmasi bosilganda
  const handleNext = (id) => {
    navigate(`/holatlar/${id}`);
    setValue("Yo'q qilindi");
    setId("ed207621-3867-4530-8886-0fa434dedc19");
  };

  // Jadval uchun rows tayyorlash
  // Jadval uchun rows tayyorlash
  const rows = data.map((row, index) => {
    const lastDestroyed =
      row.destroyed_product?.[row.destroyed_product.length - 1];

    return {
      id: index + 1 + pagination.page * pagination.rowsPerPage,
      name: row.name || "Noma’lum",
      event_number: "#" + `${row.event_product?.event_number}` || "Noma’lum",
      mib_region: lastDestroyed?.mib_destroyed_product?.name || "Yo'q",
      mib_number: lastDestroyed?.mib_dalolatnoma || "Yo'q",
      sud_number: lastDestroyed?.sud_dalolatnoma || "Yo'q",
      sud_region: lastDestroyed?.sud_destroyed_product?.name || "Yo'q",
      sud_date: lastDestroyed?.sud_date
        ? format(new Date(lastDestroyed.sud_date), "dd-MM-yyyy")
        : "Noma'lum",
      date_destroyed: lastDestroyed?.date_destroyed
        ? format(new Date(lastDestroyed.date_destroyed), "dd-MM-yyyy")
        : "Noma'lum",
      total_price: row.total_price || "0",
      status: (
        <span
          className={`ml-2 text-xs font-medium px-2 py-0.5 rounded-full ${getStatusStyle(
            row.statusProduct?.product_status || "Noma'lum"
          )}`}
        >
          {row.statusProduct?.product_status || "Noma'lum"}
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
    };
  });

  //  const columns = [
  //   { field: "index", headerName: "№" },
  //   { field: "event_number", headerName: "Yuk xati raqami", vector: true },
  //   {
  //     field: "date",
  //     headerName: <DoubleDateModal title={"Yuk xati sanasi"} />,
  //   },
  //   {
  //     field: "productsCount",
  //     headerName: (
  //       <div
  //         onClick={() => handleSort("productsCount")}
  //         className="flex items-center justify-between cursor-pointer"
  //       >
  //         <span>Maxsulotlar turining soni</span>
  //       </div>
  //     ),
  //     vector: true,
  //   },
  //   {
  //     field: "totalQuantity",
  //     headerName: (
  //       <div
  //         onClick={() => handleSort("totalQuantity")}
  //         className="flex items-center justify-between cursor-pointer"
  //       >
  //         <span>Umumiy mahsulotlar soni</span>
  //       </div>
  //     ),
  //     vector: true,
  //   },
  //   {
  //     field: "shipperName",
  //     headerName: <ShipperSelector />,
  //   },
  //   {
  //     field: "status",
  //     headerName: <StatusSelector />,
  //   },
  //   { field: "actions", headerName: "Taxrirlash" },
  // ];

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
      headerName: <DoubleDateModal title="Sudning sanasi" />,
    },
    {
      field: "date_destroyed",
      headerName: <DoubleDateModal title="Yo‘q qilingan sana" />,
    },
    { field: "status", headerName: "Status" },
    { field: "actions", headerName: "Taxrirlash" },
  ];

  return (
    <div>
      <div className="flex items-center justify-between mb-5">
        <p className="text-xl text-[#249B73] uppercase font-semibold">
          mavjud Yo'q qilingan yuk xatlar
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
