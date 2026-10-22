-- =============================================
-- DIAGHU Asesor Migratorio - Database Schema
-- Supabase Migration - Initial Schema
-- =============================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =============================================
-- ENUMS
-- =============================================

-- User roles enum
CREATE TYPE user_role AS ENUM ('admin', 'staff', 'client');

-- Appointment status enum
CREATE TYPE appointment_status AS ENUM ('pending', 'confirmed', 'completed', 'cancelled');

-- Service type enum
CREATE TYPE service_type AS ENUM ('tourist_visa', 'schengen_visa', 'family_reunion', 'profile_analysis', 'other');

-- =============================================
-- TABLES
-- =============================================

-- Users table
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  full_name VARCHAR(255) NOT NULL,
  phone VARCHAR(50),
  role user_role NOT NULL DEFAULT 'client',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  last_login TIMESTAMP WITH TIME ZONE
);

-- Pre-consultations table
CREATE TABLE pre_consultations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  full_name VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL,
  whatsapp VARCHAR(50) NOT NULL,
  destination_country VARCHAR(255),
  service_type service_type,
  message TEXT,
  status VARCHAR(50) DEFAULT 'pending',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Appointments table
CREATE TABLE appointments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  full_name VARCHAR(255) NOT NULL,
  contact VARCHAR(255) NOT NULL,
  country VARCHAR(255),
  service_type VARCHAR(255) NOT NULL,
  preferred_date DATE,
  message TEXT,
  status appointment_status DEFAULT 'pending',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Destinations table
CREATE TABLE destinations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  code VARCHAR(10) UNIQUE NOT NULL,
  name_fr VARCHAR(255) NOT NULL,
  name_es VARCHAR(255) NOT NULL,
  name_ht VARCHAR(255) NOT NULL,
  description_fr TEXT,
  description_es TEXT,
  description_ht TEXT,
  countries_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Services table
CREATE TABLE services (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  code VARCHAR(10) UNIQUE NOT NULL,
  title_fr VARCHAR(255) NOT NULL,
  title_es VARCHAR(255) NOT NULL,
  title_ht VARCHAR(255) NOT NULL,
  body_fr TEXT NOT NULL,
  body_es TEXT NOT NULL,
  body_ht TEXT NOT NULL,
  description_fr TEXT,
  description_es TEXT,
  description_ht TEXT,
  details_fr TEXT,
  details_es TEXT,
  details_ht TEXT,
  order_index INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =============================================
-- INDEXES
-- =============================================

-- Users indexes
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_role ON users(role);

-- Pre-consultations indexes
CREATE INDEX idx_pre_consultations_user_id ON pre_consultations(user_id);
CREATE INDEX idx_pre_consultations_status ON pre_consultations(status);
CREATE INDEX idx_pre_consultations_created_at ON pre_consultations(created_at DESC);

-- Appointments indexes
CREATE INDEX idx_appointments_user_id ON appointments(user_id);
CREATE INDEX idx_appointments_status ON appointments(status);
CREATE INDEX idx_appointments_preferred_date ON appointments(preferred_date);
CREATE INDEX idx_appointments_created_at ON appointments(created_at DESC);

-- Destinations indexes
CREATE INDEX idx_destinations_code ON destinations(code);

-- Services indexes
CREATE INDEX idx_services_code ON services(code);
CREATE INDEX idx_services_order ON services(order_index);

-- =============================================
-- TRIGGERS
-- =============================================

-- Update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply trigger to tables with updated_at
CREATE TRIGGER update_users_updated_at
  BEFORE UPDATE ON users
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_pre_consultations_updated_at
  BEFORE UPDATE ON pre_consultations
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_appointments_updated_at
  BEFORE UPDATE ON appointments
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_destinations_updated_at
  BEFORE UPDATE ON destinations
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_services_updated_at
  BEFORE UPDATE ON services
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- =============================================
-- ROW LEVEL SECURITY (RLS)
-- =============================================

-- Enable RLS on all tables
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE pre_consultations ENABLE ROW LEVEL SECURITY;
ALTER TABLE appointments ENABLE ROW LEVEL SECURITY;
ALTER TABLE destinations ENABLE ROW LEVEL SECURITY;
ALTER TABLE services ENABLE ROW LEVEL SECURITY;

-- Users RLS policies
CREATE POLICY "Users can view own profile"
  ON users FOR SELECT
  USING (auth.uid()::text = id::text);

CREATE POLICY "Users can update own profile"
  ON users FOR UPDATE
  USING (auth.uid()::text = id::text);

-- Note: Admin policies removed to avoid infinite recursion
-- Admin access will be handled by service role functions

-- Pre-consultations RLS policies
CREATE POLICY "Anyone can create pre-consultations"
  ON pre_consultations FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Users can view own pre-consultations"
  ON pre_consultations FOR SELECT
  USING (auth.uid()::text = user_id::text);

CREATE POLICY "Admins and staff can view all pre-consultations"
  ON pre_consultations FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE id = auth.uid()::text::uuid
      AND role IN ('admin', 'staff')
    )
  );

CREATE POLICY "Admins and staff can update pre-consultations"
  ON pre_consultations FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE id = auth.uid()::text::uuid
      AND role IN ('admin', 'staff')
    )
  );

-- Appointments RLS policies
CREATE POLICY "Anyone can create appointments"
  ON appointments FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Users can view own appointments"
  ON appointments FOR SELECT
  USING (auth.uid()::text = user_id::text);

CREATE POLICY "Admins and staff can view all appointments"
  ON appointments FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE id = auth.uid()::text::uuid
      AND role IN ('admin', 'staff')
    )
  );

CREATE POLICY "Admins and staff can update appointments"
  ON appointments FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE id = auth.uid()::text::uuid
      AND role IN ('admin', 'staff')
    )
  );

-- Destinations RLS policies (public read)
CREATE POLICY "Anyone can view destinations"
  ON destinations FOR SELECT
  USING (true);

CREATE POLICY "Admins can manage destinations"
  ON destinations FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE id = auth.uid()::text::uuid
      AND role = 'admin'
    )
  );

-- Services RLS policies (public read)
CREATE POLICY "Anyone can view services"
  ON services FOR SELECT
  USING (true);

CREATE POLICY "Admins can manage services"
  ON services FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE id = auth.uid()::text::uuid
      AND role = 'admin'
    )
  );

-- =============================================
-- INITIAL DATA
-- =============================================

-- Insert default services
INSERT INTO services (code, title_fr, title_es, title_ht, body_fr, body_es, body_ht, description_fr, description_es, description_ht, details_fr, details_es, details_ht, order_index) VALUES
('01', 'Visas', 'Visas', 'Visa', 'Gestion complète des visas d''études, de travail et de résidence avec un dossier impeccable.', 'Gestión completa de visas de estudio, trabajo y residencia con expediente impecable.', 'Jesyon konplè visa etid, travay ak rezidans ak dosye san defo.', 'Préparation et vérification du dossier.', 'Preparación y verificación del expediente.', 'Preparasyon ak verifikasyon dosye a.', 'DIAGHU fournit des services d''assistance et d''orientation pour les demandes de visa touristique.', 'DIAGHU proporciona servicios de asistencia y orientación para solicitudes de visa turístico.', 'DIAGHU bay sèvis asistans ak oryantasyon pou demann viza touristik.', 1),
('02', 'Conseil en immigration', 'Asesoría migratoria', 'Konsèy imigrasyon', 'Conseil personnalisé pour chaque profil, du dossier initial au suivi final.', 'Consejo personalizado para cada perfil, desde el expediente inicial hasta el seguimiento final.', 'Konsèy pèsonalize pou chak profil, soti nan dosye inisyal jiska swiv final la.', 'Orientation concernant les démarches familiales.', 'Orientación sobre trámites familiares.', 'Oryantasyon sou pwosedi fanmi.', 'Assistance pour le regroupement familial et les démarches administratives connexes.', 'Asistencia para el reagrupamiento familiar y trámites administrativos conexos.', 'Asistans pou reyini fanmi ak pwosedi administratif ki gen rapò.', 2),
('03', 'Organisation de voyage', 'Organización de viaje', 'Òganizasyon vwayaj', 'Vols, hébergements et logistique coordonnés pour un départ sans stress.', 'Vuelos, alojamiento y logística coordinados para una salida sin estrés.', 'Vòl, lojman ak lojistik koòdone pou yon depati san stres.', 'Évaluation préliminaire de votre situation.', 'Evaluación preliminar de su situación.', 'Evaluasyon premye sitiyasyon ou.', 'Analyse de profil et consultation pour évaluer votre éligibilité et vos options.', 'Análisis de perfil y consulta para evaluar su elegibilidad y opciones.', 'Analiz profil ak konsiltasyon pou evalye eligibility ou ak opsyon ou yo.', 3),
('04', 'Assistance documentaire', 'Asistencia documentaria', 'Asistans dokimantè', 'Organisation et vérification des pièces du dossier.', 'Organización y verificación de las piezas del expediente.', 'Òganizasyon ak verifikasyon pyès dosye a.', 'Organisation et vérification des pièces du dossier.', 'Organización y verificación de las piezas del expediente.', 'Òganizasyon ak verifikasyon pyès dosye a.', 'Aide à la préparation et à la vérification de tous les documents nécessaires.', 'Ayuda en la preparación y verificación de todos los documentos necesarios.', 'Ed ak preparasyon ak verifikasyon tout dokiman ki nesesè yo.', 4);

-- Insert default destinations
INSERT INTO destinations (code, name_fr, name_es, name_ht, description_fr, description_es, description_ht, countries_count) VALUES
('EU', 'Europe / Schengen', 'Europa / Schengen', 'Ewòp / Schengen', 'Visa Schengen et autres destinations européennes. Informations générales sur les documents, étapes d''application et préparation pour le voyage.', 'Visa Schengen y otros destinos europeos. Información general sobre documentos, pasos de solicitud y preparación para el viaje.', 'Viza Schengen ak lòt destinasyon ewopeyen. Enfòmasyon jeneral sou dokiman, etap aplikasyon ak preparasyon pou vwayaj la.', 27),
('EC', 'Équateur', 'Ecuador', 'Ekwatè', 'Conditions générales, liste des documents à vérifier et procédures spécifiques pour l''Équateur.', 'Condiciones generales, lista de documentos a verificar y procedimientos específicos para Ecuador.', 'Kondisyon jeneral, lis dokiman pou verifye ak pwosedi espesifik pou Ekwatè.', 1),
('BR', 'Brésil', 'Brasil', 'Brezil', 'Exigences pour les visas touristiques et d''affaires, documents nécessaires et processus de demande.', 'Requisitos para visas turísticos y de negocios, documentos necesarios y proceso de solicitud.', 'Ezijans pou viza touristik ak biznis, dokiman nesesè ak pwosedi demann.', 1),
('GF', 'Guyane', 'Guayana', 'Giyàn', 'Informations sur les démarches pour la Guyane française et les territoires d''outre-mer.', 'Información sobre trámites para la Guayana francesa y territorios de ultramar.', 'Enfòmasyon sou pwosedi pou Giyàn franse ak teritwa dwayèlamer.', 1),
('PA', 'Panama', 'Panamá', 'Panama', 'Conditions d''entrée, types de visas et procédures pour les voyageurs vers Panama.', 'Condiciones de entrada, tipos de visas y procedimientos para viajeros hacia Panamá.', 'Kondisyon antre, kalite viza ak pwosedi pou vwayajè ki ale Panama.', 1);

-- =============================================
-- FUNCTIONS
-- =============================================

-- Function to create user with auth
CREATE OR REPLACE FUNCTION create_user_with_auth(
  p_email VARCHAR(255),
  p_password_hash VARCHAR(255),
  p_full_name VARCHAR(255),
  p_phone VARCHAR(50),
  p_role user_role DEFAULT 'client'
)
RETURNS UUID AS $$
DECLARE
  new_user_id UUID;
BEGIN
  INSERT INTO users (email, password_hash, full_name, phone, role)
  VALUES (p_email, p_password_hash, p_full_name, p_phone, p_role)
  RETURNING id INTO new_user_id;
  
  RETURN new_user_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get user stats
CREATE OR REPLACE FUNCTION get_user_stats()
RETURNS TABLE (
  total_users BIGINT,
  total_pre_consultations BIGINT,
  total_appointments BIGINT,
  pending_appointments BIGINT
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    (SELECT COUNT(*) FROM users) as total_users,
    (SELECT COUNT(*) FROM pre_consultations) as total_pre_consultations,
    (SELECT COUNT(*) FROM appointments) as total_appointments,
    (SELECT COUNT(*) FROM appointments WHERE status = 'pending') as pending_appointments;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
