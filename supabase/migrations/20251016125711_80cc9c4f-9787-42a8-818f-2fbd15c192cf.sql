-- PHASE 5: Merge Duplicate Checklists Before Applying Unique Constraint

-- Step 1: Add contributors column if not exists
ALTER TABLE checklists ADD COLUMN IF NOT EXISTS contributors JSONB DEFAULT '{}'::jsonb;

-- Step 2: For each date, identify the "primary" checklist to keep (most complete one)
WITH primary_checklists AS (
  SELECT DISTINCT ON (date) 
    id as primary_id,
    date
  FROM checklists
  ORDER BY date, completion_percentage DESC NULLS LAST, updated_at DESC
),
-- Step 3: Collect all contributors for each date
all_contributors AS (
  SELECT 
    c.date,
    jsonb_object_agg(
      c.user_id::text, 
      jsonb_build_object(
        'completed_modules', COALESCE(
          CASE 
            WHEN c.module1_data IS NOT NULL AND c.module1_data != '{}'::jsonb THEN 1 
            ELSE 0 
          END +
          CASE 
            WHEN c.module2_data IS NOT NULL AND c.module2_data != '{}'::jsonb THEN 1 
            ELSE 0 
          END +
          CASE 
            WHEN c.module3_data IS NOT NULL AND c.module3_data != '{}'::jsonb THEN 1 
            ELSE 0 
          END +
          CASE 
            WHEN c.module4_data IS NOT NULL AND c.module4_data != '{}'::jsonb THEN 1 
            ELSE 0 
          END,
          0
        ),
        'last_updated', c.updated_at
      )
    ) as contributors_data
  FROM checklists c
  WHERE c.user_id IS NOT NULL
  GROUP BY c.date
)
-- Step 4: Update primary checklists with contributors data
UPDATE checklists
SET contributors = ac.contributors_data
FROM primary_checklists pc
JOIN all_contributors ac ON ac.date = pc.date
WHERE checklists.id = pc.primary_id;

-- Step 5: Delete duplicate checklists (keep only the primary one per date)
DELETE FROM checklists
WHERE id NOT IN (
  SELECT DISTINCT ON (date) id
  FROM checklists
  ORDER BY date, completion_percentage DESC NULLS LAST, updated_at DESC
);

-- Step 6: Make user_id nullable
ALTER TABLE checklists ALTER COLUMN user_id DROP NOT NULL;

-- Step 7: Add unique constraint
ALTER TABLE checklists ADD CONSTRAINT checklists_unique_date UNIQUE (date);