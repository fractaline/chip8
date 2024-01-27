import { Uint8 } from "../chip8vm/Uint8";

export class RegisterIndex extends Uint8 {
    constructor(value: number) {
        if (value < 0 || value > 15) {
            throw new Error('Register Index Error: ' + value);
        }

        super(value);
    }
}