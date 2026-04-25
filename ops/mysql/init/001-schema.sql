-- =============================================================================
-- Sonho Mágico Joinville — Schema MySQL
-- =============================================================================

-- Metadados do projeto
CREATE TABLE IF NOT EXISTS app_metadata (
  id INT AUTO_INCREMENT PRIMARY KEY,
  item_key VARCHAR(100) NOT NULL UNIQUE,
  item_value TEXT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

INSERT INTO app_metadata (item_key, item_value)
VALUES
  ('project', 'sonho-magico-joinville'),
  ('schema_version', '2')
ON DUPLICATE KEY UPDATE item_value = VALUES(item_value);

-- =============================================================================
-- Usuários
-- =============================================================================
CREATE TABLE IF NOT EXISTS users (
  id VARCHAR(36) NOT NULL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  phone VARCHAR(30) NOT NULL DEFAULT '',
  role ENUM('client','admin','crew') NOT NULL DEFAULT 'client',
  access_level ENUM('super_admin','admin','manager','coordinator','crew','client') NOT NULL DEFAULT 'client',
  custom_permissions JSON NULL,
  address VARCHAR(500) NULL,
  city VARCHAR(255) NULL,
  notes TEXT NULL,
  specialties JSON NULL,
  availability VARCHAR(255) NULL,
  app_installed TINYINT(1) NOT NULL DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- =============================================================================
-- Eventos
-- =============================================================================
CREATE TABLE IF NOT EXISTS events (
  id VARCHAR(36) NOT NULL PRIMARY KEY,
  client_id VARCHAR(36) NOT NULL,
  title VARCHAR(500) NOT NULL,
  event_date DATE NOT NULL,
  event_time VARCHAR(10) NOT NULL DEFAULT '',
  location VARCHAR(500) NOT NULL DEFAULT '',
  attendees INT NOT NULL DEFAULT 0,
  service VARCHAR(255) NOT NULL DEFAULT '',
  status ENUM('pending','confirmed','completed','cancelled') NOT NULL DEFAULT 'pending',
  budget DECIMAL(10,2) NULL,
  notes TEXT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (client_id) REFERENCES users(id) ON DELETE CASCADE
);

-- =============================================================================
-- Orçamentos
-- =============================================================================
CREATE TABLE IF NOT EXISTS quotes (
  id VARCHAR(36) NOT NULL PRIMARY KEY,
  client_id VARCHAR(36) NOT NULL,
  event_id VARCHAR(36) NULL,
  title VARCHAR(500) NOT NULL,
  description TEXT NOT NULL,
  amount DECIMAL(10,2) NOT NULL DEFAULT 0,
  status ENUM('pending','approved','rejected') NOT NULL DEFAULT 'pending',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (client_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (event_id) REFERENCES events(id) ON DELETE SET NULL
);

-- =============================================================================
-- Escalas de Equipe
-- =============================================================================
CREATE TABLE IF NOT EXISTS team_assignments (
  id VARCHAR(36) NOT NULL PRIMARY KEY,
  event_id VARCHAR(36) NOT NULL,
  member_id VARCHAR(36) NOT NULL,
  function_label VARCHAR(255) NOT NULL DEFAULT '',
  status ENUM('confirmed','pending') NOT NULL DEFAULT 'pending',
  notes TEXT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (event_id) REFERENCES events(id) ON DELETE CASCADE,
  FOREIGN KEY (member_id) REFERENCES users(id) ON DELETE CASCADE
);

-- =============================================================================
-- Mensagens da Equipe
-- =============================================================================
CREATE TABLE IF NOT EXISTS crew_messages (
  id VARCHAR(36) NOT NULL PRIMARY KEY,
  author_id VARCHAR(36) NOT NULL,
  event_id VARCHAR(36) NULL,
  recipient_ids JSON NOT NULL,
  title VARCHAR(500) NOT NULL,
  content TEXT NOT NULL,
  channel ENUM('app','whatsapp','both') NOT NULL DEFAULT 'app',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (author_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (event_id) REFERENCES events(id) ON DELETE SET NULL
);

-- =============================================================================
-- Landing Content (migrado de JSON para DB)
-- =============================================================================
CREATE TABLE IF NOT EXISTS landing_content (
  id INT AUTO_INCREMENT PRIMARY KEY,
  content_key VARCHAR(100) NOT NULL UNIQUE,
  content_value LONGTEXT NULL,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);
