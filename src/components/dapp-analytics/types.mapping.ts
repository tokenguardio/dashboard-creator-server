const substrateToPostgresTypeMap = {
  u8: 'integer',
  u16: 'integer',
  u32: 'integer',
  u64: 'integer',
  u128: 'integer',
  i8: 'integer',
  i16: 'integer',
  i32: 'integer',
  i64: 'integer',
  i128: 'integer',
  f32: 'number',
  f64: 'number',
  str: 'string',
  bool: 'boolean',
};

function resolveInkType(typeId, types) {
  const typeDef = types.find((t) => t.id === typeId);
  if (!typeDef) {
    throw new Error(`Type ID ${typeId} not found in ABI.`);
  }

  const typeDefPrimitive = typeDef.type.def.primitive;
  if (typeDefPrimitive) {
    return substrateToPostgresTypeMap[typeDefPrimitive] || 'string';
  }

  // Handle other types (e.g., composite, array, sequence, tuple, variant) if needed
  const typeDefArray = typeDef.type.def.array;
  if (typeDefArray) {
    return resolveInkType(typeDefArray.type, types); // Simplified: assume the array elements have the same type
  }

  const typeDefComposite = typeDef.type.def.composite;
  if (typeDefComposite) {
    return 'string'; // Simplified: map composites to string
  }

  const typeDefSequence = typeDef.type.def.sequence;
  if (typeDefSequence) {
    return resolveInkType(typeDefSequence.type, types); // Simplified: assume sequence elements have the same type
  }

  const typeDefTuple = typeDef.type.def.tuple;
  if (typeDefTuple) {
    return 'string'; // Simplified: map tuples to string
  }

  const typeDefVariant = typeDef.type.def.variant;
  if (typeDefVariant) {
    return 'string'; // Simplified: map variants to string
  }

  return 'string'; // Default type
}

const evmToPostgresTypeMap = {
  uint8: 'integer',
  uint16: 'integer',
  uint32: 'integer',
  uint64: 'integer',
  uint128: 'integer',
  uint256: 'integer',
  int8: 'integer',
  int16: 'integer',
  int32: 'integer',
  int64: 'integer',
  int128: 'integer',
  int256: 'integer',
  bool: 'boolean',
  address: 'string',
  bytes: 'string',
  string: 'string',
};

function resolveEvmType(type) {
  return evmToPostgresTypeMap[type] || 'string';
}

export { resolveInkType, resolveEvmType };
