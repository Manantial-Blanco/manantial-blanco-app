# Custom PIL License Examples

Este documento muestra cómo crear licencias completamente personalizadas usando Story Protocol.

## Función Principal

```typescript
registerCustomPILTerms(client: StoryClient, ipId: Address, customTerms: CustomPILTerms)
```

## Ejemplos de Uso

### Ejemplo 1: Licencia Non-Commercial con Attribution

```typescript
import { createStoryClient, registerCustomPILTerms } from '@/lib/services/story';

const customTerms = {
  // Sin uso comercial, pero permite derivados con atribución
  commercialUse: false,
  derivativesAllowed: true,
  derivativesAttribution: true,
  derivativesApproval: false,
  derivativesReciprocal: false,
  transferable: true,
  defaultMintingFee: '0', // Gratis
};

const result = await registerCustomPILTerms(storyClient, ipId, customTerms);
console.log('License registered:', result.licenseTermsId);
```

### Ejemplo 2: Licencia Commercial con Approval Requerido

```typescript
const customTerms = {
  // Uso comercial permitido pero requiere aprobación
  commercialUse: true,
  commercialAttribution: true,
  commercialRevShare: 15, // 15% de revenue share
  defaultMintingFee: '5', // 5 IP tokens

  // Derivados permitidos pero requieren aprobación
  derivativesAllowed: true,
  derivativesAttribution: true,
  derivativesApproval: true, // ⚠️ Requiere aprobación manual
  derivativesReciprocal: false,

  transferable: true,
};

const result = await registerCustomPILTerms(storyClient, ipId, customTerms);
```

### Ejemplo 3: Licencia con Expiration y Revenue Ceiling

```typescript
const customTerms = {
  // Uso comercial con límites
  commercialUse: true,
  commercialAttribution: true,
  commercialRevShare: 10,
  commercialRevCeiling: 100000n, // Máximo $100k en revenue
  defaultMintingFee: '2',

  // Expira en 1 año (timestamp en segundos)
  expiration: BigInt(Math.floor(Date.now() / 1000) + 365 * 24 * 60 * 60),

  // Derivados con límite de revenue
  derivativesAllowed: true,
  derivativesAttribution: true,
  derivativeRevCeiling: 50000n, // Máximo $50k para derivados

  transferable: false, // No transferible
};

const result = await registerCustomPILTerms(storyClient, ipId, customTerms);
```

### Ejemplo 4: Licencia Reciprocal (Share-Alike)

```typescript
const customTerms = {
  // Similar a Creative Commons SA (Share-Alike)
  commercialUse: true,
  commercialAttribution: true,
  commercialRevShare: 5,
  defaultMintingFee: '1',

  derivativesAllowed: true,
  derivativesAttribution: true,
  derivativesReciprocal: true, // ⚠️ Derivados deben usar misma licencia

  transferable: true,
};

const result = await registerCustomPILTerms(storyClient, ipId, customTerms);
```

### Ejemplo 5: Licencia Educational Use Only

```typescript
const customTerms = {
  // No comercial, solo para educación
  commercialUse: false,

  // Derivados permitidos para uso educacional
  derivativesAllowed: true,
  derivativesAttribution: true,
  derivativesApproval: false,

  // Gratis para uso educacional
  defaultMintingFee: '0',
  transferable: true,

  // URI apuntando a términos off-chain detallados
  uri: 'ipfs://QmExample123.../educational-license-terms.json',
};

const result = await registerCustomPILTerms(storyClient, ipId, customTerms);
```

### Ejemplo 6: Licencia Premium con Commercializer Checker

```typescript
const customTerms = {
  // Solo ciertos addresses pueden usar comercialmente
  commercialUse: true,
  commercialAttribution: true,
  commercialRevShare: 20,
  commercializerChecker: '0xYourCheckerContractAddress' as Address,
  commercializerCheckerData: '0x...' as `0x${string}`, // Data para el checker

  defaultMintingFee: '10', // Premium fee

  derivativesAllowed: false, // No derivados
  transferable: false, // No transferible
};

const result = await registerCustomPILTerms(storyClient, ipId, customTerms);
```

## Parámetros Disponibles

### Transfer & Ownership
- **`transferable`**: `boolean` - ¿Se puede transferir la licencia?

### Financial Parameters
- **`defaultMintingFee`**: `string` - Fee en IP tokens (ej: "1" para 1 IP token)
- **`currency`**: `Address` - Token ERC20 para pagos (default: IP token)
- **`royaltyPolicy`**: `Address` - Contrato de política de royalties (default: LAP)

### Expiration
- **`expiration`**: `bigint` - Timestamp de expiración (0 = sin expiración)

### Commercial Use
- **`commercialUse`**: `boolean` - ¿Permitir uso comercial?
- **`commercialAttribution`**: `boolean` - ¿Requiere atribución para uso comercial?
- **`commercialRevShare`**: `number` - Porcentaje de revenue share (0-100)
- **`commercialRevCeiling`**: `bigint` - Revenue máximo del uso comercial
- **`commercializerChecker`**: `Address` - Contrato para restringir quién puede comercializar
- **`commercializerCheckerData`**: `0x${string}` - Data para el checker

### Derivatives
- **`derivativesAllowed`**: `boolean` - ¿Permitir obras derivadas?
- **`derivativesAttribution`**: `boolean` - ¿Requiere atribución para derivados?
- **`derivativesApproval`**: `boolean` - ¿Requiere aprobación antes de crear derivados?
- **`derivativesReciprocal`**: `boolean` - ¿Los derivados deben usar los mismos términos? (Share-Alike)
- **`derivativeRevCeiling`**: `bigint` - Revenue máximo de obras derivadas

### Off-chain Terms
- **`uri`**: `string` - URI apuntando a términos de licencia off-chain detallados

## Notas Importantes

1. **Reutilización de Licencias**: Si ya existe una licencia con exactamente los mismos parámetros, Story Protocol retornará el `licenseTermsId` existente sin crear una nueva.

2. **Revenue Share**: Se especifica como número entero 0-100 (representa porcentaje).

3. **Fees y Ceilings**: Usa `bigint` para valores grandes y `string` para fees que serán convertidos con `parseEther`.

4. **Default Values**: Si no especificas un parámetro, se usarán valores seguros por defecto (generalmente `false` o `0`).

5. **Gas Costs**: Crear licencias custom consume más gas que usar las predefinidas (commercial-use, commercial-remix).

## Uso en tu App

Para integrar esto en tu flujo de registro:

```typescript
// En RegisterPieceClient.tsx
import { registerCustomPILTerms, CustomPILTerms } from '@/lib/services/story';

// Después de registrar el IP Asset
const customTerms: CustomPILTerms = {
  // Tu configuración personalizada
  commercialUse: true,
  derivativesAllowed: true,
  commercialRevShare: 10,
  defaultMintingFee: '2',
  // ...más parámetros
};

const licenseResult = await registerCustomPILTerms(storyClient, result.ipId, customTerms);
console.log('Custom license attached:', licenseResult.licenseTermsId);
```
