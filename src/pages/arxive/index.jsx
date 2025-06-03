import { ArrowRightFromLine } from "lucide-react";
import React, { useEffect, useState } from "react";
import GlobalTable from "../../components/global-table";
import { useNavigate, useSearchParams } from "react-router-dom";
import $api from "../../http/api";
import { format } from "date-fns";
import { Box, CircularProgress, Typography } from "@mui/material";
import NoData from "../../assets/no-data.png";
import { getStatusStyle } from "../../utils/status";
import { notification } from "../../components/notification";
import {
  useDateFilterStore,
  useMibStore,
  useStatusFilterStore,
  useSudStore,
} from "../../hooks/useFilterStore";
import MibSelector from "../../components/mib-location";
import SudSelector from "../../components/sud-location";
import DoubleDateModal from "../../components/DoubleDateModal";
import StatusSelector from "../../components/status-selector";

export default function Arxive() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const { setValue, setId } = useStatusFilterStore();
  const { id: mibId } = useMibStore();
  const { id: sudId } = useSudStore();
  const { startDate, endDate } = useDateFilterStore();

  // URL dan page va limit ni olib pagination uchun boshlang'ich qiymatlarni beramiz
  const initialPage = Number(searchParams.get("page"))
    ? Number(searchParams.get("page")) - 1
    : 0;
  const initialRowsPerPage = Number(searchParams.get("limit")) || 100;
  const searchQuery = searchParams.get("search") || "";

  const [pagination, setPagination] = useState({
    page: initialPage,
    rowsPerPage: initialRowsPerPage,
    currentPage: initialPage + 1,
    totalPages: 1,
    total: 0,
  });

  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);

  // Ma'lumotlarni yuklash
  useEffect(() => {
    const getAllArchive = async () => {
      try {
        setLoading(true);
        const res = await $api.get(
          `/products/get/archive?page=${pagination.page + 1}&limit=${
            pagination.rowsPerPage
          }&search=${searchQuery}`,
          {
            params: {
              mibId: mibId || "",
              sudId: sudId || "",
              startDate: startDate || "",
              endDate: endDate || "",
            },
          }
        );
        setData(res.data.products);
        setPagination((prev) => ({
          ...prev,
          currentPage: res.data.currentPage,
          total: res.data.total,
          totalPages: res.data.totalPages,
        }));
      } catch (error) {
        notification(error.response?.data?.message || "Xatolik yuz berdi");
      } finally {
        setLoading(false);
      }
    };
    getAllArchive();
  }, [
    pagination.page,
    pagination.rowsPerPage,
    searchQuery,
    sudId,
    mibId,
    startDate,
    endDate,
  ]);

  // URL parametrlarini pagination bilan sinxronlashtirish
  useEffect(() => {
    // URL ni faqat page yoki rowsPerPage o'zgarganda yangilaymiz
    setSearchParams({
      page: pagination.currentPage.toString(),
      limit: pagination.rowsPerPage.toString(),
      search: searchQuery,
    });
  }, [pagination.page, pagination.rowsPerPage, searchQuery, setSearchParams]);

  // Sahifa o'zgarishi funksiyasi
  const handlePageChange = (event, newPage) => {
    setPagination((prev) => ({
      ...prev,
      page: newPage,
      currentPage: newPage + 1,
    }));
  };

  // Har sahifadagi qatordlar soni o'zgarishi
  const handleRowsPerPageChange = (newRowsPerPage) => {
    setPagination((prev) => ({
      ...prev,
      page: 0,
      currentPage: 1,
      rowsPerPage: newRowsPerPage,
    }));
  };

  // "Taxrirlash" tugmasi bosilganda sahifani o'zgartirish
  const handleNext = (event) => {
    setValue(event?.statusProduct?.product_status);
    setId(event?.statusProduct?.id);
    navigate(`/holatlar/${event?.event_product?.id}`);
  };

  // Jadval uchun qatorlarni tayyorlash
  const rows = data.map((row, i) => {
    const statusId = row.statusProduct?.id;
    const destroyed = row.destroyed_product;
    const sales = row.sales_product;
    const documents = row.document_product;

    let lastSource = null;

    if (
      statusId === "ed207621-3867-4530-8886-0fa434dedc19" &&
      destroyed?.length
    ) {
      lastSource = destroyed[destroyed.length - 1];
    } else if (
      statusId === "3cb7247b-88b9-4769-bbfa-47341e339b89" &&
      sales?.length
    ) {
      lastSource = sales[sales.length - 1];
    } else if (documents?.length) {
      lastSource = documents[documents.length - 1];
    }

    const mibRegion =
      lastSource?.mib_document?.name ||
      lastSource?.mib_destroyed_product?.name ||
      lastSource?.mib_sales_product?.name ||
      "Noma’lum";

    const mibNumber =
      lastSource?.mib_dalolatnoma ||
      lastSource?.mib_destroyed_product?.mib_number ||
      lastSource?.mib_sales_product?.mib_number ||
      "Noma’lum";

    const sudNumber =
      lastSource?.sud_dalolatnoma ||
      lastSource?.sud_destroyed_product?.sud_dalolatnoma ||
      lastSource?.sud_sales_product?.sud_dalolatnoma ||
      "Noma’lum";

    const sudRegion =
      lastSource?.sud_document?.name ||
      lastSource?.sud_destroyed_product?.name ||
      lastSource?.sud_sales_product?.name ||
      "Noma’lum";

    const sudDate = lastSource?.sud_date
      ? format(new Date(lastSource.sud_date), "dd-MM-yyyy")
      : "Noma’lum";

    return {
      ...row,
      id: i + 1 + pagination.page * pagination.rowsPerPage,
      name: row.name || "Noma’lum",
      event_number: row.event_product?.event_number
        ? "#" + row.event_product.event_number
        : "Noma’lum",
      mib_region: mibRegion,
      mib_number: mibNumber,
      sud_number: sudNumber,
      sud_region: sudRegion,
      sud_date: sudDate,
      status: (
        <span
          className={`ml-2 text-xs font-medium px-2 py-0.5 rounded-full ${getStatusStyle(
            row.statusProduct?.product_status
          )}`}
        >
          {row.statusProduct?.product_status || "Noma’lum"}
        </span>
      ),
      actions: (
        <div>
          <button
            className="w-7 h-7 flex items-center justify-center rounded-full border border-gray-400 cursor-pointer"
            onClick={() => handleNext(row)}
          >
            <ArrowRightFromLine size={16} />
          </button>
        </div>
      ),
    };
  });

  const columns = [
    { field: "id", headerName: "№" },
    { field: "event_number", headerName: "Yuk xati raqami" },
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
    { field: "actions", headerName: "Taxrirlash" },
  ];

  return (
    <div>
      <div className="flex items-center justify-between mb-5">
        <p className="text-xl text-[#249B73] uppercase font-semibold">
          Mavjud arxivdagilar ro'yxati
        </p>
      </div>

      {loading ? (
        <div className="flex justify-center mt-10">
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

      {pagination.total === 0 && (
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
