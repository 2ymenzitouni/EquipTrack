GRANT USAGE ON SCHEMA public TO anon;
GRANT INSERT ON TABLE public.students, public.loans TO anon;

DROP POLICY IF EXISTS "Allow anonymous student registration" ON public.students;
CREATE POLICY "Allow anonymous student registration"
  ON public.students
  FOR INSERT
  TO anon
  WITH CHECK (true);

DROP POLICY IF EXISTS "Allow anonymous loan registration" ON public.loans;
CREATE POLICY "Allow anonymous loan registration"
  ON public.loans
  FOR INSERT
  TO anon
  WITH CHECK (true);
