export default class ChargeFacade {
  #chargeService;
  #ccAdminService;

  constructor( chargeService, ccAdminService ) {
    this.#chargeService = chargeService;
    this.#ccAdminService = ccAdminService;
  }

  async chargeLateFees() {
    // Finds the late charges
    const findChargesResult = await this.#chargeService.findIncomplete();
    if ( findChargesResult.isFailure ) return findChargesResult;

    const charges = findChargesResult.value;

    // Tries to finish the charges
    for ( const charge of charges ) {
      const paymentResult = this.#ccAdminService.processPayment( charge );
      if ( paymentResult.isFailure ) continue;

      const chargeCompleteResult = await this.#chargeService.complete( charge );
      if ( chargeCompleteResult.isFailure ) console.error(
        chargeCompleteResult.errorType, ...chargeCompleteResult.errors
      );
    }
  }
}
