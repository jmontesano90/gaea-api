BEGIN;

TRUNCATE
    gaea_users,
    gaea_dna
    RESTART IDENTITY CASCADE;

INSERT INTO gaea_users (user_name, password)
VALUES
('JOE', 'unecrypted'),
('JOHN', 'unecrypted');

INSERT INTO gaea_dna (user_id, name, dna, comment)
VALUES
(1, 'Recessive', 'aabbccddeeffkkllmmnnoopp', 'A strand of all recessive genes'),
(2, 'Dominant', 'AABBCCDDEEFFKKLLMMNNOOPP', 'A strand of all dominant genes');

COMMIT;