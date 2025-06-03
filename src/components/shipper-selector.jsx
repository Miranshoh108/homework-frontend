import React, { useState, useEffect } from "react";
import $api from "../http/api";
import { useShipperFilterStore } from "../hooks/useFilterStore";

const ShipperSelector = ({ onStatusChange }) => {
  const [statuses, setStatuses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const { setValue, id, setId } = useShipperFilterStore();

  useEffect(() => {
    const fetchStatuses = async () => {
      try {
        const response = await $api.get("/shipper/all?limit=200");
        if (response.status === 200) {
          setStatuses(response.data.shippers);
          setLoading(false);
        }
      } catch (err) {
        setError("Failed to load statuses");
        setLoading(false);
        console.error("Error fetching statuses:", err);
      }
    };

    fetchStatuses();
  }, []);

  // Select value holatini aniqlash
  const getSelectValue = () => {
    if (id === null && !statuses.find((s) => s.id === null)) return "null"; // "Barchasi" tanlangan
    if (id === null) return ""; // default
    return id;
  };

  const handleStatusChange = (e) => {
    const selectedValue = e.target.value;

    if (selectedValue === "") {
      // Default holat: Yetkazib beruvchi
      setValue("");
      setId(null);
      if (onStatusChange) onStatusChange({ id: null, status: "" });
      return;
    }

    if (selectedValue === "null") {
      // Barchasi tanlangan
      setValue("Yetkazib beruvchi");
      setId(null);
      if (onStatusChange) onStatusChange({ id: null, status: "Barchasi" });
      return;
    }

    const selectedStatus = statuses.find(
      (status) => status.id.toString() === selectedValue
    );

    if (selectedStatus) {
      setValue(selectedStatus.name);
      setId(selectedStatus.id);
      if (onStatusChange)
        onStatusChange({
          id: selectedStatus.id,
          status: selectedStatus.name,
        });
    }
  };

  if (loading) return <div>Loading statuses...</div>;
  if (error) return <div>{error}</div>;

  return (
    <div className="status-selector">
      <select
        id="global-status"
        value={getSelectValue()}
        onChange={handleStatusChange}
        className="status-dropdown outline-none"
      >
        <option value="">Barchasi</option>
        <option hidden value="null">Yetkazib beruvchi</option>
        {statuses
          .filter((status) => status.id !== null)
          .map((status) => (
            <option key={status.id} value={status.id}>
              {status.name}
            </option>
          ))}
      </select>
    </div>
  );
};

export default ShipperSelector;
