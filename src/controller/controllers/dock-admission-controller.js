import BaseController from '../base-controller.js';

export default class DockAdmissionController extends BaseController {
  constructor( dockAdmissionFacade ) { super( dockAdmissionFacade ); }
  
  createRecord = ( req, res ) =>
    this._handleOperation(
      () => this._modelFacade.createDockAdmission( req.body ), 
      res, 
      201
    );
}
