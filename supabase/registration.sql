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

CREATE OR REPLACE FUNCTION public.register_student_with_loan(
  p_student_id uuid,
  p_type varchar,
  p_phone_number varchar,
  p_full_name varchar,
  p_email varchar,
  p_class json,
  p_equipment_id uuid,
  p_equipment_name varchar,
  p_nfc_uid varchar,
  p_status varchar
)
RETURNS void
LANGUAGE plpgsql
SECURITY INVOKER
SET search_path = ''
AS $function$
BEGIN
  INSERT INTO public.students (
    id,
    type,
    phone_number,
    full_name,
    email,
    "class"
  )
  VALUES (
    p_student_id,
    p_type,
    p_phone_number,
    p_full_name,
    p_email,
    p_class
  );

  INSERT INTO public.loans (
    equipment_id,
    student_id,
    equipment_name,
    nfc_uid,
    status
  )
  VALUES (
    p_equipment_id,
    p_student_id,
    p_equipment_name,
    p_nfc_uid,
    p_status
  );
END;
$function$;

REVOKE ALL ON FUNCTION public.register_student_with_loan(
  uuid,
  varchar,
  varchar,
  varchar,
  varchar,
  json,
  uuid,
  varchar,
  varchar,
  varchar
) FROM PUBLIC;

GRANT EXECUTE ON FUNCTION public.register_student_with_loan(
  uuid,
  varchar,
  varchar,
  varchar,
  varchar,
  json,
  uuid,
  varchar,
  varchar,
  varchar
) TO anon;

NOTIFY pgrst, 'reload schema';
