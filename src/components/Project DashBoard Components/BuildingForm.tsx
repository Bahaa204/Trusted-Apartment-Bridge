import type { Project } from "../../types/types";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";

type BuildingData = {
  buildings_name: string;
  buildings_block: string;
  buildings_images: FileList | null;
  buildings_project_id: Project["id"];
};

type BuildingFormProps = BuildingData & {
  loading: boolean;
  updateFields: (fields: Partial<BuildingData>) => void;
  Options: Project[];
};

export default function BuildingForm({
  loading,
  buildings_name,
  buildings_block,
  buildings_project_id,
  updateFields,
  Options,
}: BuildingFormProps) {
  return (
    <div className="grid grid-cols-1 gap-4 rounded-xl border border-slate-200 bg-slate-50 p-4 md:p-5">
      <div className="space-y-1">
        <h2 className="text-xl font-semibold text-slate-900">Add a Building</h2>
        <p className="text-sm text-slate-600">
          Link each building to a project and upload visual references.
        </p>
      </div>

      <div className="grid gap-1.5">
        <Label htmlFor="building-name" className="text-slate-700">
          Name
        </Label>
        <Input
          type="text"
          id="building-name"
          className="border-slate-300 bg-white text-slate-900 placeholder:text-slate-400"
          required
          value={buildings_name}
          onChange={(event) =>
            updateFields({ buildings_name: event.target.value })
          }
          disabled={loading}
        />
      </div>

      <div className="grid gap-1.5">
        <Label htmlFor="building-block" className="text-slate-700">
          Block
        </Label>
        <Input
          type="text"
          id="building-block"
          className="border-slate-300 bg-white text-slate-900 placeholder:text-slate-400"
          required
          value={buildings_block}
          onChange={(event) =>
            updateFields({ buildings_block: event.target.value })
          }
          disabled={loading}
        />
      </div>

      <div className="grid gap-1.5">
        <Label htmlFor="building-images" className="text-slate-700">
          Images
        </Label>
        <Input
          type="file"
          multiple
          id="building-images"
          className="cursor-pointer border-slate-300 bg-white text-slate-900 file:text-slate-700"
          required
          onChange={(event) => {
            if (event.target.files && event.target.files.length > 0) {
              updateFields({ buildings_images: event.target.files });
            }
          }}
          disabled={loading}
        />
      </div>

      <div className="grid gap-1.5">
        <Label htmlFor="building-project" className="text-slate-700">
          Select a project
        </Label>
        <Select
          value={
            Number.isNaN(buildings_project_id)
              ? ""
              : String(buildings_project_id)
          }
          onValueChange={(value) =>
            updateFields({ buildings_project_id: parseInt(value) })
          }
          disabled={loading}
        >
          <SelectTrigger
            id="building-project"
            className="h-9 w-full cursor-pointer border-slate-300 bg-white text-slate-900"
          >
            <SelectValue placeholder="Select a project" />
          </SelectTrigger>
          <SelectContent>
            {Options.map((options) => (
              <SelectItem value={String(options.id)} key={options.id}>
                {options.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="pt-1">
        <Button
          type="submit"
          className="h-9 w-full cursor-pointer bg-[#173b67] font-semibold text-white hover:bg-[#24507f] md:w-auto"
          disabled={loading}
        >
          Add a Building
        </Button>
      </div>
    </div>
  );
}
