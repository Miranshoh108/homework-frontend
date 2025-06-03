import React from "react";
import { useLocationFilterStore } from "../hooks/useFilterStore";

export const locations = [
  { id: 1, nomi: "Toshkent shahri" },
  { id: 2, nomi: "Toshkent viloyati" },
  { id: 3, nomi: "Andijon" },
  { id: 4, nomi: "Farg‘ona" },
  { id: 5, nomi: "Namangan" },
  { id: 6, nomi: "Sirdaryo" },
  { id: 7, nomi: "Jizzax" },
  { id: 8, nomi: "Samarqand" },
  { id: 9, nomi: "Qashqadaryo" },
  { id: 10, nomi: "Surxondaryo" },
  { id: 11, nomi: "Buxoro" },
  { id: 12, nomi: "Navoiy" },
  { id: 13, nomi: "Xorazm" },
  { id: 14, nomi: "Qoraqalpog‘iston Respublikasi" },
];

const LocationSelector = () => {
  const { setValue, id, setId } = useLocationFilterStore();

  const handleLocationChange = (e) => {
    const selectedId = parseInt(e.target.value);
    const selectedLocation = locations.find(
      (location) => location.id === selectedId
    );

    if (selectedLocation) {
      setValue(selectedLocation.nomi); // nomi ni yuboramiz
      setId(selectedLocation.id);
    } else {
      setValue("");
      setId(null);
    }
  };

  return (
    <div className="location-selector">
      <select
        id="global-location"
        value={id || ""}
        onChange={handleLocationChange}
        className="location-dropdown outline-none"
      >
        <option hidden value="">
          Joylashuvi
        </option>
        {locations.map((location) => (
          <option key={location.id} value={location.id}>
            {location.nomi}
          </option>
        ))}
      </select>
    </div>
  );
};

export default LocationSelector;
