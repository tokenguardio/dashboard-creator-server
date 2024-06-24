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
  f32: 'float',
  f64: 'float',
  str: 'string',
  bool: 'boolean',
};

function resolveType(typeId, types) {
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
    return resolveType(typeDefArray.type, types); // Simplified: assume the array elements have the same type
  }

  const typeDefComposite = typeDef.type.def.composite;
  if (typeDefComposite) {
    return 'string'; // Simplified: map composites to string
  }

  const typeDefSequence = typeDef.type.def.sequence;
  if (typeDefSequence) {
    return resolveType(typeDefSequence.type, types); // Simplified: assume sequence elements have the same type
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

export { resolveType };
