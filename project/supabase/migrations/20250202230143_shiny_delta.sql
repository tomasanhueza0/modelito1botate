/*
  # Initial Schema for Model-Job Platform

  1. New Tables
    - `models`
      - `id` (uuid, primary key)
      - `name` (text)
      - `work_type` (text array)
      - `zone` (text)
      - `availability` (text array)
      - `contact` (text)
      - `created_at` (timestamp)
    
    - `jobs`
      - `id` (uuid, primary key)
      - `agency` (text)
      - `instagram` (text)
      - `work_type` (text)
      - `brand` (text)
      - `zone` (text)
      - `schedule` (text array)
      - `expiry_date` (date)
      - `created_at` (timestamp)

  2. Security
    - Enable RLS on both tables
    - Add policies for authenticated users to read and write
    - Add policies for public access where needed

  3. Functions
    - Create function to match jobs with models
    - Create function to clean expired jobs
*/

-- Create enum types for consistent data
CREATE TYPE work_type AS ENUM ('photos', 'modeling', 'advertising');
CREATE TYPE schedule_type AS ENUM ('morning', 'afternoon', 'night');
CREATE TYPE zone_type AS ENUM (
  'Palermo',
  'Recoleta',
  'Belgrano',
  'San Telmo',
  'Puerto Madero',
  'Núñez',
  'Caballito',
  'Villa Crespo',
  'Almagro',
  'Colegiales'
);

-- Create models table
CREATE TABLE IF NOT EXISTS models (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  work_type work_type[] NOT NULL,
  zone zone_type NOT NULL,
  availability schedule_type[] NOT NULL,
  contact text NOT NULL,
  created_at timestamptz DEFAULT now(),
  CONSTRAINT valid_contact CHECK (contact ~ '^\+?[1-9]\d{1,14}$')
);

-- Create jobs table
CREATE TABLE IF NOT EXISTS jobs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  agency text NOT NULL,
  instagram text NOT NULL,
  work_type work_type NOT NULL,
  brand text NOT NULL,
  zone zone_type NOT NULL,
  schedule schedule_type[] NOT NULL,
  expiry_date date NOT NULL,
  created_at timestamptz DEFAULT now(),
  CONSTRAINT valid_instagram CHECK (instagram LIKE '@%'),
  CONSTRAINT valid_expiry CHECK (expiry_date >= CURRENT_DATE)
);

-- Enable Row Level Security
ALTER TABLE models ENABLE ROW LEVEL SECURITY;
ALTER TABLE jobs ENABLE ROW LEVEL SECURITY;

-- Create policies for models table
CREATE POLICY "Allow public to create models"
  ON models FOR INSERT
  TO public
  WITH CHECK (true);

CREATE POLICY "Allow authenticated to read models"
  ON models FOR SELECT
  TO authenticated
  USING (true);

-- Create policies for jobs table
CREATE POLICY "Allow authenticated to create jobs"
  ON jobs FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Allow public to read jobs"
  ON jobs FOR SELECT
  TO public
  USING (true);

-- Create function to match jobs with models
CREATE OR REPLACE FUNCTION match_jobs_with_models()
RETURNS TABLE (
  model_id uuid,
  model_name text,
  model_contact text,
  job_id uuid,
  job_brand text,
  job_instagram text,
  job_zone text
) LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
  RETURN QUERY
  SELECT 
    m.id as model_id,
    m.name as model_name,
    m.contact as model_contact,
    j.id as job_id,
    j.brand as job_brand,
    j.instagram as job_instagram,
    j.zone::text as job_zone
  FROM models m
  CROSS JOIN jobs j
  WHERE 
    j.work_type = ANY(m.work_type)
    AND j.zone = m.zone
    AND j.schedule && m.availability
    AND j.expiry_date >= CURRENT_DATE;
END;
$$;

-- Create function to clean expired jobs
CREATE OR REPLACE FUNCTION clean_expired_jobs()
RETURNS void LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
  DELETE FROM jobs
  WHERE expiry_date < CURRENT_DATE;
END;
$$;