import BaseController from '../base-controller.js';

export default class BikeController extends BaseController {
  constructor( bikeFacade ) { super( bikeFacade ); }
  
  deleteRecord = ( req, res ) =>
    this._handleOperation(
      () => this._modelFacade.deleteBike( req.params.id ), 
      res, 
      204
    );
}
