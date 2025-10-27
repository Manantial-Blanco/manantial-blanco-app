# Story Protocol Testnet Setup Guide

Esta guía te ayudará a configurar la aplicación para usar Story Protocol Testnet (Aeneid).

## 🎯 Configuración Rápida

### 1. Variables de Entorno

Actualiza tu `.env.local` con estas variables:

```bash
# Story Protocol - TESTNET (Aeneid)
NEXT_PUBLIC_RPC_PROVIDER_URL=https://aeneid.storyrpc.io
SPG_NFT_CONTRACT=0xc32A8a0FF3beDDDa58393d022aF433e78739FAbc

# Pinata (IPFS)
NEXT_PUBLIC_PINATA_JWT=tu_jwt_de_pinata
NEXT_PUBLIC_PINATA_GATEWAY=https://gateway.pinata.cloud/ipfs/

# Reown (Wallet)
NEXT_PUBLIC_REOWN_PROJECT_ID=tu_project_id
```

### 2. Agregar Story Aeneid Testnet a tu Wallet

**Información de la Red:**
- **Network Name:** Story Aeneid Testnet
- **RPC URL:** https://aeneid.storyrpc.io
- **Chain ID:** 1315 (0x523 en hex)
- **Currency Symbol:** $IP
- **Block Explorer:** https://aeneid.storyscan.xyz

**Agregar a MetaMask:**
1. Abre MetaMask
2. Click en la red actual (arriba)
3. Click "Add Network" o "Add a network manually"
4. Ingresa los datos de arriba
5. Click "Save"

**O usa este enlace directo:**
- [Add Story Aeneid Testnet to MetaMask](https://chainlist.org/?search=story&testnets=true)

### 3. Obtener Tokens de Testnet

Necesitas $IP tokens de testnet para pagar gas:

**Faucet de Story Protocol:**
1. Ve al faucet: https://faucet.story.foundation/
2. Conecta tu wallet
3. Solicita tokens $IP para testnet
4. Espera unos minutos

**Cantidad recomendada:** 1-2 $IP para múltiples registros

### 4. Verificar Configuración

Verifica que todo esté correcto:

```bash
# 1. Verifica variables de entorno
cat .env.local | grep STORY

# Deberías ver:
# NEXT_PUBLIC_RPC_PROVIDER_URL=https://aeneid.storyrpc.io
# SPG_NFT_CONTRACT=0xc32A8a0FF3beDDDa58393d022aF433e78739FAbc
```

### 5. Reiniciar Servidor

```bash
# Detén el servidor (Ctrl+C)
npm run dev
```

## 🧪 Probar el Registro

### Paso a Paso:

1. **Abre la app:** http://localhost:3000/en/register-piece

2. **Conecta Wallet:**
   - Click "Connect Wallet"
   - Selecciona MetaMask
   - Asegúrate de estar en **Story Aeneid Testnet**

3. **Completa el Formulario:**
   - **Step 1:** Nombre de tu pieza
   - **Step 2:** Sube una imagen
   - **Step 3:** Descripción (puedes usar AI)
   - **Step 4:** Precio de licencia (ej: 10)
   - **Step 5:** Permisos de remix (Yes/No)
   - **Step 6:** Revisa y envía

4. **Confirma Transacción:**
   - Se abrirá MetaMask
   - Revisa el gas fee
   - Click "Confirm"

5. **Espera Confirmación:**
   - El proceso puede tomar 30-60 segundos
   - Verás logs en la consola del navegador
   - Modal de éxito mostrará:
     - Transaction Hash
     - IP Asset ID
     - Token ID

## 🔍 Verificar el Registro

### En el Explorer:

1. Copia el Transaction Hash del modal de éxito
2. Ve a: https://aeneid.storyscan.xyz
3. Pega el hash en la búsqueda
4. Verás:
   - Estado de la transacción
   - Gas usado
   - Contract interactions
   - Event logs

### En la Consola del Navegador:

Abre DevTools (F12) y verás logs como:
```
Uploading image to IPFS...
Image uploaded: https://gateway.pinata.cloud/ipfs/Qm...
Preparing metadata...
Uploading IP metadata to IPFS...
Uploading NFT metadata to IPFS...
Creating metadata hashes...
Initializing Story Protocol client...
Registering IP Asset on Story Protocol...
IP Asset registered successfully: {...}
```

## ❓ Troubleshooting

### Error: "Insufficient funds"
- **Causa:** No tienes suficiente $IP para gas
- **Solución:** Obtén más tokens del faucet

### Error: "User rejected transaction"
- **Causa:** Cancelaste la transacción en MetaMask
- **Solución:** Intenta de nuevo y confirma en MetaMask

### Error: "Wrong network"
- **Causa:** No estás en Story Aeneid Testnet
- **Solución:** Cambia de red en MetaMask

### Error: "Pinata not configured"
- **Causa:** Falta `NEXT_PUBLIC_PINATA_JWT`
- **Solución:** Agrega tu JWT de Pinata a `.env.local`

### Error: "Failed to register IP asset"
- **Causa:** Puede ser un problema de red o contrato
- **Solución:**
  1. Verifica que tengas $IP para gas
  2. Revisa los logs de la consola
  3. Intenta de nuevo

## 📊 Datos del Testnet

- **Network:** Story Aeneid Testnet
- **Chain ID:** 1315
- **RPC URL:** https://aeneid.storyrpc.io
- **Explorer:** https://aeneid.storyscan.xyz
- **Faucet:** https://faucet.story.foundation
- **SPG NFT Contract:** 0xc32A8a0FF3beDDDa58393d022aF433e78739FAbc

## 🚀 Migrar a Mainnet

Cuando estés listo para producción:

1. Actualiza `.env.local`:
```bash
NEXT_PUBLIC_RPC_PROVIDER_URL=https://rpc.odyssey.storyrpc.io
SPG_NFT_CONTRACT=tu_contrato_propio
```

2. Cambia chainId en `lib/services/story.ts`:
```typescript
chainId: 'mainnet', // Story Odyssey mainnet
```

3. Despliega tu propio SPG NFT contract

4. Usa $IP tokens reales (no testnet)

## 📚 Resources

- [Story Protocol Docs](https://docs.story.foundation/)
- [Story Explorer (Testnet)](https://aeneid.storyscan.xyz)
- [Story Faucet](https://faucet.story.foundation/)
- [Pinata Docs](https://docs.pinata.cloud/)

## 📡 Story API Endpoints

La aplicación detecta automáticamente qué endpoint usar basándose en `NEXT_PUBLIC_RPC_PROVIDER_URL`:

- **Testnet (Aeneid):** `https://api.aeneid.storyapis.com/api/v4`
- **Mainnet (Odyssey):** `https://api.storyapis.com/api/v4`

No necesitas configurar nada adicional. Cuando cambias el RPC URL, la API también cambia automáticamente.

