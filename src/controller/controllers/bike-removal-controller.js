import BaseController from '../base-controller.js';

export default class BikeRemovalController extends BaseController {
  #bikeRemovalFacade;

  constructor( modelService, bikeRemovalFacade ) {
    super( modelService );
    this.#bikeRemovalFacade = bikeRemovalFacade;
  }

  createRecord( req, res ) {
    return this._handleOperation(
      () => this.#bikeRemovalFacade.createBikeRemoval( req.body ), 
      res, 
      201
    );
  }
}
