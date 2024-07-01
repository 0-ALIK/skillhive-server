-- Inserts para tipo_publicacion
INSERT INTO tipo_publicacion (id, tipo, `createdAt`, `updatedAt`) VALUES
    ('ART', 'Articulo', NOW(), NOW()),
    ('ACT', 'Activo', NOW(), NOW()),
    ('MUL', 'Multimedios', NOW(), NOW()),
    ('EMP', 'Empleo', NOW(), NOW());

-- Inserts para tipo_seccion
INSERT INTO tipo_seccion (id, nombre, `createdAt`, `updatedAt`) VALUES
    ('PRO', 'Proyectos', NOW(), NOW()),
    ('GAL', 'Galeria', NOW(), NOW()),
    ('TEX', 'Texto', NOW(), NOW());

-- Inserts para tipo_transaccion
INSERT INTO tipo_transaccion (id, tipo, `createdAt`, `updatedAt`) VALUES
    ('SCS', 'Pago de servicio', NOW(), NOW()),
    ('CDA', 'Compra de activos', NOW(), NOW()),
    ('PDM', 'Pago de membresia', NOW(), NOW()),
    ('OTR', 'Otro', NOW(), NOW());

-- Inserts para tipo_emplo_tipo
INSERT INTO oferta_empleo_tipo (id, tipo, `createdAt`, `updatedAt`) VALUES
    ('TIE', 'Tiempo completo', NOW(), NOW()),
    ('TIP', 'Tiempo parcial', NOW(), NOW()),
    ('FRE', 'Freelance', NOW(), NOW()),
    ('PRA', 'Practicas', NOW(), NOW()),
    ('PAS', 'Pasantias', NOW(), NOW()),
    ('VOL', 'Voluntariado', NOW(), NOW()),
    ('REM', 'Remoto', NOW(), NOW());

-- Inserts para tipo_emplo_nivel
INSERT INTO oferta_empleo_nivel (id, nivel, `createdAt`, `updatedAt`) VALUES
    ('JUN', 'Junior', NOW(), NOW()),
    ('SEN', 'Senior', NOW(), NOW()),
    ('DIR', 'Director', NOW(), NOW()),
    ('GER', 'Gerente', NOW(), NOW()),
    ('TRA', 'Trainee', NOW(), NOW()),
    ('PAS', 'Pasante', NOW(), NOW()),
    ('VOL', 'Voluntario', NOW(), NOW());

INSERT INTO comision_solicitud_estado (id, estado, `createdAt`, `updatedAt`) VALUES
    ('PEN', 'Pendiente', NOW(), NOW()),
    ('ACE', 'Aceptada', NOW(), NOW()),
    ('PAG', 'Pagada', NOW(), NOW()),
    ('REC', 'Rechazada', NOW(), NOW()),
    ('CAN', 'Cancelada', NOW(), NOW()),
    ('ENT', 'Entregada', NOW(), NOW());