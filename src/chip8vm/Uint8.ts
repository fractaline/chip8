export class Uint8 {
    private value: number;

    constructor(value: number) {
        if (value < 0 || value > 255)  throw new Error('Value must be between 0 and 255');
        this.value = value;
    }

    getValue(): number {
        return this.value;
    }

    setValue(value: number): void {
        if (value < 0 || value > 255) throw new Error('Value must be between 0 and 255');
        this.value = value;
    }

    or(other: Uint8): Uint8 {
        return new Uint8(this.value | other.getValue());
    }
}
