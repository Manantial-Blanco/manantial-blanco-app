# Story Protocol RPC Endpoints

Si tienes problemas de conexión con un RPC, prueba con estos endpoints alternativos.

## Mainnet (Chain ID: 1514)

### Oficiales de Story Protocol
```env
# Opción 1 (Primario)
NEXT_PUBLIC_RPC_PROVIDER_URL=https://rpc.storyrpc.io

# Opción 2 (Alternativo - Odyssey)
NEXT_PUBLIC_RPC_PROVIDER_URL=https://odyssey.storyrpc.io

# Opción 3 (Alternativo)
NEXT_PUBLIC_RPC_PROVIDER_URL=https://rpc.story.foundation
```

### Públicos de Terceros
```env
# Ankr
NEXT_PUBLIC_RPC_PROVIDER_URL=https://rpc.ankr.com/story

# QuickNode (requiere API key)
NEXT_PUBLIC_RPC_PROVIDER_URL=https://your-endpoint.story.quiknode.pro/[API_KEY]

# Infura (requiere API key)
NEXT_PUBLIC_RPC_PROVIDER_URL=https://story-mainnet.infura.io/v3/[API_KEY]
```

## Testnet - Aeneid (Chain ID: 1315)

```env
# Primario
NEXT_PUBLIC_RPC_PROVIDER_URL=https://aeneid.storyrpc.io

# Alternativo
NEXT_PUBLIC_RPC_PROVIDER_URL=https://testnet.storyrpc.io
```

## Troubleshooting

### Error: ERR_NAME_NOT_RESOLVED

**Causa:** Tu DNS no puede resolver el dominio del RPC.

**Soluciones:**

1. **Cambia el DNS de tu sistema:**
   - Usa Google DNS: 8.8.8.8 y 8.8.4.4
   - O Cloudflare DNS: 1.1.1.1 y 1.0.0.1

2. **Prueba otro RPC:**
   ```bash
   # En .env.local, cambia a:
   NEXT_PUBLIC_RPC_PROVIDER_URL=https://odyssey.storyrpc.io
   ```

3. **Verifica tu VPN:**
   - Algunos VPNs bloquean ciertos dominios
   - Intenta desactivar el VPN temporalmente

4. **Verifica tu Firewall:**
   - Asegúrate de que no esté bloqueando storyrpc.io

5. **Usa un RPC de terceros:**
   - Crea una cuenta en Ankr, QuickNode o Infura
   - Usa su endpoint específico

### Error: Failed to fetch

**Causa:** El RPC está respondiendo pero rechazando la petición.

**Soluciones:**

1. **Verifica rate limits:**
   - Los RPCs públicos tienen límites de requests
   - Espera unos minutos y reintenta

2. **Usa un RPC dedicado:**
   - Crea una cuenta en un proveedor
   - Obtén tu propio endpoint

### Verificar Estado del RPC

```bash
# Prueba si el RPC responde
curl -X POST https://rpc.storyrpc.io \
  -H "Content-Type: application/json" \
  -d '{"jsonrpc":"2.0","method":"eth_blockNumber","params":[],"id":1}'
```

Respuesta esperada:
```json
{
  "jsonrpc": "2.0",
  "id": 1,
  "result": "0x..." // número de bloque en hex
}
```

## Configuración Actual

Para ver qué RPC estás usando actualmente:

```bash
npx tsx scripts/verify-config.ts
```

## Cambiar RPC

1. Edita `.env.local`:
```env
NEXT_PUBLIC_RPC_PROVIDER_URL=https://[nuevo-rpc]
```

2. Reinicia el servidor:
```bash
# Ctrl+C para detener
npm run dev
```

3. Prueba de nuevo

## RPCs Recomendados por Situación

| Situación | RPC Recomendado | Notas |
|-----------|----------------|-------|
| Desarrollo normal | `https://rpc.storyrpc.io` | Oficial, gratis |
| RPC principal caído | `https://odyssey.storyrpc.io` | Alternativo oficial |
| Alto volumen de requests | QuickNode/Infura | Requiere cuenta |
| Problemas de DNS | `https://odyssey.storyrpc.io` | A veces resuelve mejor |
| VPN/Firewall issues | Ankr o terceros | Diferentes dominios |

## Contact Support

Si ningún RPC funciona:

1. **Discord de Story Protocol:** https://discord.gg/storyprotocol
   - Canal #support

2. **GitHub Issues:** https://github.com/storyprotocol/protocol-core-v1/issues

3. **Status Page:** Revisa si hay mantenimiento programado
