export default class BirthDateValidator {
  validate( dateString, minAge, maxAge ) {
    if ( !/^\d{4}-\d{2}-\d{2}$/.test( dateString ) ) return false;

    const parts = dateString.split( '-' );
    const year = parseInt( parts[ 0 ], 10 );
    const month = parseInt( parts[ 1 ], 10 );
    const day = parseInt( parts[ 2 ], 10 );

    if ( month < 1 || month > 12 || day < 1 || day > 31 )
        return false;

    const birthDate = new Date( year, month - 1, day );
    
    // Checks for invalid dates like 2023-02-29
    if (
      birthDate.getFullYear() !== year || 
      birthDate.getMonth() !== month - 1 || 
      birthDate.getDate() !== day
    ) return false;

    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    if ( monthDiff < 0 || ( monthDiff === 0 && today.getDate() < birthDate.getDate() ) )
        age--;

    return age >= minAge && age <= maxAge;
  }
}
