import Chip8Assembler from '../../../chasm/asm'

describe('Chasm', () => {
    it('should assemble the jump command correctly', () => {
        const assembler = new Chip8Assembler();
        const opcode = assembler.parseOpcode('JMP 200');
        expect(opcode).toBe(0x1200);
    });

    it('should assemble the jump v0 nnnn command correctly', () => {
        const assembler = new Chip8Assembler();
        const opcode = assembler.parseOpcode('JMP V0 200');
        expect(opcode).toBe(0xB200);
    });

    it('should assemble the call command correctly', () => {
        const assembler = new Chip8Assembler();
        const opcode = assembler.parseOpcode('CALL 100');
        expect(opcode).toBe(0x2100);
    });

    it('should assemble the cls command correctly', () => {
        const assembler = new Chip8Assembler();
        const opcode = assembler.parseOpcode('CLS');
        expect(opcode).toBe(0x00E0);
    });

    it('should assemble the ret command correctly', () => {
        const assembler = new Chip8Assembler();
        const opcode = assembler.parseOpcode('RET');
        expect(opcode).toBe(0x00EE);
    });

    it('should assemble the se vx vy command correctly', () => {
        const assembler = new Chip8Assembler();
        const opcode = assembler.parseOpcode('SE V1 V2');
        expect(opcode).toBe(0x5120);
    });

    it('should assemble the se vx nn command correctly', () => {
        const assembler = new Chip8Assembler();
        const opcode = assembler.parseOpcode('SE V3 2');
        expect(opcode).toBe(0x3302);
    });

    it('should assemble the se vx nn command correctly', () => {
        const assembler = new Chip8Assembler();
        const opcode = assembler.parseOpcode('SE VF 33');
        expect(opcode).toBe(0x3F33);
    });
});