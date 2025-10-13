import * as bike from './definitions/bike-definition.js';
import * as bikeAdmission from './definitions/bike-admission-definition.js';
import * as bikeRemoval from './definitions/bike-removal-definition.js';
import * as biker from './definitions/biker-definition.js';
import * as charge from './definitions/charge-definition.js';
import * as creditCard from './definitions/credit-card-definition.js';
import * as dock from './definitions/dock-definition.js';
import * as dockAdmission from './definitions/dock-admission-definition.js';
import * as dockRemoval from './definitions/dock-removal-definition.js';
import * as employee from './definitions/employee-definition.js';
import * as passport from './definitions/passport-definition.js';
import * as rental from './definitions/rental-definition.js';
import * as station from './definitions/station-definition.js';

const modules = [
  bike, 
  bikeAdmission, 
  bikeRemoval, 
  biker, 
  charge, 
  creditCard, 
  dock, 
  dockAdmission, 
  dockRemoval, 
  employee, 
  passport, 
  rental, 
  station
];

export default function initDefinitions( sequelize ) {
  for ( const module of modules ) module.defineModel( sequelize );
  for ( const module of modules ) module.defineAssociations();
}
