import { Router } from 'express'

class RouterService {
  private router: Router

  constructor() {
    this.router = Router()
  }

  //   registerRoute(path: string, handler: (req: Request, res: Response) => void) {
  //     this.router.get(path, handler)
  //   }

  get Router() {
    return this.router
  }
}

export const routerService = new RouterService()
