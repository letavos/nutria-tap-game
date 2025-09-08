// Script de teste para debug do sistema de referência
// Execute no console do navegador

console.log('=== TESTE DE DEBUG DO SISTEMA DE REFERÊNCIA ===');

// 1. Verificar se o Supabase está configurado
console.log('1. Verificando configuração do Supabase...');
console.log('Supabase URL:', import.meta.env.VITE_SUPABASE_URL);
console.log('Supabase Anon Key:', import.meta.env.VITE_SUPABASE_ANON_KEY ? 'Configurado' : 'NÃO CONFIGURADO');

// 2. Verificar se o usuário está logado
console.log('2. Verificando status de login...');
// Você precisa executar isso no contexto do React
// console.log('Usuário logado:', user);
// console.log('ID do usuário:', user?.id);

// 3. Testar busca direta no Supabase
console.log('3. Testando busca direta...');
// Execute isso no console do navegador quando estiver logado:
/*
const { createClient } = await import('@supabase/supabase-js');
const supabase = createClient(
  'SUA_URL_AQUI',
  'SUA_CHAVE_AQUI'
);

const { data: userData, error } = await supabase
  .from('users')
  .select('referral_id, username, email')
  .eq('id', 'SEU_USER_ID_AQUI')
  .single();

console.log('Dados do usuário:', userData);
console.log('Erro:', error);
*/

console.log('=== FIM DO TESTE ===');
