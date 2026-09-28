CREATE TABLE IF NOT EXISTS public.claims (
    id SERIAL PRIMARY KEY,
    full_name VARCHAR(255) NOT NULL,
    mobile_number VARCHAR(50) NOT NULL UNIQUE,
    email VARCHAR(255) DEFAULT 'Not Provided',
    offer VARCHAR(255) NOT NULL,
    claim_date_time TIMESTAMP WITHOUT TIME ZONE,
    created_at TIMESTAMP WITHOUT TIME ZONE DEFAULT NOW()
);
