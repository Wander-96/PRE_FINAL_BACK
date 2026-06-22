import { Router } from "express";
import searchController from "../controllers/search.controller.js";
import authMiddleware from "../middlewares/auth.middleware.js";

const searchRouter = Router();

// Protegemos el buscador (Solo usuarios logueados pueden buscar a otros músicos)
searchRouter.use(authMiddleware);

// GET /api/search?q=lake&type=all
searchRouter.get('/', searchController.globalSearch);

export default searchRouter;
