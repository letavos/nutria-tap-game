# Correção Rápida - Validação de Email

## Problema
```
ERROR: 42P01: relation "auth.config" does not exist
```

## Solução Imediata

### 1. 🔧 Configurar URLs no Painel do Supabase

1. **Acesse o painel do Supabase:**
   - Vá para [supabase.com](https://supabase.com)
   - Faça login e selecione seu projeto

2. **Configure as URLs de redirecionamento:**
   - Clique em **Authentication** no menu lateral
   - Clique em **URL Configuration**
   - Configure:
     ```
     Site URL: http://localhost:5173
     
     Redirect URLs:
     - http://localhost:5173
     - http://localhost:5173/#auth-callback
     - http://localhost:5173/#auth-success
     - http://localhost:5173/#auth-error
     ```

3. **Salve as configurações**

### 2. 📧 Configurar Template de Email

1. **Vá para Authentication > Email Templates:**
   - Clique em **Email Templates**
   - Selecione **Confirm signup**

2. **Atualize o template:**
   ```html
   <h2>Confirme seu email</h2>
   <p>Clique no link abaixo para confirmar seu email:</p>
   <a href="{{ .ConfirmationURL }}">Confirmar Email</a>
   <p>Se você não solicitou este email, pode ignorá-lo.</p>
   ```

### 3. 🔄 Testar a Correção

1. **Execute o script simples:**
   ```sql
   -- Execute: supabase-email-simple-fix.sql
   ```

2. **Teste criando uma nova conta:**
   - Tente se registrar novamente
   - Verifique se o email chega
   - Clique no link de confirmação

### 4. 🚨 Solução de Emergência

Se o problema persistir, você pode:

#### Opção A: Desabilitar Verificação Temporariamente
1. Vá para **Authentication > Settings**
2. Desabilite **Enable email confirmations**
3. Teste o registro
4. Reabilite depois

#### Opção B: Verificação Manual
1. Vá para **Authentication > Users**
2. Encontre o usuário
3. Clique em **Actions > Confirm user**

#### Opção C: Usar Email de Teste
1. Vá para **Authentication > Settings**
2. Configure um email de teste
3. Use esse email para desenvolvimento

### 5. 📋 Verificações Importantes

Execute este script para verificar se tudo está funcionando:

```sql
-- Execute: supabase-email-simple-fix.sql
```

Verifique se:
- ✅ Usuários estão sendo criados na tabela `users`
- ✅ Colunas de referência existem
- ✅ Políticas de RLS estão corretas
- ✅ View de ranking existe

### 6. 🔍 Troubleshooting

#### Erro: "Email link is invalid or has expired"
- ✅ Verifique se as URLs de redirecionamento estão corretas
- ✅ Verifique se o JWT expiry está configurado (3600 segundos)
- ✅ Tente reenviar o email

#### Erro: "User not found"
- ✅ Verifique se o usuário foi criado na tabela `users`
- ✅ Verifique se o email está correto

#### Email não chega
- ✅ Verifique a caixa de spam
- ✅ Verifique se o template de email está configurado
- ✅ Verifique se o SMTP está configurado

### 7. 📞 Suporte

Se nada funcionar:
1. Verifique os logs do Supabase
2. Teste com um email diferente
3. Tente criar uma conta com email de teste
4. Verifique se há problemas de rede/firewall

## Arquivos Úteis

- `supabase-email-simple-fix.sql` - Script de verificação
- `EmailVerification.jsx` - Componente de reenvio
- `SUPABASE_EMAIL_CONFIG.md` - Guia completo
