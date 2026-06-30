CREATE TRIGGER turmas_updated_at
  BEFORE UPDATE ON turmas
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();