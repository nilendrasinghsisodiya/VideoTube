import {Router} from express
import {verifyJwt} from "../middlewares/auth.middleware.js"

const router = Router();

router.route("/healthcheck").get((req , res)=>{
    res.status(200).send("Hello world");
})

router.on("error",(error)=>{
 throw new ApiError(500,error.message);
})

export default router;
