import BaseController from '../base-controller.js';

export default class BikeRemovalController extends BaseController {
  constructor( bikeRemovalFacade ) { super( bikeRemovalFacade ); }
  
  createRecord = ( req, res ) =>
    this._handleOperation(
      () => this._modelFacade.createBikeRemoval( req.body ), 
      res, 
      201
    );
}
