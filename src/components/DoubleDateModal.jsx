import React, { useEffect, useState } from "react";
import { Box, Button, Modal, TextField } from "@mui/material";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import dayjs from "dayjs";
import { useDateFilterStore } from "../hooks/useFilterStore";
import { Calendar } from "lucide-react";
import { format } from "date-fns";

const DoubleDateModal = ({ title }) => {
  const [open, setOpen] = useState(false);
  const { setEndDate, setStartDate, startDate, endDate } = useDateFilterStore();
  const [stateStartDate, setStateStartDate] = useState(null);
  const [stateEndDate, setStateEndDate] = useState(null);

  const handleOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);

  useEffect(() => {
    setStateStartDate(dayjs());
    setStateEndDate(dayjs().add(1, "day"));
  }, []);

  const handleSubmit = () => {
    const formattedStart = format(stateStartDate, "dd-MM-yyyy");
    const formattedEnd = format(stateEndDate, "dd-MM-yyyy");
    setStartDate(formattedStart);
    setEndDate(formattedEnd);
    handleClose();
  };

  return (
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      <Box>
        <div
          className="cursor-pointer flex gap-3 items-center w-[150px]"
          onClick={handleOpen}
        >
          {startDate && endDate ? (
            <div className="text-sm text-gray-600 mt-2">
              <span className="font-semibold">{startDate}</span> —{" "}
              <span className="font-semibold">{endDate}</span>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <p>{title}</p>
              <Calendar size={18} />
            </div>
          )}
        </div>

        <Modal
          open={open}
          onClose={handleClose}
          BackdropProps={{
            style: { backgroundColor: "rgba(0, 0, 0, 0.4)" }, // bu esa qorong‘iroq
          }}
        >
          <Box
            sx={{
              position: "absolute",
              top: "50%",
              left: "50%",
              transform: "translate(-50%, -50%)",
              width: 600,
              maxWidth: "90vw", // bu ekran chegarasidan chiqmasligi uchun
              bgcolor: "background.paper",
              boxShadow: 24,
              outline: "none",
              p: 4,
              borderRadius: 2,
              "@media (max-width: 630px)": {
                width: "90%",
                p: 4,
              },
            }}
          >
            <Box
              sx={{
                display: "flex",
                justifyContent: "space-between",
                gap: 2,
                mb: 3,
                "@media (max-width: 400px)": {
                  flexDirection: "column",
                },
              }}
            >
              <DatePicker
                label="Boshlanish sanasi"
                value={stateStartDate}
                onChange={(newValue) => setStateStartDate(newValue)}
                renderInput={(params) => <TextField {...params} fullWidth />}
              />

              <DatePicker
                label="Tugash sanasi"
                value={stateEndDate}
                onChange={(newValue) => setStateEndDate(newValue)}
                renderInput={(params) => <TextField {...params} fullWidth />}
              />
            </Box>

            <Box sx={{ display: "flex", justifyContent: "flex-end", gap: 2 }}>
              <button
                className="text-white cursor-pointer w-[150px] bg-[#249B73] px-5 py-1.5 rounded-md"
                onClick={handleSubmit}
              >
                Yopish
              </button>
            </Box>
          </Box>
        </Modal>
      </Box>
    </LocalizationProvider>
  );
};

export default DoubleDateModal;
