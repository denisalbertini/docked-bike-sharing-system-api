import BaseController from '../base-controller.js';

export default class EmployeeController extends BaseController {
  login( req, res ) {
    return this._handleOperation(
      () => this._modelService.login( req.body ), 
      res, 
      200
    );
  }
}
