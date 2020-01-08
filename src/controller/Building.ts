import {Room} from "./Room";
import Log from "../Util";

export class Building {
    public name: string;
    public address: string;
    public shortName: string;
    public rooms: any[]; // Need to work on its type
    public lat: string;
    public lon: string;
    public path: string;
    constructor(name: string, address: string, shortName: string) {
        this.name = name;
        this.address = address;
        this.shortName = shortName;
        this.rooms = new Array();
    }

    public addRooms(rooms: Room[]) {
        this.rooms = rooms;
    }

    public getRooms() {
        return this.rooms;
    }

    public addPath(path: any) {
        this.path = path;
    }

    public getPath() {
        return this.path;
    }

    public getShortname() {
        return this.shortName;
    }

    public getName() {
        return this.name;
    }

    public getAddress() {
        return this.address;
    }

    public size(): number {
        return this.rooms.length;
    }
}
