import BaseController from '../base-controller.js';

export default class RentalController extends BaseController {
  #rentalFacade;

  constructor( modelService, rentalFacade ) {
    super( modelService );
    this.#rentalFacade = rentalFacade;
  }

  createRecord( req, res ) {
    return this._handleOperation(
      () => this.#rentalFacade.createRental( req.body ), 
      res, 
      201
    );
  }

  registerReturn( req, res ) {
    return this._handleOperation(
      () => this.#rentalFacade.registerReturn( req.body ), 
      res, 
      200
    );
  }
}
