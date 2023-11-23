import { EventEmitter } from 'events'

class NotificationEmitter {
  private notificationEmitter: EventEmitter

  constructor() {
    this.notificationEmitter = new EventEmitter()
  }

  public on(event: 'notification') {
    this.notificationEmitter.on(event, (...args) => {
      console.log({ event: args })
    })
  }
}

/**
 * first of all event event should listen from
 * then event should be emit by params from route
 */
