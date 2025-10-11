import express from "express";

import sequelize from '../../sequelize/sequelize.js';

import BikeRepository from '../../repository/repositories/bike-repository.js';
import DockRepository from '../../repository/repositories/dock-repository.js';
import BikeAdmissionRepository from '../../repository/repositories/bike-admission-repository.js';
import BikeRemovalRepository from '../../repository/repositories/bike-removal-repository.js';

import BikeService from '../../service/services/bike-service.js';
import DockService from '../../service/services/dock-service.js';
import BikeAdmissionService from '../../service/services/bike-admission-service.js';
import BikeRemovalService from '../../service/services/bike-removal-service.js';

import Transaction from '../../sequelize/transaction.js';

import BikeFacade from '../../facade/facades/bike-facade.js';
import BikeAmissionFacade from '../../facade/facades/bike-admission-facade.js';
import BikeRemovalFacade from '../../facade/facades/bike-removal-facade.js';

import BikeController from '../../controller/controllers/bike-controller.js';
import BikeAdmissionController from '../../controller/controllers/bike-admission-controller.js';
import BikeRemovalController from '../../controller/controllers/bike-removal-controller.js';

import {
  employeeAuthMiddleware, 
  operatorAuthMiddleware
} from "../auth-middleware.js";

// Repositories
const 
bikeRepository = new BikeRepository(), 
dockRepository = new DockRepository(), 
bikeAdmissionRepository = new BikeAdmissionRepository(), 
bikeRemovalRepository = new BikeRemovalRepository();

// Services
const 
bikeService = new BikeService( bikeRepository ), 
dockService = new DockService( dockRepository ), 
bikeAdmissionService = new BikeAdmissionService( bikeAdmissionRepository ), 
bikeRemovalService = new BikeRemovalService( bikeRemovalRepository );

// Transaction
const transaction = new Transaction( sequelize );

// Facades
const 
bikeFacade = new BikeFacade( bikeService, dockService ), 
bikeAdmissionFacade = new BikeAmissionFacade(
  bikeAdmissionService, bikeService, dockService, transaction
), 
bikeRemovalFacade = new BikeRemovalFacade(
  bikeRemovalService, bikeService, dockService, transaction
);

// Controllers
const 
bikeController = new BikeController( bikeFacade ), 
bikeAdmissionController = new BikeAdmissionController( bikeAdmissionFacade ), 
bikeRemovalController = new BikeRemovalController( bikeRemovalFacade );

// Router
const router = express.Router();

// Auth middlewares
router.use( [ '/', '/:id' ], employeeAuthMiddleware );
router.use( [ '/admission', '/removal' ], operatorAuthMiddleware );

// Routes
router.route( '/' )
  .get( bikeController.listRecords )
  .post( bikeController.createRecord );

router.route( '/:id' )
  .get( bikeController.getRecord )
  .put( bikeController.updateRecord )
  .delete( bikeController.deleteRecord );

router.route( '/admission' )
  .post( bikeAdmissionController.createRecord );

router.route( '/removal' )
  .post( bikeRemovalController.createRecord );

export default router;
