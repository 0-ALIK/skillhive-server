-- Active: 1718835243350@@localhost@3306@skillhive
-- Inserts para Categoria
INSERT INTO Categoria (nombre, createdAt, updatedAt) VALUES
    ('Renderizados en 3D', NOW(), NOW()),
    ('Dibujos', NOW(), NOW()),
    ('Fotos', NOW(), NOW()),
    ('Audios', NOW(), NOW()),
    ('Videos', NOW(), NOW());

-- Inserts para Subcategoria
INSERT INTO Subcategoria (nombre, createdAt, updatedAt, `categoriaId`) VALUES
    ('Rigged', NOW(), NOW(), 1),
    ('Low poly', NOW(), NOW(), 1),
    ('High poly', NOW(), NOW(), 1),
    ('Animación', NOW(), NOW(), 1),
    ('Texturizados', NOW(), NOW(), 1),
    ('No-rigged', NOW(), NOW(), 1),
    ('No texturizados', NOW(), NOW(), 1),
    ('Sketch', NOW(), NOW(), 2),
    ('Acuarela', NOW(), NOW(), 2),
    ('Anatómico', NOW(), NOW(), 2),
    ('De moda', NOW(), NOW(), 2),
    ('Arquitectónico', NOW(), NOW(), 2),
    ('Fantasía', NOW(), NOW(), 2),
    ('Naturaleza', NOW(), NOW(), 2),
    ('Ciencia ficción', NOW(), NOW(), 2),
    ('Objetos', NOW(), NOW(), 2),
    ('Tipografía', NOW(), NOW(), 2),
    ('Pixel art', NOW(), NOW(), 2),
    ('Hiperrealismo', NOW(), NOW(), 2),
    ('Paisajes', NOW(), NOW(), 3),
    ('Retratos', NOW(), NOW(), 3),
    ('Arquitectura', NOW(), NOW(), 3),
    ('Naturaleza', NOW(), NOW(), 3),
    ('Productos', NOW(), NOW(), 3),
    ('Eventos', NOW(), NOW(), 3),
    ('Estilo de vida', NOW(), NOW(), 3),
    ('Viajes', NOW(), NOW(), 3),
    ('Moda', NOW(), NOW(), 3),
    ('Aérea', NOW(), NOW(), 3),
    ('Urbana', NOW(), NOW(), 3),
    ('Abstracta', NOW(), NOW(), 3),
    ('Stock', NOW(), NOW(), 3),
    ('Efectos de sonidos', NOW(), NOW(), 4),
    ('Música', NOW(), NOW(), 4),
    ('Grabaciones de campo', NOW(), NOW(), 4),
    ('Voces en off', NOW(), NOW(), 4),
    ('Samples', NOW(), NOW(), 4),
    ('Audio textos', NOW(), NOW(), 4),
    ('Documentaries', NOW(), NOW(), 5),
    ('Stock', NOW(), NOW(), 5),
    ('Products', NOW(), NOW(), 5),
    ('Nature', NOW(), NOW(), 5),
    ('Animations', NOW(), NOW(), 5);

-- Inserts para Especialidad
INSERT INTO Especialidad (nombre, createdAt, updatedAt) VALUES
    ('Diseño gráfico', NOW(), NOW()),
    ('Ilustración', NOW(), NOW()),
    ('Fotografía', NOW(), NOW()),
    ('Audiovisual', NOW(), NOW());

-- Inserts para Subespecialidad
INSERT INTO Subespecialidad (nombre, createdAt, updatedAt, `especialidadId`) VALUES
    ('Motion graphics', NOW(), NOW(), 1),
    ('Diseño de logotipos', NOW(), NOW(), 1),
    ('Ilustración digital', NOW(), NOW(), 2),
    ('Ilustración infantil', NOW(), NOW(), 2),
    ('Fotografía de retrato', NOW(), NOW(), 3),
    ('Fotografía de productos', NOW(), NOW(), 3),
    ('Edición de video', NOW(), NOW(), 4),
    ('Producción audiovisual', NOW(), NOW(), 4);
