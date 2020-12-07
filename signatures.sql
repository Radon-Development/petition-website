DROP TABLE IF EXISTS signatures;

CREATE TABLE signatures (
   id SERIAL PRIMARY KEY,
   signature VARCHAR NOT NULL CHECK (signature != ''),
   user_id INTEGER NOT NULL REFERENCES users(id),
   created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);