import * as user from './user'
import * as map from './map'
import * as socket from './socket'


export default {
    ...user, ...map, ...socket
}