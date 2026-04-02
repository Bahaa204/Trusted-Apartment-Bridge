import type { Building } from "../types/types";

type HouseData = {
  house_floor: number;
  house_nb_bedrooms: number;
  house_nb_bathrooms: number;
  house_building_id: number | undefined;
};

type HouseFormProps = HouseData & {
  loading: boolean;
  updateFields: (fields: Partial<HouseData>) => void;
  Options: Building[];
};

export default function HouseForm({
  loading,
  house_building_id,
  house_floor,
  house_nb_bathrooms,
  house_nb_bedrooms,
  updateFields,
  Options,
}: HouseFormProps) {
  return (
    <div className="flex flex-wrap flex-col justify-center items-center gap-2.5">
      <div>
        <h2>Add a House</h2>
      </div>

      <div className="flex flex-wrap flex-col justify-center items-center gap-1">
        <label htmlFor="floor">Floor</label>
        <input
          type="number"
          id="floor"
          className="border border-black rounded disabled:cursor-not-allowed"
          required
          value={house_floor}
          onChange={(event) =>
            updateFields({ house_floor: parseInt(event.target.value) })
          }
          disabled={loading}
        />
      </div>
      <div className="flex flex-wrap flex-col justify-center items-center gap-1">
        <label htmlFor="bedrooms">Number of Bedrooms</label>
        <input
          type="number"
          id="bedrooms"
          className="border border-black rounded  disabled:cursor-not-allowed"
          required
          value={house_nb_bedrooms}
          onChange={(event) =>
            updateFields({ house_nb_bedrooms: parseInt(event.target.value) })
          }
          disabled={loading}
        />
      </div>
      <div className="flex flex-wrap flex-col justify-center items-center gap-1">
        <label htmlFor="bathrooms">Number of Bathrooms</label>
        <input
          type="number"
          id="bathrooms"
          className="border border-black rounded disabled:cursor-not-allowed"
          required
          value={house_nb_bathrooms}
          onChange={(event) =>
            updateFields({ house_nb_bathrooms: parseInt(event.target.value) })
          }
          disabled={loading}
        />
      </div>

      <div className="flex flex-wrap flex-col justify-center items-center gap-1">
        <label htmlFor="select">Select a Building</label>
        <select
          id="select"
          className="border border-black rounded cursor-pointer disabled:cursor-not-allowed"
          required
          value={house_building_id}
          onChange={(event) =>
            updateFields({ house_building_id: parseInt(event.target.value) })
          }
          disabled={loading}
        >
          {Options.map((option) => (
            <option value={option.id} key={option.id}>
              {option.name}
            </option>
          ))}
        </select>
      </div>

      <div className="flex flex-wrap flex-col justify-center items-center gap-1">
        <button
          type="submit"
          className="border-2 border-black py-1 px-2 rounded cursor-pointer disabled:cursor-not-allowed"
          disabled={loading}
        >
          Add a House
        </button>
      </div>
    </div>
  );
}
