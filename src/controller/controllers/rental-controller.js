import BaseController from '../base-controller.js';

export default class RentalController extends BaseController {
  constructor( rentalFacade ) { super( rentalFacade ); }
  
  createRecord = ( req, res ) =>
    this._handleOperation(
      () => this._modelFacade.createRental( req.body ), 
      res, 
      201
    );

  registerReturn = ( req, res ) =>
    this._handleOperation(
      () => this._modelFacade.registerReturn( req.body ), 
      res, 
      200
    );
}
