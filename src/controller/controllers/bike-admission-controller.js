import BaseController from '../base-controller.js';

export default class BikeAdmissionController extends BaseController {
  #bikeAdmissionFacade;

  constructor( modelService, bikeAdmissionFacade ) {
    super( modelService );
    this.#bikeAdmissionFacade = bikeAdmissionFacade;
  }

  createRecord( req, res ) {
    return this._handleOperation(
      () => this.#bikeAdmissionFacade.createBikeAdmission( req.body ), 
      res, 
      201
    );
  }
}
