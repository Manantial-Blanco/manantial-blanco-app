# Guía de Prueba: Flujo de Remix con Rock10

## 1. Verificar Licencias de Rock10

**Ejecutar:**
```bash
npx tsx scripts/check-rock10.ts
```

**Resultado Esperado:**
```
🎸 Checking Rock10 IP Asset
IP ID: 0x2309C7B3F8A33aF01bc6d5fB80471F627976Ef42

✅ Number of attached licenses: [NÚMERO]

📜 Attached Licenses:
   1. License Terms ID: [ID]
      Name: [NOMBRE DE LICENCIA]
```

---

## 2. Escenarios Posibles

### ✅ ESCENARIO A: Rock10 tiene License ID 1 (Non-Commercial Social Remixing)

**Qué significa:**
- ✅ Rock10 puede ser remixado
- ✅ El flujo actual de remix debería funcionar

**Pasos para probar:**

1. **Ir a la landing page:**
   - `http://localhost:3000/en/landing` o `http://localhost:3000/es/landing`

2. **Buscar Rock10 en la galería:**
   - Scroll por las piezas hasta encontrar "Rock10"
   - Confirmar que el botón "Remix" está visible

3. **Iniciar flujo de remix:**
   - Click en botón "Remix" de Rock10
   - Debería redirigir a `/remix/0x2309C7B3F8A33aF01bc6d5fB80471F627976Ef42`

4. **Verificar información del parent:**
   - ✅ Imagen de Rock10 debería mostrarse (80x80px con borde azul)
   - ✅ Título "Rock10" debería aparecer
   - ✅ IP ID debería mostrarse

5. **Step 1: Adquirir Licencia**
   - Click en "Mint License Token"
   - Aprobar transacción en wallet
   - Esperar confirmación
   - Debería mostrar: "✅ License acquired! Token ID: [NÚMERO]"

6. **Step 2: Crear Remix**
   - Subir una imagen para el remix
   - Completar título y descripción
   - Click en "Create Remix"
   - Aprobar transacción en wallet
   - Esperar confirmación
   - ✅ Debería redirigir a home con el remix creado

---

### ⚠️ ESCENARIO B: Rock10 tiene una licencia diferente (NO ID 1)

**Qué significa:**
- Rock10 tiene licencia pero no es la ID 1
- Necesitamos actualizar el código para usar el ID correcto

**Acción requerida:**
1. Anotar qué License ID tiene Rock10 (ejemplo: ID 2, ID 3, etc.)
2. Actualizar el código en:
   - `app/[lang]/remix/[id]/page.tsx` línea ~122 y ~270
   - Cambiar `licenseTermsId: 1n` por el ID correcto

**Código a modificar:**
```typescript
// Línea ~122 - Mintear license token
const response = await storyClient.license.mintLicenseTokens({
  licenseTermsId: 1n, // <-- CAMBIAR ESTE NÚMERO
  licensorIpId: id as Address,
  amount: 1,
  receiver: address,
});

// Línea ~270 - Fallback registration
response = await storyClient.ipAsset.mintAndRegisterIpAndMakeDerivative({
  spgNftContract,
  derivData: {
    parentIpIds: [id as Address],
    licenseTermsIds: [1n], // <-- CAMBIAR ESTE NÚMERO
  },
  // ...
});
```

---

### ❌ ESCENARIO C: Rock10 NO tiene licencias

**Qué significa:**
- Story Portal puede estar mostrando información incorrecta
- Rock10 no puede ser remixado con el flujo actual

**Acción requerida:**
1. Buscar otro asset que SÍ tenga licencias
2. Ejecutar: `npx tsx scripts/find-remixable-assets.ts`
3. Probar con un asset confirmado como remixable

---

## 3. Errores Comunes y Soluciones

### Error: "License terms id X must be attached to the parent ipId"
**Causa:** El parent IP no tiene la licencia ID especificada
**Solución:** Usar el License ID correcto (ver Escenario B)

### Error: "The license token has already been used or is invalid"
**Causa:** El token fue usado o no es válido para este parent IP
**Solución:**
1. Mintear un nuevo license token
2. Verificar que el parent tenga la licencia correcta attached

### Error: Imagen del parent no se muestra
**Causa:** sessionStorage fue cleared antes de cargar
**Solución:** Ya está resuelto con `useRef` - si persiste, verificar console logs

---

## 4. Comandos Útiles

```bash
# Verificar Rock10 específicamente
npx tsx scripts/check-rock10.ts

# Verificar cualquier IP ID
npx tsx scripts/check-ip-licenses.ts 0xIP_ID_AQUI

# Escanear todos los assets del landing
npx tsx scripts/find-remixable-assets.ts

# Limpiar cache de Next.js
rm -rf .next && npm run dev
```

---

## 5. Checklist de Testing

- [ ] Script ejecutado: `check-rock10.ts`
- [ ] License ID confirmado: ______
- [ ] Rock10 visible en landing page
- [ ] Botón "Remix" clickeable
- [ ] Página de remix carga correctamente
- [ ] Imagen del parent se muestra
- [ ] License token minteado exitosamente
- [ ] Remix creado exitosamente
- [ ] Remix aparece en home/user pieces
- [ ] Transaction hash registrado en Supabase

---

## 6. Información de Debugging

**Contratos Importantes:**
- Licensing Module: `0x5a7D9Fa17DE09350F481A53B470D798c1c1b000d`
- SPG NFT Contract: `0xf06808081f6000F17c68D020ec8b159B0A851952` (mainnet)

**RPCs:**
- Mainnet: `https://rpc.ankr.com/story_mainnet`
- Story RPC: `https://rpc.storyrpc.io`

**Story Portal:**
- Rock10: https://portal.story.foundation/assets/0x2309C7B3F8A33aF01bc6d5fB80471F627976Ef42
- Explorer: https://explorer.story.foundation/

---

## 7. Próximos Pasos (Después de Testing Exitoso)

1. [ ] Marcar assets remixables en el UI del landing
2. [ ] Mostrar badge de "Remixable" en pieces con licencias
3. [ ] Deshabilitar botón "Remix" en assets sin licencias
4. [ ] Añadir tooltip explicando por qué no se puede remixar
5. [ ] Cachear resultados de verificación de licencias
