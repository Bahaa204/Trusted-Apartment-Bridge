import type { Country } from "../../types/types";
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
import { Textarea } from "../ui/textarea";

type ProjectsData = {
  project_name: string;
  project_description: string;
  project_location: string;
  project_images: FileList | null;
  project_country_id: Country["id"];
};

type ProjectFormProps = ProjectsData & {
  loading: boolean;
  updateFields: (fields: Partial<ProjectsData>) => void;
  Options: Country[];
};

export default function ProjectForm({
  loading,
  project_name,
  project_description,
  project_location,
  project_country_id,
  updateFields,
  Options,
}: ProjectFormProps) {
  return (
    <div className="grid grid-cols-1 gap-4 rounded-xl border border-slate-200 bg-slate-50 p-4 md:p-5">
      <div className="space-y-1">
        <h2 className="text-xl font-semibold text-slate-900">Add a Project</h2>
        <p className="text-sm text-slate-600">
          Add core details and upload showcase images.
        </p>
      </div>

      <div className="grid gap-1.5">
        <Label htmlFor="project-name" className="text-slate-700">
          Name
        </Label>
        <Input
          type="text"
          id="project-name"
          className="border-slate-300 bg-white text-slate-900 placeholder:text-slate-400"
          required
          value={project_name}
          onChange={(event) =>
            updateFields({ project_name: event.target.value })
          }
          disabled={loading}
        />
      </div>

      <div className="grid gap-1.5">
        <Label htmlFor="project-description" className="text-slate-700">
          Description
        </Label>
        <Textarea
          id="project-description"
          className="border-slate-300 bg-white text-slate-900 placeholder:text-slate-400"
          required
          value={project_description}
          onChange={(event) =>
            updateFields({ project_description: event.target.value })
          }
          disabled={loading}
        />
      </div>

      <div className="grid gap-1.5">
        <Label htmlFor="project-location" className="text-slate-700">
          Location
        </Label>
        <Input
          type="text"
          id="project-location"
          className="border-slate-300 bg-white text-slate-900 placeholder:text-slate-400"
          required
          value={project_location}
          onChange={(event) =>
            updateFields({ project_location: event.target.value })
          }
          disabled={loading}
        />
      </div>

      <div className="grid gap-1.5">
        <Label htmlFor="project-images" className="text-slate-700">
          Images
        </Label>
        <Input
          type="file"
          id="project-images"
          accept="images/*"
          multiple
          className="cursor-pointer border-slate-300 bg-white text-slate-900 file:text-slate-700"
          required
          onChange={(event) => {
            if (event.target.files && event.target.files.length > 0) {
              updateFields({ project_images: event.target.files });
            }
          }}
          disabled={loading}
        />
      </div>

      <div className="grid gap-1.5">
        <Label htmlFor="project-country" className="text-slate-700">
          Select a country
        </Label>
        <Select
          value={
            Number.isNaN(project_country_id) ? "" : String(project_country_id)
          }
          onValueChange={(value) =>
            updateFields({ project_country_id: parseInt(value) })
          }
          disabled={loading}
        >
          <SelectTrigger
            id="project-country"
            className="h-9 w-full cursor-pointer border-slate-300 bg-white text-slate-900"
          >
            <SelectValue placeholder="Select a country" />
          </SelectTrigger>
          <SelectContent>
            {Options.map((option) => (
              <SelectItem value={String(option.id)} key={option.id}>
                {option.name}
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
          Add a Project
        </Button>
      </div>
    </div>
  );
}
