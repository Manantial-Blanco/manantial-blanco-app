# Mainnet vs Testnet - Gestión de Datos

## 🎯 Problema

Cuando cambias entre mainnet y testnet:
- Los **IP Assets** se registran en blockchains diferentes
- La **base de datos Supabase** es la misma
- En `/home` ves TODOS los registros, mezclando mainnet y testnet

## 💡 Soluciones

### Opción 1: Base de Datos Separadas (Más Simple) ✅ RECOMENDADO

Usa bases de datos diferentes para mainnet y testnet:

**Pros:**
- ✅ Separación total de datos
- ✅ No mezclas registros de prueba con producción
- ✅ Más simple de mantener
- ✅ Puedes borrar testnet cuando quieras

**Contras:**
- ❌ Necesitas dos proyectos en Supabase

**Implementación:**

```bash
# .env.local para TESTNET
NEXT_PUBLIC_SUPABASE_URL=https://your-testnet-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_testnet_key
NEXT_PUBLIC_RPC_PROVIDER_URL=https://aeneid.storyrpc.io

# .env.production para MAINNET
NEXT_PUBLIC_SUPABASE_URL=https://your-mainnet-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_mainnet_key
NEXT_PUBLIC_RPC_PROVIDER_URL=https://rpc.odyssey.storyrpc.io
```

### Opción 2: Campo `network` en Base de Datos

Usa la misma base de datos pero filtra por red:

**Pros:**
- ✅ Una sola base de datos
- ✅ Puedes ver ambas redes si quieres
- ✅ Fácil comparación entre redes

**Contras:**
- ❌ Datos de prueba mezclados con producción
- ❌ Más complejo de mantener

**Implementación:**

1. **Ejecuta la migración:**
```sql
-- En Supabase SQL Editor:
docs/sql/migration_add_network_field.sql
```

2. **El código ya está preparado:**
- Ya agregué `getCurrentNetwork()` en `lib/utils/network.ts`
- El TODO en RegisterPieceClient muestra cómo guardar con network

3. **Filtra en las queries:**
```typescript
// En home page
const { data } = await supabase
  .from('pieces')
  .select('*')
  .eq('network', getCurrentNetwork()) // Solo testnet o mainnet
  .order('created_at', { ascending: false });
```

### Opción 3: No Usar Supabase en Testnet

Solo registra en blockchain, no en base de datos:

**Pros:**
- ✅ Más simple
- ✅ No contaminas la DB

**Contras:**
- ❌ No puedes ver los registros en la UI
- ❌ Solo verificas en el explorer

**Implementación:**
```typescript
// En handleSubmit
if (getCurrentNetwork() === 'aeneid') {
  // Solo registra en blockchain, skip Supabase
  console.log('Testnet: Skipping database save');
} else {
  // Guarda en Supabase
  await supabase.from('pieces').insert({...});
}
```

## 🎨 Recomendación por Caso de Uso

### Para Desarrollo/Testing:
**Usa Opción 1** (Bases de datos separadas)
- Mantén testnet limpia
- Borra y recrea cuando quieras
- No mezcles datos

### Para Mostrar Ambas Redes en UI:
**Usa Opción 2** (Campo network)
- Agrega un switch en la UI
- Permite comparar redes
- Badge que muestra la red

### Para Testing Rápido:
**Usa Opción 3** (Sin DB en testnet)
- Solo verifica en blockchain explorer
- Más rápido de implementar

## 🚀 Implementación Rápida (Opción 1)

**Paso 1: Crea proyecto de testnet en Supabase**
1. Ve a https://supabase.com
2. Crea nuevo proyecto "manantial-blanco-testnet"
3. Ejecuta `docs/sql/schema.sql`
4. Copia URL y API Key

**Paso 2: Crea `.env.testnet`**
```bash
cp .env.local .env.testnet

# Edita .env.testnet:
NEXT_PUBLIC_SUPABASE_URL=https://testnet-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=testnet_key
NEXT_PUBLIC_RPC_PROVIDER_URL=https://aeneid.storyrpc.io
```

**Paso 3: Scripts en package.json**
```json
{
  "scripts": {
    "dev": "next dev",
    "dev:testnet": "cp .env.testnet .env.local && next dev",
    "dev:mainnet": "cp .env.production .env.local && next dev"
  }
}
```

**Uso:**
```bash
npm run dev:testnet  # Para testear
npm run dev:mainnet  # Para producción
```

## 📊 Comparación Visual

```
┌─────────────────────────────────────────────────┐
│              OPCIÓN 1 (Recomendada)             │
├─────────────────────────────────────────────────┤
│                                                 │
│  Testnet Blockchain  →  Supabase Testnet DB    │
│  Mainnet Blockchain  →  Supabase Mainnet DB    │
│                                                 │
│  ✓ Separación total                            │
│  ✓ Sin confusión                               │
└─────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────┐
│                   OPCIÓN 2                      │
├─────────────────────────────────────────────────┤
│                                                 │
│  Testnet Blockchain  ┐                         │
│  Mainnet Blockchain  ├→  Supabase DB Única     │
│                      │    (campo: network)      │
│  ✓ Una sola DB                                 │
│  ⚠  Datos mezclados                            │
└─────────────────────────────────────────────────┘
```

## ⚡ Solución Inmediata

**Para ver solo registros de testnet AHORA:**

Opción temporal sin cambiar código:

1. Borra los registros de mainnet en Supabase:
```sql
DELETE FROM pieces WHERE ip_id LIKE '0x%'; -- Borra todo
-- O marca los de mainnet:
UPDATE pieces SET network = 'mainnet' WHERE created_at < NOW();
```

2. O filtra manualmente en tu query actual

¿Cuál opción prefieres implementar?
