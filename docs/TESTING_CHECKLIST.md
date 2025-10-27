# Testing Checklist - IP Asset Registration

Esta guía te ayudará a verificar que el registro de IP Assets funcione correctamente con la metadata completa.

## Pre-requisitos ✅

- [ ] Node.js instalado
- [ ] Dependencias instaladas (`npm install`)
- [ ] Archivo `.env.local` configurado con:
  - `SPG_NFT_CONTRACT=0xf06808081f6000F17c68D020ec8b159B0A851952`
  - `NEXT_PUBLIC_RPC_PROVIDER_URL=https://rpc.storyrpc.io`
  - `NEXT_PUBLIC_PINATA_JWT=...` (tu JWT de Pinata)
  - `STORY_API_KEY=...` (tu API key de Story)
- [ ] Wallet con tokens IP en Story Mainnet

## Paso 1: Iniciar la Aplicación 🚀

```bash
npm run dev
```

Verifica que:
- [ ] La app inicia sin errores
- [ ] Puedes acceder a http://localhost:3000
- [ ] No hay errores en la consola del navegador

## Paso 2: Conectar Wallet 🔐

1. Ve a la página de registro: http://localhost:3000/en/register-piece
2. Conecta tu wallet (MetaMask, etc.)
3. Verifica:
   - [ ] Wallet se conecta correctamente
   - [ ] Estás en **Story Mainnet (Chain ID: 1514)**
   - [ ] Tienes al menos 0.1 IP tokens para gas

> **Si estás en testnet:** Cambia en `.env.local`:
> ```
> NEXT_PUBLIC_RPC_PROVIDER_URL=https://aeneid.storyrpc.io
> SPG_NFT_CONTRACT=0xc32A8a0FF3beDDDa58393d022aF433e78739FAbc
> ```

## Paso 3: Llenar Formulario de Registro 📝

### Step 1: Nombre de la Obra
- [ ] Ingresa: "Test Alebrije Digital"
- [ ] Debe aceptar hasta 30 caracteres

### Step 2: Subir Imagen
- [ ] Sube una imagen de prueba (JPG, PNG)
- [ ] Verifica que se muestre el preview
- [ ] Tamaño recomendado: < 5MB

### Step 3: Descripción
- [ ] Escribe o genera con AI: "Una obra de prueba para verificar el registro de IP Assets en Story Protocol"
- [ ] La descripción debe ser clara y descriptiva

### Step 4: Precio de Licencia
- [ ] Ingresa: 0.01 (o el precio que desees)
- [ ] Debe aceptar números decimales

### Step 5: Permisos de Remix
- [ ] Selecciona: "Yes" o "No"

### Step 6: Resumen
- [ ] Verifica que todos los datos sean correctos
- [ ] Puedes editar cualquier campo aquí

## Paso 4: Registrar IP Asset 🎨

1. Click en "Submit"
2. Observa la consola del navegador (F12) para ver el progreso:

```
Esperados logs en consola:
✅ Uploading image to IPFS...
✅ Image uploaded: https://gateway.pinata.cloud/ipfs/Qm...
✅ Preparing metadata...
✅ Uploading IP metadata to IPFS...
✅ Uploading NFT metadata to IPFS...
✅ Creating metadata hashes...
✅ Initializing Story Protocol client...
✅ Registering IP Asset on Story Protocol...
```

3. **Aprobar transacción en tu wallet**
   - [ ] Wallet muestra popup de confirmación
   - [ ] Gas fee es razonable (< 0.01 IP)
   - [ ] Confirmas la transacción

4. **Esperar confirmación**
   - [ ] Transacción se confirma en la blockchain
   - [ ] Modal de éxito aparece con:
     - Transaction Hash
     - IP ID
     - Token ID

## Paso 5: Verificar Metadata en IPFS 📦

Desde los logs de consola, copia los URIs de IPFS:

### IP Metadata
```bash
# Busca en logs: "Uploading IP metadata to IPFS..."
# Ejemplo URL: https://gateway.pinata.cloud/ipfs/QmXXX...
```

Abre el URL en tu navegador y verifica:
- [ ] `title`: "Test Alebrije Digital"
- [ ] `description`: Tu descripción
- [ ] `image`: URL de la imagen
- [ ] `creators[0].name`: "Manantial Blanco Artist"
- [ ] `creators[0].address`: Tu wallet address
- [ ] `creators[0].socialMedia`: Array con 2 plataformas
- [ ] `attributes`: Array con al menos 6 atributos
- [ ] `tags`: ["digital-art", "ip-asset", "story-protocol"]
- [ ] `createdAt`: Timestamp ISO
- [ ] `originalLanguage`: "es"
- [ ] `app.name`: "Manantial Blanco Portal"

### NFT Metadata
```bash
# Busca en logs: "Uploading NFT metadata to IPFS..."
# Ejemplo URL: https://gateway.pinata.cloud/ipfs/QmYYY...
```

Abre el URL y verifica:
- [ ] `name`: "Test Alebrije Digital"
- [ ] `description`: Tu descripción
- [ ] `image`: Empieza con "ipfs://Qm..."
- [ ] `animation_url`: Igual que image
- [ ] `external_url`: URL a Story Protocol
- [ ] `mediaUrl`: URL HTTP completa
- [ ] `mediaType`: "image/jpeg" o "image/png"
- [ ] `mediaHash`: Hash 0x... (66 caracteres)
- [ ] `attributes`: Igual que IP metadata
- [ ] `creators`: Tu address y nombre

## Paso 6: Verificar en Story Protocol Explorer 🔍

1. Copia el **IP ID** del modal de éxito
2. Ve a: https://storyscan.xyz
3. Busca tu IP ID
4. Verifica:
   - [ ] IP Asset existe en la blockchain
   - [ ] Token ID correcto
   - [ ] Owner es tu wallet
   - [ ] Metadata URI apunta a tu IPFS

### Información Esperada:
```
IP ID: 0x...
Token Contract: 0xf06808081f6000F17c68D020ec8b159B0A851952
Token ID: [número]
Owner: [tu wallet]
Metadata URI: ipfs://Qm...
```

## Paso 7: Verificar en Dashboard (Opcional) 📊

1. Ve a: http://localhost:3000/en/home
2. Verifica:
   - [ ] Tu obra aparece en el dashboard
   - [ ] Imagen se muestra correctamente
   - [ ] Nombre y descripción correctos
   - [ ] Status: "Completed" o "Pending"

## Estructura de Metadata Esperada 📋

### IP Metadata (Completo)
```json
{
  "title": "Test Alebrije Digital",
  "description": "Una obra de prueba...",
  "image": "https://gateway.pinata.cloud/ipfs/Qm...",
  "creators": [
    {
      "name": "Manantial Blanco Artist",
      "address": "0x...",
      "contributionPercent": 100,
      "socialMedia": [
        {
          "platform": "Story Protocol",
          "url": "https://portal.story.foundation/user/0x..."
        },
        {
          "platform": "Website",
          "url": "https://manantialblanco.com"
        }
      ]
    }
  ],
  "attributes": [
    { "trait_type": "tag", "value": "digital-art" },
    { "trait_type": "tag", "value": "ip-asset" },
    { "trait_type": "tag", "value": "story-protocol" },
    { "trait_type": "platform", "value": "Manantial Blanco" },
    { "trait_type": "type", "value": "Original Artwork" },
    { "trait_type": "registered_on", "value": "Story Protocol" }
  ],
  "tags": ["digital-art", "ip-asset", "story-protocol"],
  "createdAt": "2025-01-24T...",
  "originalLanguage": "es",
  "app": {
    "id": "manantial-blanco",
    "name": "Manantial Blanco Portal",
    "website": "https://manantialblanco.com"
  }
}
```

## Troubleshooting 🔧

### Error: "Wrong network"
**Solución:** Cambia tu wallet a Story Mainnet (1514) o Aeneid Testnet (1315)

### Error: "Failed to fetch"
**Solución:**
- Verifica tu conexión a internet
- Verifica que `NEXT_PUBLIC_RPC_PROVIDER_URL` esté correcto
- Prueba con testnet si mainnet falla

### Error: "SPG_NFT_CONTRACT not configured"
**Solución:** Verifica `.env.local`:
```env
SPG_NFT_CONTRACT=0xf06808081f6000F17c68D020ec8b159B0A851952
```

### Error: "Failed to upload to IPFS"
**Solución:**
- Verifica que `NEXT_PUBLIC_PINATA_JWT` esté correcto
- Verifica que tu cuenta de Pinata tenga espacio disponible
- Prueba con una imagen más pequeña

### Error: "Insufficient funds"
**Solución:** Necesitas más tokens IP en tu wallet para gas

### Metadata incompleta en IPFS
**Solución:**
- Limpia caché del navegador
- Reinicia el servidor (`npm run dev`)
- Verifica que los cambios en `story.ts` se hayan guardado

## Logs Importantes a Guardar 📝

Si algo falla, guarda estos logs:
1. **Console logs del navegador** (F12 → Console)
2. **Transaction hash** de la blockchain
3. **IPFS URLs** de ambos metadata files
4. **Error messages** completos

## Reporte de Resultados ✅

Una vez completado el test, reporta:

```markdown
## Test Results

- **Fecha:** [fecha/hora]
- **Network:** Mainnet / Testnet
- **Wallet:** 0x...
- **Transaction Hash:** 0x...
- **IP ID:** 0x...
- **Token ID:** [número]
- **IP Metadata URI:** ipfs://Qm...
- **NFT Metadata URI:** ipfs://Qm...

### Campos Verificados:
- [ ] Todos los campos obligatorios presentes
- [ ] Social media links correctos
- [ ] Attributes completos (6+)
- [ ] Tags por defecto aplicados
- [ ] Timestamp de creación presente
- [ ] App info presente
- [ ] Media hash correcto

### Issues Encontrados:
[Ninguno / Listar issues]
```

## Next Steps 🚀

Si todo funciona:
1. ✅ El sistema está listo para producción
2. ✅ La metadata cumple con Story Protocol
3. ✅ Puedes empezar a registrar obras reales

Si hay problemas:
1. Documenta el error exacto
2. Comparte los logs
3. Verifica la documentación en `docs/`
