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

interface Listener {
    listen(): void
}

export class TripMemberLocation implements Listener {
    private static TOPIC = "TRIP_MEMBER_LOCATION"
    server: SocketIOServer

    constructor(server: SocketIOServer) {
        this.server = server;
    }

    private forward(location: Location, tripMember: TripMember) {
        let room = tripMember.trip.tripId
        this.server.to(room).emit(
            TripMemberLocation.TOPIC,
            {
                user_id: tripMember.userId,
                longitude: location.longitude,
                latitude: location.latitude,
            }
        );
    }

    public handle(payload: { userId: string, tripId: string, longitude: number, latitude: number }) {
        console.info({"topic": TripMemberLocation.TOPIC, ...payload});
        
        const { userId, tripId, longitude, latitude } = payload;
        let location = new Location(longitude, latitude);
        let tripMember = new TripMember(new Trip(tripId), userId);
        this.forward(location, tripMember);
    }

    public listen() {
        this.server.on(TripMemberLocation.TOPIC, this.handle)
    }
}
