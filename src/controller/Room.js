"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class Room {
    constructor(fullname, shortname, num, name, address, lat, lon, seats, type, furniture, href) {
        this.fullname = fullname;
        this.shortname = shortname;
        this.number = num;
        this.name = name;
        this.address = address;
        this.lat = lat;
        this.lon = lon;
        this.seats = seats;
        this.type = type;
        this.furniture = furniture;
        this.href = href;
    }
    getRPart(part) {
        if (part === "fullname") {
            return this.fullname;
        }
        else if (part === "shortname") {
            return this.shortname;
        }
        else if (part === "number") {
            return this.number;
        }
        else if (part === "name") {
            return this.name;
        }
        else if (part === "address") {
            return this.address;
        }
        else if (part === "lat") {
            return this.lat;
        }
        else if (part === "lon") {
            return this.lon;
        }
        else if (part === "seats") {
            return this.seats;
        }
        else if (part === "type") {
            return this.type;
        }
        else if (part === "furniture") {
            return this.furniture;
        }
        else if (part === "href") {
            return this.href;
        }
    }
}
exports.Room = Room;
//# sourceMappingURL=Room.js.map