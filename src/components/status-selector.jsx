import React, { useState, useEffect } from "react";
import $api from "../http/api";
import { useStatusFilterStore } from "../hooks/useFilterStore";

const StatusSelector = () => {
  const [statuses, setStatuses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const { setValue, id, setId } = useStatusFilterStore();

  useEffect(() => {
    const fetchStatuses = async () => {
      try {
        const response = await $api.get("/statuses/all");
        if (response.status === 200) {
          const allStatuses = [
            { id: null, product_status: "Barchasi" },
            ...response.data.status,
          ];
          setStatuses(allStatuses);
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

  const handleStatusChange = (e) => {
    e.preventDefault(); 

    const selectedId = e.target.value === "null" ? null : e.target.value;
    const selectedStatus = statuses.find(
      (status) =>
        (status.id === null ? null : status.id.toString()) === selectedId
    );

    if (selectedStatus) {
      if (selectedStatus.id === null) {
        setValue("");
        setId(null);
      } else {
        setValue(selectedStatus.product_status);
        setId(selectedStatus.id);
      }
    }
  };

  if (loading) {
    return <div>Loading statuses...</div>;
  }

  if (error) {
    return <div>{error}</div>;
  }

  return (
    <div className="status-selector">
      <select
        id="global-status"
        value={id !== null ? id : ""} 
        onChange={handleStatusChange}
        className="status-dropdown outline-none"
      >
        <option value="" disabled hidden>
          Status
        </option>
        {statuses.map((status) => (
          <option
            key={status.id !== null ? status.id : "all"}
            value={status.id !== null ? status.id : "null"}
          >
            {status.product_status}
          </option>
        ))}
      </select>
    </div>
  );
};

export default StatusSelector;
