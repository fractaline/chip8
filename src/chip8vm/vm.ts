export class Chip8VM {
    registers = new Uint8Array(16).fill(0);
    ram = new Uint8Array(0x1000).fill(0);
    stack = new Uint16Array(16).fill(0);
    display = new Uint8Array(64 * 32).fill(0);
    keys = new Uint8Array(16).fill(0);
    delayTimer = 0;
    sountTimer = 0;
    indexRegister = 0;
    programCounter = 0x200;
    stackPointer = 0;
    buzzerEnabled = 0;
    soundTimer = 0;

    font = [
        0xF0, 0x90, 0x90, 0x90, 0xF0, // 0
        0x20, 0x60, 0x20, 0x20, 0x70, // 1
        0xF0, 0x10, 0xF0, 0x80, 0xF0, // 2
        0xF0, 0x10, 0xF0, 0x10, 0xF0, // 3
        0x90, 0x90, 0xF0, 0x10, 0x10, // 4
        0xF0, 0x80, 0xF0, 0x10, 0xF0, // 5
        0xF0, 0x80, 0xF0, 0x90, 0xF0, // 6
        0xF0, 0x10, 0x20, 0x40, 0x40, // 7
        0xF0, 0x90, 0xF0, 0x90, 0xF0, // 8
        0xF0, 0x90, 0xF0, 0x10, 0xF0, // 9
        0xF0, 0x90, 0xF0, 0x90, 0x90, // A
        0xE0, 0x90, 0xE0, 0x90, 0xE0, // B
        0xF0, 0x80, 0x80, 0x80, 0xF0, // C
        0xE0, 0x90, 0x90, 0x90, 0xE0, // D
        0xF0, 0x80, 0xF0, 0x80, 0xF0, // E
        0xF0, 0x80, 0xF0, 0x80, 0x80  // F
    ];

    loadFont() {
        this.ram.set(this.font, 0);
    }

    handleKeyPress(key: number) {
        this.keys[key] = 1;
    }

    enableBuzzer() {
        this.buzzerEnabled = 1;
    }

    disableBuzzer() {
        this.buzzerEnabled = 0;
    }

    loadRom(rom: Uint8Array) {
        this.ram.set(rom, 0x200);
    }

    getRegister(index: number): number {
        if (index < 0 || index > 16) throw new Error('Invalid register index ' + index)

        return this.registers[index];
    }

    setRegister(index: number, value: number) {
        if (index < 0 || index > 16) throw new Error('Invalid register index ' + index)
        if (value < 0 || value > 255) throw new Error('Invalid register ' + index + ' value: ' + value);

        this.registers[index] = value;
    }

    pushToStack(value: number) {
        this.stack[this.stackPointer] = value;
        this.stackPointer++;
    }

    popFromStack(): number {
        this.stackPointer--;
        return this.stack[this.stackPointer];
    }

    getNextOpcode(): number {
        const opcode = this.ram[this.programCounter] << 8 | this.ram[this.programCounter + 1];
        this.programCounter += 2;
        return opcode;
    }

    executeProgram() {
        while (true) {
            const opcode = this.getNextOpcode();

            if(opcode === 0x0000){
                return;
            }

            this.executeOpcode(opcode);

            if (this.delayTimer > 0) {
                this.delayTimer--;
            }
    
            if (this.soundTimer > 0) {
                this.soundTimer--;
                if (this.soundTimer === 0) {
                    this.disableBuzzer();
                }
                else {
                    this.enableBuzzer();
                }
            }
        }
    }

    executeOpcode(opcode: number) {
        let { firstNibble, secondNibble, thirdNibble, fourthNibble, nn, nnn} = this.decodeOpcode(opcode)
        let decodedOpcode = opcode;
        switch (firstNibble) {
            case 0x0:
                decodedOpcode = opcode & 0x00FF;
                break;
            case 0x8:
                decodedOpcode = opcode & 0xF00F;
                break;
            case 0xE:
                decodedOpcode = opcode & 0xF0FF;
                break;
            case 0xF:
                decodedOpcode = opcode & 0xF0FF;
                break;
            default:
                decodedOpcode = opcode & 0xF000;
                break;
        }

        const opcodeTable: { [key: number]: () => void } = {
            0x0E0: () => this.clear(),
            0x0EE: () => this.ret(),
            0x1000: () => this.jump_nnn(nnn),
            0x2000: () => this.call_nnn(nnn),
            0x6000: () => this.load_vx_nn(secondNibble, nn),
            0x8000: () => this.load_vx_vy(secondNibble, thirdNibble),
            0xF007: () => this.load_vx_dt(secondNibble),
            0xF00A: () => this.load_vx_k(secondNibble),
            0xF015: () => this.load_dt_vx(secondNibble),
            0xF018: () => this.load_st_vx(secondNibble),
            0xF029: () => this.load_f_vx(secondNibble),
            0xF033: () => this.load_b_vx(secondNibble),
            0xF055: () => this.load_i_vx(secondNibble),
            0xF065: () => this.load_vx_i(secondNibble),
            0xA000: () => this.load_i_nnn(nnn),
            0x7000: () => this.add_vx_nn(secondNibble, nn),
            0x8005: () => this.sub_vx_vy(secondNibble, thirdNibble),
            0x8007: () => this.subn_vx_vy(secondNibble, thirdNibble),
            0xF01E: () => this.add_i_vx(secondNibble),
            0x8004: () => this.add_vx_vy(secondNibble, thirdNibble),
            0x8001: () => this.or_vx_vy(secondNibble, thirdNibble),
            0x8002: () => this.and_vx_vy(secondNibble, thirdNibble),
            0x8003: () => this.xor_vx_vy(secondNibble, thirdNibble),
            0x8006: () => this.shiftRight_vx(secondNibble),
            0x800E: () => this.shiftLeft_vx(secondNibble),
            0xB000: () => this.jump_v0_nnn(nnn),
            0xC000: () => this.random_vx_nn(secondNibble, nn),
            0xD000: () => this.draw_vx_vy_n(secondNibble, thirdNibble, fourthNibble),
            0xE09E: () => this.skip_vx(secondNibble),
            0xE0A1: () => this.sknp_vx(secondNibble),
            0x4000: () => this.sne_vx_nn(secondNibble, nn),
            0x9000: () => this.sne_vx_vy(secondNibble, thirdNibble),
            0x3000: () => this.se_vx_nn(secondNibble, nn),
            0x5000: () => this.se_vx_vy(secondNibble, thirdNibble),
        };

        const opcodeHandler = opcodeTable[decodedOpcode];
        if (opcodeHandler) {
            opcodeHandler();
        } else {
            throw new Error('Unknown opcode: ' + opcode.toString(16));
        }
    }

    decodeOpcode(opcode: number) {
        const firstNibble = (opcode & 0xF000) >> 12;
        const secondNibble = (opcode & 0x0F00) >> 8;
        const thirdNibble = (opcode & 0x00F0) >> 4;
        const fourthNibble = (opcode & 0x000F);

        const nnn = opcode & 0x0FFF;
        const nn = opcode & 0x00FF;

        return {
            firstNibble,
            secondNibble,
            thirdNibble,
            fourthNibble,
            nnn,
            nn
        }
    }

    clear(): void {
        this.display.fill(0);
    }

    jump_nnn(nnn:number): void {
        this.programCounter = nnn;
    }

    jump_v0_nnn(nnn:number): void {
        this.programCounter = nnn + this.getRegister(0);
    }

    skip_vx(secondNibble: number): void {
        const key = this.getRegister(secondNibble);
        if (this.keys[key]) {
            this.programCounter += 2;
        }
    }

    sknp_vx(secondNibble: number): void {
        const key = this.getRegister(secondNibble);
        if (!this.keys[key]) {
            this.programCounter += 2;
        }
    }

    call_nnn(nnn: number): void {
        this.pushToStack(this.programCounter);
        this.programCounter = nnn;
    }

    ret() {
        this.programCounter = this.popFromStack();
    }

    se_vx_nn(secondNibble: number, nn: number): void {
        if (this.getRegister(secondNibble) === nn) {
            this.programCounter += 2;
        }
    }

    sne_vx_nn(secondNibble:number, nn:number): void {
        if (this.getRegister(secondNibble) !== nn) {
            this.programCounter += 2;
        }
    }

    sne_vx_vy(secondNibble: number, thirdNibble:number): void {
        if (this.getRegister(secondNibble) !== this.getRegister(thirdNibble)) {
            this.programCounter += 2;
        }
    }

    se_vx_vy(secondNibble: number, thirdNibble:number): void {
        if (this.getRegister(secondNibble) === this.getRegister(thirdNibble)) {
            this.programCounter += 2;
        }
    }

    load_vx_dt(secondNibble: number): void {
        this.setRegister(secondNibble, this.delayTimer);
    }

    load_vx_vy(secondNibble: number, thirdNibble:number): void {
        this.setRegister(secondNibble, this.getRegister(thirdNibble));
    }

    load_vx_nn(secondNibble: number, nn:number): void {
        this.setRegister(secondNibble, nn);
    }

    load_vx_k(secondNibble: number): void {
        const key = this.keys.findIndex((key) => key === 1);
        if (key !== -1) {
            this.setRegister(secondNibble, key);
        } else {
            this.programCounter -= 2;
        }
    }

    load_dt_vx(secondNibble: number): void {
        this.delayTimer = this.getRegister(secondNibble);
    }

    load_st_vx(secondNibble: number): void {
        this.soundTimer = this.getRegister(secondNibble);
    }

    load_f_vx(secondNibble: number): void {
        this.indexRegister = this.getRegister(secondNibble) * 5;
    }

    load_b_vx(secondNibble: number): void {
        const value = this.getRegister(secondNibble);
        this.ram[this.indexRegister] = Math.floor(value / 100);
        this.ram[this.indexRegister + 1] = Math.floor((value % 100) / 10);
        this.ram[this.indexRegister + 2] = value % 10;
    }

    load_i_vx(secondNibble: number): void {
        const registerValue = this.getRegister(secondNibble);
        if (this.indexRegister + secondNibble > 0xFFF) {
            // Handle overflow error
            throw new Error("Index register overflow");
        }
        for (let i = 0; i <= secondNibble; i++) {
            this.ram[this.indexRegister + i] = this.registers[i];
        }
    }

    load_i_nnn(nnn: number): void {
        this.indexRegister = nnn;
    }

    load_vx_i(secondNibble: number): void {
        const registerValue = this.getRegister(secondNibble);
        for (let i = 0; i <= secondNibble; i++) {
            this.registers[i] = this.ram[this.indexRegister + i];
        }
    }

    and_vx_vy(secondNibble: number, thirdNibble:number): void {
        this.setRegister(secondNibble, this.getRegister(secondNibble) & this.getRegister(thirdNibble));
    }

    or_vx_vy(secondNibble: number, thirdNibble:number): void {
        this.setRegister(secondNibble, this.getRegister(secondNibble) | this.getRegister(thirdNibble));
    }   

    xor_vx_vy(secondNibble: number, thirdNibble:number): void {
        this.setRegister(secondNibble, this.getRegister(secondNibble) ^ this.getRegister(thirdNibble));
    }

    add_vx_nn(secondNibble: number, nn:number): void {
        this.setRegister(secondNibble, this.getRegister(secondNibble) + nn);
    }

    add_vx_vy(secondNibble: number, thirdNibble:number): void {
        this.setRegister(secondNibble, this.getRegister(secondNibble) + this.getRegister(thirdNibble));
    }

    add_i_vx(secondNibble: number): void {
        const registerValue = this.getRegister(secondNibble);
        if (registerValue + this.indexRegister > 0xFFF) {
            throw new Error("Index register overflow");
        }
        this.indexRegister += registerValue;
    }

    sub_vx_vy(secondNibble: number, thirdNibble:number): void {
        if(this.getRegister(secondNibble) > this.getRegister(thirdNibble)){
            this.setRegister(0xF, 1);
        }
        else {
            this.setRegister(0xF, 0);
        }

        this.setRegister(secondNibble, this.getRegister(secondNibble) - this.getRegister(thirdNibble));
    }

    subn_vx_vy(secondNibble: number, thirdNibble:number): void {
        if(this.getRegister(thirdNibble) > this.getRegister(secondNibble)){
            this.setRegister(0xF, 1);
        }
        else {
            this.setRegister(0xF, 0);
        }

        this.setRegister(secondNibble, this.getRegister(thirdNibble) - this.getRegister(secondNibble));
    }

    shiftLeft_vx(secondNibble: number): void {
        this.setRegister(0xF, this.getRegister(secondNibble) & 0x80);
        this.setRegister(secondNibble, this.getRegister(secondNibble) << 1);
    }

    shiftRight_vx(secondNibble: number): void {
        this.setRegister(0xF, this.getRegister(secondNibble) & 0x1);
        this.setRegister(secondNibble, this.getRegister(secondNibble) >> 1);
    }

    random_vx_nn(secondNibble: number, nn:number): void {
        this.setRegister(secondNibble, Math.floor(Math.random() * 256) & nn);
    }

    draw_vx_vy_n(secondNibble: number, thirdNibble:number, fourthNibble:number): void {
        const x = this.getRegister(secondNibble);
        const y = this.getRegister(thirdNibble);
        const sprite = this.ram.slice(this.indexRegister, this.indexRegister + fourthNibble);
        const collision = this.drawSprite(x, y, sprite);
        this.setRegister(0xF, collision ? 1 : 0);
    }

    drawPixel(x: number, y: number, value: number): boolean {
        if (x < 0 || x > 63) throw new Error('Invalid x coordinate ' + x);
        if (y < 0 || y > 31) throw new Error('Invalid y coordinate ' + y);
        if (value < 0 || value > 1) throw new Error('Invalid pixel value ' + value);

        const index = x + (y * 64);
        const oldValue = this.display[index];
        this.display[index] = oldValue ^ value;

        return oldValue === 1 && this.display[index] === 0;
    }

    drawSprite(x: number, y: number, sprite: Uint8Array): boolean {
        let collision = false;

        for (let i = 0; i < sprite.length; i++) {
            const row = sprite[i];
            if (row > 0xFF) {
                throw new Error('Invalid sprite row value. Expected 8-bit value.');
            }
            for (let j = 0; j < 8; j++) {
                const pixel = row & (0x80 >> j);
                if (pixel) {
                    collision = this.drawPixel(x + j, y + i, 1);
                }
            }
        }

        return collision;
    }
}