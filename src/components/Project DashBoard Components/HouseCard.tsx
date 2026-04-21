import { useState } from "react";
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
import { Input } from "../ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import type { House, HouseCardsProps } from "@/types/house";

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
      <Card className="border border-slate-200 bg-white text-slate-900 shadow-lg">
        <CardHeader>
          <CardTitle>
            {EditMode ? (
              <Input
                type="number"
                className="border-slate-300 bg-white text-slate-900"
                placeholder="House Floor"
                value={Number.isNaN(HouseInput.floor) ? "" : HouseInput.floor}
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
              <Input
                type="number"
                className="border-slate-300 bg-white text-slate-900"
                value={Number.isNaN(HouseInput.price) ? "" : HouseInput.price}
                placeholder="House Price"
                onChange={(event) => {
                  setHouseInput((prev) => ({
                    ...prev,
                    price: parseInt(event.target.value.trim()),
                  }));
                }}
              />
            ) : (
              `$ ${house.price.toLocaleString()}`
            )}
          </CardDescription>

          <CardAction className="flex flex-col justify-center items-center gap-2.5">
            <Button
              variant="destructive"
              size="lg"
              className="cursor-pointer bg-red-600 text-white hover:bg-red-500"
              onClick={() => setIsOpen(true)}
            >
              Delete House
            </Button>
            <Button
              variant="secondary"
              size="lg"
              className="cursor-pointer border border-slate-300 bg-slate-100 text-slate-900 hover:bg-slate-200"
              onClick={() => {
                if (EditMode) return handleEdit(house.id);
                return setEditMode((prev) => !prev);
              }}
            >
              {EditMode ? "Submit Edits" : "Edit House"}
            </Button>
            {EditMode && (
              <Button
                variant="secondary"
                size="lg"
                className="cursor-pointer border border-slate-300 bg-slate-100 text-slate-900 hover:bg-slate-200"
                onClick={() => setEditMode(false)}
              >
                Cancel Edits
              </Button>
            )}
          </CardAction>
        </CardHeader>

        <CardContent>
          <p>
            <strong>Number of Bathrooms: </strong>
            {EditMode ? (
              <Input
                type="number"
                className="mt-1 border-slate-300 bg-white text-slate-900"
                value={
                  Number.isNaN(HouseInput.nb_bathrooms)
                    ? ""
                    : HouseInput.nb_bathrooms
                }
                placeholder="Number of Bathrooms"
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
              <Input
                type="number"
                className="mt-1 border-slate-300 bg-white text-slate-900"
                value={
                  Number.isNaN(HouseInput.nb_bedrooms)
                    ? ""
                    : HouseInput.nb_bedrooms
                }
                placeholder="Number of Bedrooms"
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
              <Select
                value={HouseInput.is_sold ? "yes" : "no"}
                onValueChange={(value) => {
                  setHouseInput((prev) => ({
                    ...prev,
                    is_sold: value === "yes",
                  }));
                }}
              >
                <SelectTrigger className="mt-1 h-9 w-full border-slate-300 bg-white text-slate-900">
                  <SelectValue placeholder="Sold status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="no">No</SelectItem>
                  <SelectItem value="yes">Yes</SelectItem>
                </SelectContent>
              </Select>
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
                <Select
                  value={String(HouseInput.building_id)}
                  onValueChange={(value) => {
                    setHouseInput((prev) => ({
                      ...prev,
                      building_id: parseInt(value),
                    }));
                  }}
                >
                  <SelectTrigger className="mt-1 h-9 w-full border-slate-300 bg-white text-slate-900">
                    <SelectValue placeholder="Select a building" />
                  </SelectTrigger>
                  <SelectContent>
                    {Buildings.map((Building) => (
                      <SelectItem value={String(Building.id)} key={Building.id}>
                        {Building.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
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
