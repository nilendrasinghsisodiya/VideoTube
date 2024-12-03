import { healthcheck } from "../controllers/healthcheck.controller.js";
import {Router} from express


const router = Router();

router.route("/healthcheck").get(healthcheck);

router.on("error",(error)=>{
 throw new ApiError(500,error.message);
})

export default router;
