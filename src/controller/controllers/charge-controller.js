import BaseController from '../base-controller.js';

export default class ChargeController extends BaseController {
  constructor( chargeFacade ) { super( chargeFacade ); }
  
  chargeLateFees = ( _req, res ) =>
    this._handleOperation(
      () => this._modelFacade.chargeLateFees(), 
      res, 
      204
    );
}
