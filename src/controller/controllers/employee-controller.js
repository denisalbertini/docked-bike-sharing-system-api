import BaseController from '../base-controller.js';

export default class EmployeeController extends BaseController {
  constructor( employeeFacade ) { super( employeeFacade ); }
  
  login = ( req, res ) =>
    this._handleOperation(
      () => this._modelFacade.login( req.body ), 
      res, 
      200
    );
}
