-- Allow null value for text_answer questions
ALTER TABLE answers ALTER COLUMN value DROP NOT NULL;
