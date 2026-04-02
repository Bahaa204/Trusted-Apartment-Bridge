type ProjectsData = {
  project_name: string;
  project_description: string;
  project_location: string;
  project_images_url: string[];
  project_starting_price: number;
};

type ProjectFormProps = ProjectsData & {
  loading: boolean;
  updateFields: (fields: Partial<ProjectsData>) => void;
};

export default function ProjectForm({
  loading,
  project_name,
  project_description,
  project_images_url,
  project_location,
  project_starting_price,
  updateFields,
}: ProjectFormProps) {
  return (
    <div className="flex flex-wrap flex-col justify-center items-center gap-2.5">
      <div>
        <h2>Add a Project</h2>
      </div>

      <div className="flex flex-wrap flex-col justify-center items-center gap-1">
        <label htmlFor="name">Name: </label>
        <input
          type="text"
          id="name"
          className="border border-black rounded"
          required
          value={project_name}
          onChange={(event) =>
            updateFields({ project_name: event.target.value })
          }
          disabled={loading}
        />
      </div>

      <div className="flex flex-wrap flex-col justify-center items-center gap-1">
        <label htmlFor="description">Description</label>
        <input
          type="text"
          id="description"
          className="border border-black rounded disabled:cursor-not-allowed"
          required
          value={project_description}
          onChange={(event) =>
            updateFields({ project_description: event.target.value })
          }
          disabled={loading}
        />
      </div>

      <div className="flex flex-wrap flex-col justify-center items-center gap-1">
        <label htmlFor="location">Location</label>
        <input
          type="text"
          id="location"
          className="border border-black rounded disabled:cursor-not-allowed"
          required
          value={project_location}
          onChange={(event) =>
            updateFields({ project_location: event.target.value })
          }
          disabled={loading}
        />
      </div>

      <div className="flex flex-wrap flex-col justify-center items-center gap-1">
        <label htmlFor="images">Images</label>
        <input
          type="file"
          multiple
          id="images"
          className="border border-black rounded cursor-pointer disabled:cursor-not-allowed"
          required
          disabled={loading}
        />
      </div>

      <div className="flex flex-wrap flex-col justify-center items-center gap-1">
        <label htmlFor="price">Starting Price</label>
        <input
          type="number"
          id="price"
          className="border border-black rounded disabled:cursor-not-allowed"
          required
          value={String(project_starting_price)}
          onChange={(event) =>
            updateFields({
              project_starting_price: parseInt(event.target.value) || NaN,
            })
          }
          disabled={loading}
        />
      </div>

      <div className="flex flex-wrap flex-col justify-center items-center gap-1">
        <button
          type="submit"
          className="border-2 border-black py-1 px-2 rounded cursor-pointer disabled:cursor-not-allowed"
          disabled={loading}
        >
          Add a Project
        </button>
      </div>
    </div>
  );
}
