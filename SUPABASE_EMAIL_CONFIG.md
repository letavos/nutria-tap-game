# Configuração de Email do Supabase

## Problema
Erro ao validar email: `access_denied&error_code=otp_expired&error_description=Email+link+is+invalid+or+has+expired`

## Soluções

### 1. Configurar URLs de Redirecionamento no Supabase

1. **Acesse o painel do Supabase:**
   - Vá para [supabase.com](https://supabase.com)
   - Faça login na sua conta
   - Selecione seu projeto

2. **Vá para Authentication > URL Configuration:**
   - Clique em "Authentication" no menu lateral
   - Clique em "URL Configuration"

3. **Configure as URLs:**
   ```
   Site URL: http://localhost:5173
   
   Redirect URLs:
   - http://localhost:5173
   - http://localhost:5173/#auth-callback
   - http://localhost:5173/#auth-success
   - http://localhost:5173/#auth-error
   ```

4. **Salve as configurações**

### 2. Configurar Templates de Email

1. **Vá para Authentication > Email Templates:**
   - Clique em "Email Templates"
   - Selecione "Confirm signup"

2. **Atualize o template:**
   ```html
   <h2>Confirme seu email</h2>
   <p>Clique no link abaixo para confirmar seu email:</p>
   <a href="{{ .ConfirmationURL }}">Confirmar Email</a>
   <p>Se você não solicitou este email, pode ignorá-lo.</p>
   ```

3. **Salve o template**

### 3. Verificar Configurações de JWT

1. **Vá para Authentication > Settings:**
   - Clique em "Settings"
   - Verifique "JWT expiry limit": 3600 (1 hora)
   - Verifique "Refresh token expiry": 2592000 (30 dias)

### 4. Testar a Configuração

1. **Execute o script SQL:**
   ```sql
   -- Execute: supabase-fix-email-validation.sql
   ```

2. **Teste o reenvio de email:**
   - Use o componente `EmailVerification`
   - Tente criar uma nova conta
   - Verifique se o email chega

### 5. Soluções Alternativas

#### Opção A: Desabilitar Verificação de Email (Desenvolvimento)
```sql
-- No Supabase SQL Editor
UPDATE auth.config 
SET value = 'false' 
WHERE key = 'ENABLE_SIGNUP';
```

#### Opção B: Usar Email de Teste
- Configure um email de teste no Supabase
- Use o email de teste para desenvolvimento

#### Opção C: Verificação Manual
- Acesse o painel do Supabase
- Vá para Authentication > Users
- Marque o usuário como verificado manualmente

## Componentes Criados

1. **EmailVerification.jsx** - Componente para reenviar email
2. **supabase-fix-email-validation.sql** - Script de diagnóstico
3. **Estilos CSS** - Para o componente de verificação

## Como Usar

1. Importe o componente:
   ```jsx
   import EmailVerification from './components/EmailVerification';
   ```

2. Use no seu app:
   ```jsx
   <EmailVerification onVerified={() => console.log('Email verificado!')} />
   ```

## Troubleshooting

### Erro: "Email link is invalid or has expired"
- Verifique se as URLs de redirecionamento estão corretas
- Verifique se o JWT expiry está configurado corretamente
- Tente reenviar o email

### Erro: "User not found"
- Verifique se o usuário foi criado corretamente
- Verifique se o email está correto

### Email não chega
- Verifique a caixa de spam
- Verifique se o template de email está configurado
- Verifique se o SMTP está configurado no Supabase
