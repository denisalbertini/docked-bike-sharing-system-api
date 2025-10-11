import BaseController from '../base-controller.js';

export default class RentalController extends BaseController {
  createRecord( req, res ) {
    return this._handleOperation(
      () => this._modelFacade.createRental( req.body ), 
      res, 
      201
    );
  }

  registerReturn( req, res ) {
    return this._handleOperation(
      () => this._modelFacade.registerReturn( req.body ), 
      res, 
      200
    );
  }
}
