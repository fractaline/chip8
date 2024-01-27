import { Chip8VM } from '../../../chip8vm/vm'

describe('Chip8VM', () => {
    it('should load a ROM into RAM correctly', () => {
        const vm = new Chip8VM();
        const rom = new Uint8Array([0x01, 0x02, 0x03, 0x04]);
        vm.loadRom(rom);
        expect(vm.ram[0x200]).toBe(0x01);
        expect(vm.ram[0x201]).toBe(0x02);
        expect(vm.ram[0x202]).toBe(0x03);
        expect(vm.ram[0x203]).toBe(0x04);
    });

    it('shoud load the fontset into RAM correctly', () => {
        const vm = new Chip8VM();
        vm.loadFont();
        expect(vm.ram[0]).toBe(vm.font[0]);
        expect(vm.ram[5]).toBe(vm.font[5]);
    });

    it('Should get the next Opcode correctly', () => {
        const vm = new Chip8VM();
        vm.ram[0x200] = 0x60;
        vm.ram[0x201] = 0x02;
        const opcode = vm.getNextOpcode();
        expect(opcode).toBe(0x6002);
    });

    it('Should decode an opcode into substituant parts', () => {
        const vm = new Chip8VM();
        const { firstNibble, secondNibble, thirdNibble, fourthNibble, nn, nnn } = vm.decodeOpcode(0x00E0);
        expect(firstNibble).toBe(0x0);
        expect(secondNibble).toBe(0x0);
        expect(thirdNibble).toBe(0xE);
        expect(fourthNibble).toBe(0x0);
        expect(nn).toBe(0xE0);
        expect(nnn).toBe(0x0E0);
    });

    it('should execute the jump command correctly', () => {
        const vm = new Chip8VM();
        vm.executeOpcode(0x1FFF);
        expect(vm.programCounter).toBe(0xFFF);
    });

    it('should execute the jmp_v0 command correctly', () => {
        const vm = new Chip8VM();
        vm.registers[0] = 0x0001;
        vm.executeOpcode(0xBFFF);
        expect(vm.programCounter).toBe(0xFFF + vm.registers[0]);
    });

    it('should execute the call_nnn command correctly', () => {
        const vm = new Chip8VM();
        vm.executeOpcode(0x2FFF);
        expect(vm.stack[0]).toBe(0x200);
        expect(vm.programCounter).toBe(0xFFF);
    });

    it('should execute the skip_vx command correctly', () => {
        let vm = new Chip8VM();
        vm.registers[0] = 0x02;
        vm.keys[vm.registers[0]] = 1;
        vm.executeOpcode(0xE09E)
        expect(vm.programCounter).toBe(0x200 + 2);

        vm = new Chip8VM();
        vm.registers[0] = 0x02;
        vm.keys[vm.registers[0]] = 0;
        vm.executeOpcode(0xE09E)
        expect(vm.programCounter).toBe(0x200);
    });

    it('should execute the sknp_vx command correctly', () => {
        let vm = new Chip8VM();
        vm.registers[0] = 0x02;
        vm.keys[vm.registers[0]] = 0;
        vm.executeOpcode(0xE0A1)
        expect(vm.programCounter).toBe(0x200 + 2);

        vm = new Chip8VM();
        vm.registers[0] = 0x02;
        vm.keys[vm.registers[0]] = 1;
        vm.executeOpcode(0xE0A1)
        expect(vm.programCounter).toBe(0x200);
    });

    it('should execute the ret command correctly', () => {
        const vm = new Chip8VM();
        vm.executeOpcode(0x2FFF);
        vm.executeOpcode(0x00EE);
        expect(vm.programCounter).toBe(0x200);
    });

    it('should execute the se_vx_nn command correctly', () => {
        const vm = new Chip8VM();
        vm.registers[0] = 0x01;
        vm.executeOpcode(0x3001);
        expect(vm.programCounter).toBe(0x200 + 2);
    });

    it('should execute the sne_vx_nn command correctly', () => {
        const vm = new Chip8VM();
        vm.registers[0] = 0x02;
        vm.executeOpcode(0x4001);
        expect(vm.programCounter).toBe(0x200 + 2);
    });

    it('should execute the se_vx_vy command correctly', () => {
        const vm = new Chip8VM();
        vm.registers[0] = 0x01;
        vm.registers[1] = 0x01;
        vm.executeOpcode(0x5010);
        expect(vm.programCounter).toBe(0x200 + 2);
    });

    it('should execute the sne_vx_vy command correctly', () => {
        const vm = new Chip8VM();
        vm.registers[0] = 0x01;
        vm.registers[1] = 0x02;
        vm.executeOpcode(0x9010);
        expect(vm.programCounter).toBe(0x200 + 2);
    });

    it('should execute the load_vx_dt command correctly', () => {
        const vm = new Chip8VM();
        vm.delayTimer = 0x01;
        vm.executeOpcode(0xF007);
        expect(vm.registers[0]).toBe(0x01);
    });

    it('should execute the load_vx_vy command correctly', () => {
        const vm = new Chip8VM();
        vm.registers[1] = 0x01;
        vm.executeOpcode(0x8010);
        expect(vm.registers[0]).toBe(0x01);
    });

    it('should execute the load_dt_vx command correctly', () => {
        const vm = new Chip8VM();
        vm.registers[0] = 0x01;
        vm.executeOpcode(0xF015);
        expect(vm.delayTimer).toBe(0x01);
    });

    it('should execute the load_st_vx command correctly', () => {
        const vm = new Chip8VM();
        vm.registers[0] = 0x01;
        vm.executeOpcode(0xF018);
        expect(vm.soundTimer).toBe(0x01);
    });

    it('should execute the load_f_vx command correctly', () => {
        const vm = new Chip8VM();
        vm.registers[0] = 0x01;
        vm.executeOpcode(0xF029);
        expect(vm.indexRegister).toBe(0x01 * 5);
    });

    it('should execute the load_b_vx command correctly', () => {
        const vm = new Chip8VM();
        vm.registers[0] = 123;
        vm.executeOpcode(0xF033);
        expect(vm.ram[vm.indexRegister]).toBe(1);
        expect(vm.ram[vm.indexRegister + 1]).toBe(2);
        expect(vm.ram[vm.indexRegister + 2]).toBe(3);
    });

    it('should execute the load_i_vx command correctly', () => {
        const vm = new Chip8VM();
        vm.registers[0] = 0x01;
        vm.registers[1] = 0x02;
        vm.registers[2] = 0x03;
        vm.executeOpcode(0xF355);
        expect(vm.ram[vm.indexRegister]).toBe(0x01);
        expect(vm.ram[vm.indexRegister + 1]).toBe(0x02);
        expect(vm.ram[vm.indexRegister + 2]).toBe(0x03);
    });

    it('should execute the load_i_nnn command correctly', () => {
        const vm = new Chip8VM();
        vm.executeOpcode(0xAFFF);
        expect(vm.indexRegister).toBe(0xFFF);
    });

    it('should execute the load_vx_i command correctly', () => {
        const vm = new Chip8VM();
        vm.ram[vm.indexRegister] = 0x01;
        vm.ram[vm.indexRegister + 1] = 0x02;
        vm.ram[vm.indexRegister + 2] = 0x03;
        vm.executeOpcode(0xF365);
        expect(vm.registers[0]).toBe(0x01);
        expect(vm.registers[1]).toBe(0x02);
        expect(vm.registers[2]).toBe(0x03);
    });

    it('should execute the and_vx_vy command correctly', () => {
        const vm = new Chip8VM();
        vm.registers[0] = 0x0F;
        vm.registers[1] = 0xF0;
        vm.executeOpcode(0x8012);
        expect(vm.registers[0]).toBe(0x00);
    });

    it('should execute the or_vx_vy command correctly', () => {
        const vm = new Chip8VM();
        vm.registers[0] = 0x0F;
        vm.registers[1] = 0xF0;
        vm.executeOpcode(0x8011);
        expect(vm.registers[0]).toBe(0xFF);
    });

    it('should execute the xor_vx_vy command correctly', () => {
        const vm = new Chip8VM();
        vm.registers[0] = 0x0F;
        vm.registers[1] = 0xF0;
        vm.executeOpcode(0x8013);
        expect(vm.registers[0]).toBe(0xFF);
    });

    it('should execute the add_vx_nn command correctly', () => {
        const vm = new Chip8VM();
        vm.registers[0] = 0x01;
        vm.executeOpcode(0x7001);
        expect(vm.registers[0]).toBe(0x02);
    });

    it('should execute the add_vx_vy command correctly', () => {
        const vm = new Chip8VM();
        vm.registers[0] = 0x01;
        vm.registers[1] = 0x02;
        vm.executeOpcode(0x8014);
        expect(vm.registers[0]).toBe(0x03);
        expect(vm.registers[0xF]).toBe(0);
    });

    it('should execute the add_i_vx command correctly', () => {
        const vm = new Chip8VM();
        vm.registers[0] = 0x01;
        vm.executeOpcode(0xF01E);
        expect(vm.indexRegister).toBe(0x01);
    });

    it('should execute the sub_vx_vy command correctly', () => {
        const vm = new Chip8VM();
        vm.registers[0] = 0x02;
        vm.registers[1] = 0x01;
        vm.executeOpcode(0x8015);
        expect(vm.registers[0]).toBe(0x01);
        expect(vm.registers[0xF]).toBe(1);
    });

    it('should execute the subn_vx_vy command correctly', () => {
        const vm = new Chip8VM();
        vm.registers[0] = 0x01;
        vm.registers[1] = 0x02;
        vm.executeOpcode(0x8017);
        expect(vm.registers[0]).toBe(0x01);
        expect(vm.registers[0xF]).toBe(1);
    });

    it('should execute the shiftLeft_vx command correctly', () => {
        const vm = new Chip8VM();
        vm.registers[0] = 0x42;
        vm.executeOpcode(0x801E);
        expect(vm.registers[0]).toBe(0x84);
        expect(vm.registers[0xF]).toBe(0);
    });

    it('should execute the shiftRight_vx command correctly', () => {
        const vm = new Chip8VM();
        vm.registers[0] = 0x02;
        vm.executeOpcode(0x8006);
        expect(vm.registers[0]).toBe(0x01);
        expect(vm.registers[0xF]).toBe(0);
    });

    it('should execute the random_vx_nn command correctly', () => {
        const vm = new Chip8VM();
        vm.executeOpcode(0xC0FF);
        expect(vm.registers[0]).toBeGreaterThanOrEqual(0);
        expect(vm.registers[0]).toBeLessThanOrEqual(0xFF);
    });

    it('should execute the draw_vx_vy_n command correctly for two rows on a blank background', () => {
        const vm = new Chip8VM();
        vm.registers[0] = 0x00;
        vm.registers[1] = 0x00;
        vm.ram[vm.indexRegister] = 0b01010101;
        vm.ram[vm.indexRegister + 1] = 0b01010101;
        vm.executeOpcode(0xD012);
        for (let y = 0; y < 2; y++) {
            for (let i = 1; i <= 8; i += 2) {
                expect(vm.display[(y * 64) + i]).toBe(1);
                expect(vm.display[(y * 64) + (i - 1)]).toBe(0);
            }
        }
        expect(vm.getRegister(0xF)).toBe(0);
    });

    it('should exedcute the draw_vx_vy_n command correctly for one row and set the collision flag', () => {
        const vm = new Chip8VM();
        vm.registers[0] = 0x00;
        vm.registers[1] = 0x00;
        vm.ram[vm.indexRegister] = 0b01010101;
        vm.display[1] = 1;
        vm.display[3] = 1;
        vm.display[5] = 1;
        vm.display[7] = 1;
        vm.executeOpcode(0xD012);
        for (let i = 1; i <= 8; i += 2) {
            expect(vm.display[i]).toBe(0);
        }
        expect(vm.getRegister(0xF)).toBe(1);
    });

    it('should execute the load_vx_nn command correctly', () => {
        const vm = new Chip8VM();
        vm.executeOpcode(0x6001);
        expect(vm.registers[0]).toBe(0x01);
    });

    it('Should execute a CLS opcode', () => {
        const vm = new Chip8VM();
        vm.executeOpcode(0x00E0);
        expect(vm.display).toEqual(new Uint8Array(64 * 32));
    });

    it('should execute a program correctly', () => {
        const vm = new Chip8VM();
        const rom = new Uint8Array([0x60, 0x02]);
        vm.loadRom(rom);
        console.log(vm.ram.slice(0x200, 0x204));
        vm.delayTimer = 0x01;
        vm.soundTimer = 0x01;
        vm.executeProgram();
        expect(vm.registers[0]).toBe(0x02);
        expect(vm.delayTimer).toBe(0);
        expect(vm.soundTimer).toBe(0);
    });
});