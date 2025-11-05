export default class ExpirationDateValidator {
  validate( expirationString ) {
    if ( !/^(\d{4})-(\d{2})-(\d{2})$/.test( expirationString ) )
      return false;
    
    const parts = expirationString.split( '-' );
    const year = parseInt( parts[0], 10 );
    const month = parseInt( parts[1], 10 );
    const day = parseInt( parts[2], 10 );
    
    if ( month < 1 || month > 12 || day < 1 || day > 31 )
        return false;

    const expirationDate = new Date( year, month - 1, day );
    
    // Checks for invalid dates like 2023-02-29
    if (
      expirationDate.getFullYear() !== year || 
      expirationDate.getMonth() !== month - 1 || 
      expirationDate.getDate() !== day
    ) return false;
    
    const today = new Date();
    const currentYear = today.getFullYear();
    const currentMonth = today.getMonth() + 1;

    if ( year < currentYear || ( year === currentYear && month < currentMonth ) )
      return false;

    return true;
  }
}
