ALTER TABLE proap.aut_user 
ADD COLUMN IF NOT EXISTS requested_perfil_id BIGINT,
ADD COLUMN IF NOT EXISTS profile_status VARCHAR(50) DEFAULT 'APPROVED';

ALTER TABLE proap.aut_user
ADD CONSTRAINT fk_aut_user_requested_perfil 
FOREIGN KEY (requested_perfil_id) 
REFERENCES proap.aut_perfil(id);

UPDATE proap.aut_user 
SET profile_status = 'APPROVED' 
WHERE profile_status IS NULL;