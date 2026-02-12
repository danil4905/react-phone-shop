import { Router } from "express";
import phones from "./phones";
import brands from "./brands";
import categories from "./categories";
import filters from "./filters";
import auth from "./auth";
import orders from "./orders";
import users from "./users";

const router = Router();

router.use("/phones", phones);
router.use("/brands", brands);
router.use("/categories", categories);
router.use("/filters", filters);
router.use("/auth", auth);
router.use("/orders", orders);
router.use("/users", users);

export default router;
