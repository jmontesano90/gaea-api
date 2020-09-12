CREATE TABLE gaea_dna(
    id INTEGER PRIMARY KEY GENERATED BY DEFAULT AS IDENTITY,
    user_id INTEGER REFERENCES gaea_users(id),
    name TEXT NOT NULL,
    dna TEXT NOT NULL,
    comment TEXT
);