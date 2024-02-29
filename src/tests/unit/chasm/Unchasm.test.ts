import Chip8Disassembler from '../../../chasm/unasm'

describe('Unchasm', () => {
    it('should assemble the dissassemble command correctly', () => {
        const assembler = new Chip8Disassembler();
        const opcode = assembler.decodeOpcode(0x1200);
        expect(opcode).toBe("JMP 200");
    });
});