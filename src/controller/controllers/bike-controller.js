import BaseController from '../base-controller.js';

export default class BikeController extends BaseController {
  #bikeFacade;

  constructor( modelService, bikeFacade ) {
    super( modelService );
    this.#bikeFacade = bikeFacade;
  }

  deleteRecord( req, res ) {
    return this._handleOperation(
      () => this.#bikeFacade.deleteBike( req.query.id ), 
      res, 
      200
    );
  }
}
