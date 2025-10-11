import BaseFacade from "../base-facade";

export default class EmployeeFacade extends BaseFacade {
  login( data ) {
    return this._modelService.login( data );
  }
}
