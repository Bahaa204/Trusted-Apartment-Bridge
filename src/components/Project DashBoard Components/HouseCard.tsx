import { useState } from "react";
import type { Building, House } from "../../types/types";
import Modal from "./Modal";
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../ui/card";
import { Button } from "../ui/button";

type HouseCardsProps = {
  house: House;
  Buildings: Building[];
  UpdateHouse: (updated_house: House, houseId: House["id"]) => Promise<boolean>;
  RemoveHouse: (houseId: House["id"]) => Promise<boolean>;
};

export default function HouseCard({
  Buildings,
  house,
  RemoveHouse,
  UpdateHouse,
}: HouseCardsProps) {
  const InitialValue: House = {
    nb_bedrooms: house.nb_bedrooms || NaN,
    nb_bathrooms: house.nb_bathrooms || NaN,
    floor: house.floor || NaN,
    building_id: house.building_id || NaN,
    price: house.price || NaN,
    is_sold: house.is_sold,
  };

  const [HouseInput, setHouseInput] = useState<House>(InitialValue);
  const [EditMode, setEditMode] = useState<boolean>(false);
  const [IsOpen, setIsOpen] = useState<boolean>(false);

  async function handleEdit(houseId: House["id"]) {
    const updatedHouse: House = {
      nb_bedrooms: HouseInput.nb_bedrooms,
      nb_bathrooms: HouseInput.nb_bathrooms,
      floor: HouseInput.floor,
      building_id: HouseInput.building_id,
      price: HouseInput.price,
      is_sold: HouseInput.is_sold,
    };

    const ok = await UpdateHouse(updatedHouse, houseId);

    if (ok) setEditMode(false);
  }

  async function handleDelete() {
    const ok = await RemoveHouse(house.id);

    if (ok) return alert("House has been deleted");
  }

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>
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
              `Floor ${house.floor}`
            )}
          </CardTitle>

          <CardDescription>
            {EditMode ? (
              <input
                type="text"
                className="border border-black rounded disabled:cursor-not-allowed size-full"
                value={HouseInput.price}
                onChange={(event) => {
                  setHouseInput((prev) => ({
                    ...prev,
                    price: parseInt(event.target.value.trim()),
                  }));
                }}
              />
            ) : (
              `$${house.price}`
            )}
          </CardDescription>

          <CardAction className="flex flex-col justify-center items-center gap-2.5">
            <Button
              variant="destructive"
              size="lg"
              className="cursor-pointer"
              onClick={() => setIsOpen(true)}
            >
              Delete House
            </Button>
            <Button
              variant="secondary"
              size="lg"
              className="cursor-pointer"
              onClick={() => {
                if (EditMode) return handleEdit(house.id);
                return setEditMode((prev) => !prev);
              }}
            >
              {EditMode ? "Submit Edits" : "Edit House"}
            </Button>
          </CardAction>
        </CardHeader>

        <CardContent>
          <p>
            <strong>Number of Bathrooms: </strong>
            {EditMode ? (
              <input
                type="text"
                className="border border-black rounded disabled:cursor-not-allowed size-full"
                value={HouseInput.nb_bathrooms}
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
                value={HouseInput.nb_bedrooms}
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
            <strong>Is Sold: </strong>
            {EditMode ? (
              <select
                value={HouseInput.is_sold ? "yes" : "no"}
                className="border border-black rounded cursor-pointer disabled:cursor-not-allowed size-full"
                onChange={(event) => {
                  setHouseInput((prev) => ({
                    ...prev,
                    is_sold: event.target.value === "yes",
                  }));
                }}
              >
                <option value="no">No</option>
                <option value="yes">Yes</option>
              </select>
            ) : house.is_sold ? (
              "Yes"
            ) : (
              "No"
            )}
          </p>
          <p>
            {EditMode ? (
              <>
                <strong>Select a Building: </strong>
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
                  Buildings.find(
                    (building) => building.id === house.building_id,
                  )?.name
                }
              </>
            )}
          </p>
          {!EditMode && (
            <p>
              <strong>House added at:</strong> {house.added_at?.split("T")[0]}
            </p>
          )}
        </CardContent>
      </Card>

      <Modal
        Open={IsOpen}
        setOpen={setIsOpen}
        handleDelete={handleDelete}
        text="this house"
      />
    </>
  );
}
