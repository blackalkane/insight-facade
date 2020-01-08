"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class Building {
    constructor(name, address, shortName) {
        this.name = name;
        this.address = address;
        this.shortName = shortName;
        this.rooms = new Array();
    }
    addRooms(rooms) {
        this.rooms = rooms;
    }
    getRooms() {
        return this.rooms;
    }
    addPath(path) {
        this.path = path;
    }
    getPath() {
        return this.path;
    }
    getShortname() {
        return this.shortName;
    }
    getName() {
        return this.name;
    }
    getAddress() {
        return this.address;
    }
    size() {
        return this.rooms.length;
    }
}
exports.Building = Building;
//# sourceMappingURL=Building.js.map