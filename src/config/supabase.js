import { createClient } from '@supabase/supabase-js'

// Configurações do Supabase
const supabaseUrl = 'https://zbcnjzkuyphklzakrrsv.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpiY25qemt1eXBoa2x6YWtycnN2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTcyMDEzNTAsImV4cCI6MjA3Mjc3NzM1MH0.rMp3qvTlIEHn5DRZTtI0UHTV_iQe7urj90PL-KgXQ5Y'

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn('Supabase não configurado. Usando modo offline.')
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Função para verificar se Supabase está configurado
export const isSupabaseConfigured = () => {
  return !!(supabaseUrl && supabaseAnonKey)
}

// Função para testar conexão
export const testSupabaseConnection = async () => {
  try {
    const { data, error } = await supabase.from('users').select('count').limit(1)
    if (error) throw error
    return { success: true, data }
  } catch (error) {
    console.error('Erro ao conectar com Supabase:', error)
    return { success: false, error: error.message }
  }
}
