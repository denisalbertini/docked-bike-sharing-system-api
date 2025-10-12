import BaseFacade from "../base-facade.js";

export default class ChargeFacade extends BaseFacade {
  #ccAdminService;

  constructor( chargeService, ccAdminService ) {
    super( chargeService );
    this.#ccAdminService = ccAdminService;
  }

  async chargeLateFees() {
    // Finds the late charges
    const findChargesResult = await this._modelService.findIncomplete();
    if ( findChargesResult.isFailure ) return findChargesResult;

    const charges = findChargesResult.value;

    // Tries to finish the charges
    for ( const charge of charges ) {
      const paymentResult = this.#ccAdminService.processPayment( charge );
      if ( paymentResult.isFailure ) continue;

      const chargeCompleteResult = await this._modelService.complete( charge );
      if ( chargeCompleteResult.isFailure ) console.error(
        chargeCompleteResult.errorType, ...chargeCompleteResult.errors
      );
    }
  }
}
