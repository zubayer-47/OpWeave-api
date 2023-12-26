import BaseController from './base.controller'

class AdminActionController extends BaseController {
  constructor() {
    super()
    this.configureRoutes()
  }

  // private _hidePost = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  //   const {} = req.params
  //   const {} = req.body
  //   const {} = req.query
  //   /**
  //    * Validation
  //    */
  //   const errors: ErrorType = {}
  //   // here gose your validation rules
  //   if (Object.keys(errors).length) {
  //     res.status(400).json(errors)
  //     return
  //   }
  //   try {
  //     // Your async code gose here...
  //   } catch (error) {
  //     next(error)
  //   }
  // }

  /**
   * configure router
   */
  configureRoutes() {
    // this.router.post('/', this._hidePost)
    // this._showRoutes()
  }
}
export default new AdminActionController()
