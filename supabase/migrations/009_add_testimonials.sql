-- =============================================
-- Testimonials Table Migration
-- =============================================

-- Create testimonials table
CREATE TABLE testimonials (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  client_name VARCHAR(255) NOT NULL,
  content TEXT NOT NULL,
  language VARCHAR(10) DEFAULT 'ht',
  is_approved BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes
CREATE INDEX idx_testimonials_approved ON testimonials(is_approved);
CREATE INDEX idx_testimonials_created_at ON testimonials(created_at DESC);

-- Enable RLS
ALTER TABLE testimonials ENABLE ROW LEVEL SECURITY;

-- Public can read approved testimonials
CREATE POLICY "Anyone can view approved testimonials"
  ON testimonials FOR SELECT
  USING (is_approved = true);

-- Admins can manage testimonials
CREATE POLICY "Admins can manage testimonials"
  ON testimonials FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE id = auth.uid()::text::uuid
      AND role = 'admin'
    )
  );

-- Add trigger for updated_at
CREATE TRIGGER update_testimonials_updated_at
  BEFORE UPDATE ON testimonials
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Insert the testimonials from WhatsApp messages
INSERT INTO testimonials (client_name, content, language, is_approved) VALUES
('Client anonyme', 'Good evening, Mr Diaghu. Thank you for the consultation this morning. I appreciate your clarity, your guidance, and the care you took in answering our questions. I''ll keep you updated.', 'en', true),
('Client anonyme', 'ou byn Jerem anpi map gade traduction an frèm se yon chay kado pum bow wi', 'ht', true),
('Client anonyme', 'Bnsoir DG kóman ouye menm mp diw yon grand merci pasyance ou epou support ou ban mwen nan tout moman difisil yo malgre rout la telong apre Bondye oufém rive avk mwen a destination final, anplus mp mande Bondye kontinye beni''w nan tout sa wap antre prand', 'ht', true),
('Client anonyme', 'Mèsi anpil pou tout sa ou fè pou mwen. Mwen pa janm blije jan ou te ede mwen.', 'ht', true),
('Client anonyme', 'Bondye beni ou. Mwen pa janm blije lajan ou te pran pou ede mwen.', 'ht', true),
('Client anonyme', 'Mwen te vle di ou yon gwo mèsi. Ou pa sèlman ede mwen antre nan Ekwatè, ou ede mwen pran yon gwo etap nan lavi mwen, ou kontribye nan reyalizasyon yon bagay ki pi valab pou mwen. Mwen konnen sa pa te yon ti bagay, tankou sakrifik ou yo. Gen moun ki pase nan lavi nou epi kite yon mak nou pa janm efase, paske yo ede nou nan moman nou bezwen yo pi. Pou mwen, ou se youn nan moun sa yo. Mwen pa janm blije byen ou te fè pou mwen. Mèsi, mèsi, mèsi!!!!!!!!', 'ht', true),
('Client anonyme', 'Mèsi paske ou te kwè nan mwen, paske ou te ede m rive kote mwen ye jodi a, epi paske ou te jwe yon wòl enpòtan nan etap sa a nan lavi mwen. Kèlkeswa kote lavi mennen m, mwen pap janm vle bliye moun ki te lonje men ban mwen pou m te ka avanse. Mwen pap janm konsidere èd ou a kòm yon bagay mwen te dwe jwenn, men kòm yon favè mwen dwe toujou pote nan kè m ak anpil rekonesans. mesi anpil anpil 🙏', 'ht', true);
