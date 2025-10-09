import BaseController from '../base-controller.js';

export default class DockRemovalController extends BaseController {
  #dockRemovalFacade;

  constructor( modelService, dockRemovalFacade ) {
    super( modelService );
    this.#dockRemovalFacade = dockRemovalFacade;
  }

  createRecord( req, res ) {
    return this._handleOperation(
      () => this.#dockRemovalFacade.createDockRemoval( req.body ), 
      res, 
      201
    );
  }
}
