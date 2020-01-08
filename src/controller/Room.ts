export class Room {
    public fullname: string;
    public shortname: string;
    public number: string;
    public name: string;
    public address: string;
    public lat: number;
    public lon: number;
    public seats: number;
    public type: string;
    public furniture: string;
    public href: string;

    constructor(fullname: string, shortname: string, num: string, name: string,
                address: string, lat: number, lon: number, seats: number,
                type: string, furniture: string, href: string) {
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

    public getRPart (part: string) {
        if (part === "fullname") {
            return this.fullname;
        } else if (part === "shortname") {
            return this.shortname;
        } else if (part === "number") {
            return this.number;
        } else if (part === "name") {
            return this.name;
        } else if (part === "address") {
            return this.address;
        } else if (part === "lat") {
            return this.lat;
        } else if (part === "lon") {
            return this.lon;
        } else if (part === "seats") {
            return this.seats;
        } else if (part === "type") {
            return this.type;
        } else if (part === "furniture") {
            return this.furniture;
        } else if (part === "href") {
            return this.href;
        }
    }

}
