import { useState } from "react";
import type { Building, House } from "../../types/types";
import { useHouses } from "../../hooks/useHouses";

type HouseCardsProps = {
  house: House;
  Buildings: Building[];
};

export default function HouseCard({ Buildings, house }: HouseCardsProps) {
  const { UpdateHouse, RemoveHouse } = useHouses();

  const InitialValue: House = {
    nb_bedrooms: house.nb_bedrooms || NaN,
    nb_bathrooms: house.nb_bathrooms || NaN,
    floor: house.floor || NaN,
    building_id: house.building_id || NaN,
  };

  const [HouseInput, setHouseInput] = useState<House>(InitialValue);
  const [EditMode, setEditMode] = useState<boolean>(false);

  async function handleEdit(houseId: House["id"]) {
    const updatedHouse: House = {
      nb_bedrooms: HouseInput.nb_bedrooms,
      nb_bathrooms: HouseInput.nb_bathrooms,
      floor: HouseInput.floor,
      building_id: HouseInput.building_id,
    };

    const ok = await UpdateHouse(updatedHouse, houseId);

    if (ok) setEditMode(false);
  }

  async function handleDelete(houseId: House["id"]) {
      const ok = await RemoveHouse(houseId);
  
      if (ok) return alert("Building has been deleted");
    }

  return (
    <div
      className="bg-white text-black flex flex-col justify-center items-center gap-2.5 text-center p-4 rounded-2xl"
      key={house.id}
    >
      <div className="flex flex-col flex-wrap justify-center items-center gap-2.5">
        <p>
          <strong>House Floor: </strong>{" "}
          {EditMode ? (
            <input
              type="text"
              className="border border-black rounded disabled:cursor-not-allowed size-full"
              value={HouseInput.floor}
              onChange={(event) => {
                setHouseInput((prev) => ({
                  ...prev,
                  floor: parseInt(event.target.value.trim()),
                }));
              }}
            />
          ) : (
            house.floor
          )}
        </p>
        <p>
          <strong>Number of Bathrooms: </strong>
          {EditMode ? (
            <input
              type="text"
              className="border border-black rounded disabled:cursor-not-allowed size-full"
              value={HouseInput.floor}
              onChange={(event) => {
                setHouseInput((prev) => ({
                  ...prev,
                  nb_bathrooms: parseInt(event.target.value.trim()),
                }));
              }}
            />
          ) : (
            house.nb_bathrooms
          )}
        </p>
        <p>
          <strong>Number of Bedrooms: </strong>
          {EditMode ? (
            <input
              type="text"
              className="border border-black rounded disabled:cursor-not-allowed size-full"
              value={HouseInput.floor}
              onChange={(event) => {
                setHouseInput((prev) => ({
                  ...prev,
                  nb_bedrooms: parseInt(event.target.value.trim()),
                }));
              }}
            />
          ) : (
            house.nb_bedrooms
          )}
        </p>
        <p>
          {EditMode ? (
            <>
              <strong>Select a Project: </strong>
              <select
                value={HouseInput.building_id}
                className="border border-black rounded cursor-pointer disabled:cursor-not-allowed size-full"
                onChange={(event) => {
                  setHouseInput((prev) => ({
                    ...prev,
                    building_id: parseInt(event.target.value),
                  }));
                }}
              >
                {Buildings.map((Building) => (
                  <option value={Building.id} key={Building.id}>
                    {Building.name}
                  </option>
                ))}
              </select>
            </>
          ) : (
            <>
              <strong>Building Name: </strong>
              {
                Buildings.find((building) => building.id === house.building_id)
                  ?.name
              }
            </>
          )}
        </p>
        {!EditMode && (
          <p>
            <strong>House Added At: </strong> {house.added_at?.split("T")[0]}
          </p>
        )}
      </div>
      <button
        type="button"
        className="bg-black text-white py-2 px-4 rounded-lg cursor-pointer"
        onClick={() => {
          if (EditMode) return handleEdit(house.id);
          return setEditMode((prev) => !prev);
        }}
      >
        {EditMode ? "Submit Edits" : "Edit House"}
      </button>
      <button
        type="button"
        className="bg-black text-white py-2 px-4 rounded-lg cursor-pointer"
        onClick={() => {
          handleDelete(house.id);
        }}
      >
        Delete House
      </button>
    </div>
  );
}
