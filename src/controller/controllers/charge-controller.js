import BaseController from '../base-controller.js';

export default class ChargeController extends BaseController {
  chargeLateFees( req, res ) {
    return this._handleOperation(
      () => this._modelFacade.chargeLateFees(), 
      res, 
      204
    );
  }
}
