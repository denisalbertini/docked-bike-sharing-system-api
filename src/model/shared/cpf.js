export default class Cpf {
  static validate( cpf ) {
    if ( cpf.length !== 11 || /^(\d)\1{10}$/.test( cpf ) ) return false;

    let sum;
    let remainder;

    // First verifier digit (J)
    sum = 0;
    for ( let i = 0; i < 9; i++ )
      sum += parseInt( cpf.charAt( i ) ) * ( 10 - i );
    remainder = sum % 11;
    const j = remainder < 2 ? 0 : 11 - remainder;

    if ( j !== parseInt( cpf.charAt( 9 ) ) ) return false;

    // Second verifier digit (K)
    sum = 0;
    for ( let i = 0; i < 10; i++ )
      sum += parseInt( cpf.charAt( i ) ) * ( 11 - i );
    remainder = sum % 11;
    const k = remainder < 2 ? 0 : 11 - remainder;

    return k === parseInt( cpf.charAt( 10 ) );
  }
}
