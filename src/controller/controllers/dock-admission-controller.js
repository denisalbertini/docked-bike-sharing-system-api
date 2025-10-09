import BaseController from '../base-controller.js';

export default class DockAdmissionController extends BaseController {
  #dockAdmissionFacade;

  constructor( modelService, dockAdmissionFacade ) {
    super( modelService );
    this.#dockAdmissionFacade = dockAdmissionFacade;
  }

  createRecord( req, res ) {
    return this._handleOperation(
      () => this.#dockAdmissionFacade.createDockAdmission( req.body ), 
      res, 
      201
    );
  }
}
