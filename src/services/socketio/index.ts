import { Server as SocketIOServer } from 'socket.io';

/**
 * Model definitions
 */

class Location {
    constructor(private _longitude: number, private _latitude: number) { }

    get longitude(): number { return this._longitude; }
    get latitude(): number { return this._latitude; }

}

class Trip {
    constructor(private _tripId: string) { }

    get tripId(): string { return this._tripId; }
}

class TripMember {
    constructor(private _trip: Trip, private _userId: string) { }

    get trip(): Trip { return this._trip; }
    get userId(): string { return this._userId; }
}

/**
 * Listener definitions
 */

abstract class Listener {
    static handle(server: SocketIOServer, payload: object): void {
        throw new Error('handle() must be implemented in the derived class');
    }
}


export class Test extends Listener {
    public static TOPIC = "TEST"

    public static handle(server: SocketIOServer, payload: { message: string }) {
        console.info({ "topic": Test.TOPIC, payload });

        const { message } = payload;
        server.emit(Test.TOPIC, { "response": message });
    }
}


export class TripMemberLocation extends Listener {
    public static TOPIC = "TRIP_MEMBER_LOCATION"

    public static handle(server: SocketIOServer, payload: { userId: string, tripId: string, longitude: number, latitude: number }) {
        console.info({ "topic": TripMemberLocation.TOPIC, ...payload });

        const { userId, tripId, longitude, latitude } = payload;

        let location = new Location(longitude, latitude);
        let tripMember = new TripMember(new Trip(tripId), userId);
        
        let room = tripMember.trip.tripId
        
        server.to(room).emit(
            TripMemberLocation.TOPIC,
            {
                user_id: tripMember.userId,
                longitude: location.longitude,
                latitude: location.latitude,
            }
        );
    }
}
