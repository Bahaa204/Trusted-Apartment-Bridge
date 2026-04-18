import { Button } from "../ui/button";
import { Input } from "../ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import {
  Field,
  FieldDescription,
  FieldGroup,
  FieldLabel,
  FieldLegend,
  FieldSet,
} from "../ui/field";
import type { HouseFormProps } from "@/types/form";

export default function HouseForm({
  loading,
  house_building_id,
  house_floor,
  house_nb_bathrooms,
  house_nb_bedrooms,
  house_price,
  updateFields,
  Options,
}: HouseFormProps) {
  return (
    <FieldSet className="grid grid-cols-1 gap-4 rounded-xl border border-slate-200 bg-slate-50 p-4 md:p-5">
      <div className="space-y-1">
        <FieldLegend className="text-xl font-semibold text-slate-900">
          Add a House
        </FieldLegend>
        <FieldDescription className="text-sm text-slate-600">
          Enter unit details, price, and assign the house to a building.
        </FieldDescription>
      </div>

      <div className="grid gap-1.5 sm:grid-cols-2 sm:gap-4">
        <FieldGroup className="grid gap-1.5">
          <FieldLabel htmlFor="house-floor" className="text-slate-700">
            Floor
          </FieldLabel>
          <Input
            type="number"
            id="house-floor"
            className="border-slate-300 bg-white text-slate-900"
            required
            value={Number.isNaN(house_floor) ? "" : house_floor}
            onChange={(event) =>
              updateFields({ house_floor: parseInt(event.target.value) })
            }
            disabled={loading}
          />
        </FieldGroup>
        <FieldGroup className="grid gap-1.5">
          <FieldLabel htmlFor="house-bedrooms" className="text-slate-700">
            Bedrooms
          </FieldLabel>
          <Input
            type="number"
            id="house-bedrooms"
            className="border-slate-300 bg-white text-slate-900"
            required
            value={Number.isNaN(house_nb_bedrooms) ? "" : house_nb_bedrooms}
            onChange={(event) =>
              updateFields({ house_nb_bedrooms: parseInt(event.target.value) })
            }
            disabled={loading}
          />
        </FieldGroup>
        <FieldGroup className="grid gap-1.5">
          <FieldLabel htmlFor="house-bathrooms" className="text-slate-700">
            Bathrooms
          </FieldLabel>
          <Input
            type="number"
            id="house-bathrooms"
            className="border-slate-300 bg-white text-slate-900"
            required
            value={Number.isNaN(house_nb_bathrooms) ? "" : house_nb_bathrooms}
            onChange={(event) =>
              updateFields({ house_nb_bathrooms: parseInt(event.target.value) })
            }
            disabled={loading}
          />
        </FieldGroup>
        <FieldGroup className="grid gap-1.5">
          <FieldLabel htmlFor="house-price" className="text-slate-700">
            Price
          </FieldLabel>
          <Input
            type="number"
            id="house-price"
            className="border-slate-300 bg-white text-slate-900"
            required
            value={Number.isNaN(house_price) ? "" : house_price}
            onChange={(event) =>
              updateFields({ house_price: parseInt(event.target.value) })
            }
            disabled={loading}
          />
        </FieldGroup>
      </div>

      <FieldGroup className="grid gap-1.5">
        <FieldLabel htmlFor="house-building" className="text-slate-700">
          Select a building
        </FieldLabel>
        <Select
          value={
            Number.isNaN(house_building_id) ? "" : String(house_building_id)
          }
          onValueChange={(value) =>
            updateFields({ house_building_id: parseInt(value) })
          }
          disabled={loading}
        >
          <SelectTrigger
            id="house-building"
            className="h-9 w-full cursor-pointer border-slate-300 bg-white text-slate-900"
          >
            <SelectValue placeholder="Select a building" />
          </SelectTrigger>
          <SelectContent>
            {Options.map((option) => (
              <SelectItem value={String(option.id)} key={option.id}>
                {option.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </FieldGroup>

      <Field orientation="vertical" className="pt-1">
        <Button
          type="submit"
          className="h-9 w-full cursor-pointer bg-[#173b67] font-semibold text-white hover:bg-[#24507f] md:w-auto"
          disabled={loading}
        >
          Add a House
        </Button>
      </Field>
    </FieldSet>
  );
}
