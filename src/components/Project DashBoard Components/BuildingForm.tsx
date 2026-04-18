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
import type { BuildingFormProps } from "@/types/form";

export default function BuildingForm({
  loading,
  buildings_name,
  buildings_block,
  buildings_project_id,
  updateFields,
  Options,
}: BuildingFormProps) {
  return (
    <FieldSet className="grid grid-cols-1 gap-4 rounded-xl border border-slate-200 bg-slate-50 p-4 md:p-5">
      <div className="space-y-1">
        <FieldLegend className="text-xl font-semibold text-slate-900">
          Add a Building
        </FieldLegend>
        <FieldDescription className="text-sm text-slate-600">
          Link each building to a project and upload visual references.
        </FieldDescription>
      </div>

      <FieldGroup className="grid gap-1.5">
        <FieldLabel htmlFor="building-name" className="text-slate-700">
          Name
        </FieldLabel>
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
      </FieldGroup>

      <FieldGroup className="grid gap-1.5">
        <FieldLabel htmlFor="building-block" className="text-slate-700">
          Block
        </FieldLabel>
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
      </FieldGroup>

      <FieldGroup className="grid gap-1.5">
        <FieldLabel htmlFor="building-images" className="text-slate-700">
          Images
        </FieldLabel>
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
      </FieldGroup>

      <FieldGroup className="grid gap-1.5">
        <FieldLabel htmlFor="building-project" className="text-slate-700">
          Select a project
        </FieldLabel>
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
      </FieldGroup>

      <Field orientation="vertical" className="pt-1">
        <Button
          type="submit"
          className="h-9 w-full cursor-pointer bg-[#173b67] font-semibold text-white hover:bg-[#24507f] md:w-auto"
          disabled={loading}
        >
          Add a Building
        </Button>
      </Field>
    </FieldSet>
  );
}
