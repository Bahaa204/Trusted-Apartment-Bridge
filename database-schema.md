# Supabase Database Schema

## Table: `countries`

| Column | Type    | Description  |
|--------|---------|--------------|
| `id`   | integer | Primary key  |
| `name` | text    | Country name |

## Table: `projects`

| Column        | Type        | Description                      |
|--------------|-------------|----------------------------------|
| `id`         | integer     | Primary key                      |
| `name`       | text        | Project name                     |
| `description`| text        | Project description              |
| `country_id` | integer     | Foreign key → `countries.id`     |
| `location`   | text        | Project location                 |
| `images_url` | text[]      | Array of image URLs              |
| `nb_visits`  | integer     | Number of visits (default 0)     |
| `added_at`   | timestamptz | Auto-generated creation timestamp|

## Table: `buildings`

| Column       | Type    | Description                  |
|-------------|---------|------------------------------|
| `id`        | integer | Primary key                  |
| `name`      | text    | Building name                |
| `project_id`| integer | Foreign key → `projects.id`  |

## Table: `houses`

| Column         | Type        | Description                    |
|---------------|-------------|--------------------------------|
| `id`          | integer     | Primary key                    |
| `building_id` | integer     | Foreign key → `buildings.id`   |
| `price`       | numeric     | House price                    |
| `floor`       | integer     | Floor number                   |
| `nb_bedrooms` | integer     | Number of bedrooms             |
| `nb_bathrooms`| integer     | Number of bathrooms            |
| `added_at`    | timestamptz | Auto-generated creation timestamp|

## Table: `employees`

| Column | Type | Description |
|--------|------|-------------|
| (empty table, columns not fully determined) | | |

## Relationships

- `projects.country_id` → `countries.id` (many-to-one)
- `buildings.project_id` → `projects.id` (many-to-one)
- `houses.building_id` → `buildings.id` (many-to-one)
