export default class Chip8Disassembler {
    decodeOpcode(opcode: number): string {
        let nnn = opcode & 0x0FFF;
        let n = opcode & 0x000F;
        let x = (opcode & 0x0F00) >> 8;
        let y = (opcode & 0x00F0) >> 4;
        let kk = opcode & 0x00FF;
        let decodedOpcode = '';

        switch (opcode & 0xF000) {
            case 0x0000:
                if (opcode === 0x00E0) {
                    decodedOpcode = 'CLS';
                } else if (opcode === 0x00EE) {
                    decodedOpcode = 'RET';
                }
                break;
            case 0x1000:
                decodedOpcode = `JMP ${nnn.toString(16)}`;
                break;
            case 0x2000:
                decodedOpcode = `CALL ${nnn.toString(16)}`;
                break;
            case 0x3000:
                decodedOpcode = `SE V${x.toString(16)} ${kk.toString(16)}`;
                break;
            case 0x4000:
                decodedOpcode = `SNE V${x.toString(16)} ${kk.toString(16)}`;
                break;
            case 0x5000:
                decodedOpcode = `SE V${x.toString(16)} V${y.toString(16)}`;
                break;
            case 0x6000:
                decodedOpcode = `LD V${x.toString(16)} ${kk.toString(16)}`;
                break;
            case 0x7000:
                decodedOpcode = `ADD V${x.toString(16)} ${kk.toString(16)}`;
                break;
            case 0x8000:
                switch (n) {
                    case 0x0:
                        decodedOpcode = `LD V${x.toString(16)}, V${y.toString(16)}`;
                        break;
                    case 0x1:
                        decodedOpcode = `OR V${x.toString(16)}, V${y.toString(16)}`;
                        break;
                    case 0x2:
                        decodedOpcode = `AND V${x.toString(16)} V${y.toString(16)}`;
                        break;
                    case 0x3:
                        decodedOpcode = `XOR V${x.toString(16)} V${y.toString(16)}`;
                        break;
                    case 0x4:
                        decodedOpcode = `ADD V${x.toString(16)} V${y.toString(16)}`;
                        break;
                    case 0x5:
                        decodedOpcode = `SUB V${x.toString(16)} V${y.toString(16)}`;
                        break;
                    case 0x6:
                        decodedOpcode = `SHR V${x.toString(16)} V${y.toString(16)}`;
                        break;
                    case 0x7:
                        decodedOpcode = `SUBN V${x.toString(16)} V${y.toString(16)}`;
                        break;
                    case 0xE:
                        decodedOpcode = `SHL V${x.toString(16)} V${y.toString(16)}`;
                        break;
                }
                break;
        }

        if(decodedOpcode === '') {
            throw new Error('Unknown opcode: ' + opcode.toString(16));
        }

        return decodedOpcode;
    }
}