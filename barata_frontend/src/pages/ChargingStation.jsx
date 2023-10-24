import TableView from "/src/components/table/TableView";
import { useState } from 'react';
import { useOutletContext } from "react-router-dom";

export default function chargingStationView() {
  const [bookData, chargingstationData] = useOutletContext()
  const groupAndSumData = (data, selectedVar) => {
    return data.reduce((acc, item) => {
      const csName = item.data.data.name
      const location = item.data.data.location
      const csId = item.data.csId
      const provinsi = item.data.provinsi;
      const totalPrice = item.data.totalPrice
      const totalDuration = item.data.duration
      const totalCustomer = item.customer
      const status = item.data.data.status
      if (selectedVar == "provinsi") {
        const existingprovinsi = acc.findIndex((accItem) => accItem.provinsi === provinsi);
        if (existingprovinsi !== -1) {
          acc[existingprovinsi].totalPrice += totalPrice;
          acc[existingprovinsi].totalDuration += totalDuration;
          acc[existingprovinsi].totalCustomer += totalCustomer;
        } else {
          acc.push({ csId, provinsi, totalPrice, totalDuration, totalCustomer });
        }
        return acc;
      } else if (selectedVar == "csId") {
        const existingcsId = acc.findIndex((accItem) => accItem.csId === csId);
        if (existingcsId !== -1) {
          acc[existingcsId].totalPrice += totalPrice;
          acc[existingcsId].totalDuration += totalDuration;
          acc[existingcsId].totalCustomer += totalCustomer;
        } else {
          acc.push({ csId, provinsi, totalPrice, totalDuration, totalCustomer, location, csName, status });
        }
        return acc;
      }
    }, []);
  };
  const combinedData = bookData.map((item1) => {
    const matchingItem = chargingstationData.find((item2) => item2.data.csId === item1.data.csId);
    const mergedData = { ...item1.data, ...matchingItem };
    return { data: mergedData };
  });

  const province = combinedData
    .map(item => {
      const provinsi = item.data.data.location.split(", ").slice(-2)[0];
      item.data.provinsi = provinsi;
      return { data: item.data };
    });

  const addColumn = data => {
    return data.map(user => ({ ...user, customer: 1 }));
  };

  const csData = addColumn(province)
  const totalData = groupAndSumData(csData, "csId")
  totalData.forEach(item => {
    if (item.status === "aktif") {
      item.deltaType = "increase";
    } else if (item.status === "tidak aktif") {
      item.deltaType = "decrease";
    } else {
      item.deltaType = "unchanged";
    }
  });

  const provinces = [
    "Aceh",
    "Sumatera Utara",
    "Sumatera Selatan",
    "Sumatera Barat",
    "Bengkulu",
    "Riau",
    "Kepulauan Riau",
    "Jambi",
    "Lampung",
    "Bangka Belitung",
    "Kalimantan Barat",
    "Kalimantan Timur",
    "Kalimantan Selatan",
    "Kalimantan Tengah",
    "Kalimantan Utara",
    "Banten",
    "DKI Jakarta",
    "Jawa Barat",
    "Jawa Tengah",
    "DI Yogyakarta",
    "Jawa Timur",
    "Bali",
    "Nusa Tenggara Timur",
    "Nusa Tenggara Barat",
    "Gorontalo",
    "Sulawesi Barat",
    "Sulawesi Tengah",
    "Sulawesi Utara",
    "Sulawesi Tenggara",
    "Sulawesi Selatan",
    "Maluku Utara",
    "Maluku",
    "Papua Barat",
    "Papua",
    "Papua Selatan",
    "Papua Tengah",
    "Papua Pegunungan",
    "Papua Barat Daya"
  ];
  return (
    <>
      <div>
        database
        <select
          className="text-sm outline-none text-black px-2 py-2 ml-3"
          id="database"
          name="database"
        >
          {provinces.map((province, index) => (
            <option key={index} value={province}>
              {province}
            </option>
          ))}
        </select>
      </div>
      <TableView
        source={totalData} />
    </>
  );
}