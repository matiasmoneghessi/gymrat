import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string | undefined;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined;

if (!supabaseUrl || !supabaseAnonKey) {
  // En desarrollo mostramos un warning si faltan las envs,
  // para que sea más fácil detectar la mala configuración.
  // En producción es responsabilidad de la configuración CI/hosting.
  // eslint-disable-next-line no-console
  console.warn(
    '[Supabase] VITE_SUPABASE_URL o VITE_SUPABASE_ANON_KEY no están configuradas. OAuth no funcionará hasta que las completes en el .env del frontend.',
  );
}

export const supabase = createClient(supabaseUrl ?? '', supabaseAnonKey ?? '');

