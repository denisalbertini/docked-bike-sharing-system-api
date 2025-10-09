export default function getTableName( className ) {
  // PascalCase to snake_case
  return className
    .replace( /([a-z0-9])([A-Z])/g, '$1_$2' )
    .toLowerCase();
}
