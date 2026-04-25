# Segurança

## Medidas implementadas

### Aplicação

- headers HTTP defensivos no Express
- endpoint `/health` separado
- `x-powered-by` desabilitado
- CSP básica para produção
- HSTS em produção

### Infraestrutura

- MySQL exposto somente em `127.0.0.1`
- healthchecks em app e banco
- `.env` fora do versionamento
- scripts para geração de segredos

## Geração de segredos

```bash
./ops/security/generate-secrets.sh
```

Use a saída para preencher `.env`.

## Auditoria operacional

```bash
./ops/security/security-audit.sh
```

Ou:

```bash
npm run security:audit
make security-audit
```

O script executa:

1. `npm run check`
2. `npm run build`
3. `npm audit --omit=dev`
4. `docker compose config`

## Checklist recomendado

1. Trocar todas as senhas padrão antes de produção.
2. Publicar a aplicação atrás de Nginx com TLS válido.
3. Restringir SSH por chave e IP quando possível.
4. Manter Docker, Node e MySQL atualizados.
5. Habilitar monitoramento de logs e backup externo.
6. Não usar credenciais demo em ambiente real.

## Limitações atuais

1. A autenticação ainda é local e client-side.
2. Dados de negócio ainda ficam no navegador.
3. Não há RBAC no backend porque ainda não existe API persistente.
