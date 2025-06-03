import { create } from "zustand";

// export const useStatusFilterStore = create((set) => ({
//   value: "",
//   id: null,
//   setId: (id) => set({ id }),
//   setValue: (val) => set({ value: val }),
// }));

export const useStatusFilterStore = create((set) => ({
  value: "",
  id: null,
  setValue: (value) => set({ value }),
  setId: (id) => set({ id }),
}));

export const useLocationFilterStore = create((set) => ({
  value: "",
  id: null,
  setId: (id) => set({ id }),
  setValue: (val) => set({ value: val }),
}));

export const useShipperFilterStore = create((set) => ({
  value: "",
  id: null,
  setId: (id) => set({ id }),
  setValue: (val) => set({ value: val }),
}));

export const useProductTypeFilterStore = create((set) => ({
  value: "",
  id: null,
  setId: (id) => set({ id }),
  setValue: (val) => set({ value: val }),
}));

export const useSortFilterStore = create((set) => ({
  field: null,
  grow: true,
  setField: (id) => set({ field: id }),
  toggleGrow: () => set((store) => ({ grow: !store.grow })),
}));

export const useDateFilterStore = create((set) => ({
  startDate: null, // bu yerga string emas, Date saqlaymiz
  endDate: null,
  setStartDate: (date) => set({ startDate: date }),
  setEndDate: (date) => set({ endDate: date }),
}));

export const useMibStore = create((set) => ({
  value: "",
  id: null,
  setValue: (val) => set({ value: val }),
  setId: (id) => set({ id }),
}));

export const useSudStore = create((set) => ({
  value: "",
  id: null,
  setValue: (val) => set({ value: val }),
  setId: (id) => set({ id }),
}));
