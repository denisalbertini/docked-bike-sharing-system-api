import BaseFacade from "../base-facade.js";

export default class EmployeeFacade extends BaseFacade {
  constructor( employeeService ) { super( employeeService ); }
  
  login( data ) {
    return this._modelService.login( data );
  }
}
