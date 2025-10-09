import BaseController from '../base-controller.js';

export default class ChargeController extends BaseController {
  #chargeFacade;

  constructor( modelService, chargeFacade ) {
    super( modelService );
    this.#chargeFacade = chargeFacade;
  }

  chargeLateFees( req, res ) {
    return this._handleOperation(
      () => this.#chargeFacade.chargeLateFees(), 
      res, 
      204
    );
  }
}
