import BaseController from '../base-controller.js';

export default class DockRemovalController extends BaseController {
  constructor( dockRemovalFacade ) { super( dockRemovalFacade ); }
  
  createRecord( req, res ) {
    return this._handleOperation(
      () => this._modelFacade.createDockRemoval( req.body ), 
      res, 
      201
    );
  }
}
