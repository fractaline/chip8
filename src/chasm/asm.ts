import { Uint8 } from "../chip8vm/Uint8";
import { RegisterIndex } from "./RegisterIndex";

class Chip8Assembler { 
    opcodeLookup: { [key: string]: number } = {
        'CLS': 0x00E0,
        'RET': 0x00EE,
        'SYS': 0x0000,
        'JMP': 0x1000,
        'CALL': 0x2000,
        'SE': 0x3000,
        'SNE': 0x4000,
        'LD': 0x6000,
        'ADD': 0x7000,
        'OR': 0x8001,
        'AND': 0x8002,
        'XOR': 0x8003,
        'SUB': 0x8005,
        'SHR': 0x8006,
        'SUBN': 0x8007,
        'SHL': 0x800E,
        'RND': 0xC000,
        'DRW': 0xD000,
        'SKP': 0xE09E,
        'SKNP': 0xE0A1,
        'LD_I': 0xA000,
        'LD_DT': 0xF007,
        'LD_K': 0xF00A,
        'LD_ST': 0xF018,
        'ADD_I': 0xF01E,
        'LD_F': 0xF029,
        'LD_B': 0xF033,
        'LD_Ix': 0xF055,
        'LD_xI': 0xF065,
    };

    opcode(tokens: string[]): Uint8 {
        const opcode = new Uint8(this.opcodeLookup[tokens[0]] || 0x0000);
        return opcode;
    }

    params(opcode: Uint8, tokens: string[]): Uint8 {
        const paramLookup: { [key: string]: Uint8[] } = {
            'JMP': [new Uint8(parseInt(tokens[1], 16))],
            'CALL': [new Uint8(parseInt(tokens[1], 16))],
            'SE': [new RegisterIndex(parseInt(tokens[1], 16)), new Uint8(parseInt(tokens[2], 16))],
            'SNE': [new RegisterIndex(parseInt(tokens[1], 16)), new Uint8(parseInt(tokens[2], 16))],
            'LD': [new RegisterIndex(parseInt(tokens[1], 16)), new Uint8(parseInt(tokens[2], 16))],
            'ADD': [new RegisterIndex(parseInt(tokens[1], 16)), new RegisterIndex(parseInt(tokens[2], 16))],
            'OR': [new RegisterIndex(parseInt(tokens[1], 16)), new RegisterIndex(parseInt(tokens[2], 16))],
            'AND': [new RegisterIndex(parseInt(tokens[1], 16)), new RegisterIndex(parseInt(tokens[2], 16))],
            'XOR': [new RegisterIndex(parseInt(tokens[1], 16)), new RegisterIndex(parseInt(tokens[2], 16))],
            'SUB': [new RegisterIndex(parseInt(tokens[1], 16)), new RegisterIndex(parseInt(tokens[2], 16))],
            'SHR': [new RegisterIndex(parseInt(tokens[1], 16)), new RegisterIndex(parseInt(tokens[2], 16))],
            'SUBN': [new Uint8(parseInt(tokens[1], 16)), new Uint8(parseInt(tokens[2], 16))],
            'SHL': [new Uint8(parseInt(tokens[1], 16)), new Uint8(parseInt(tokens[2], 16))],
            'RND': [new Uint8(parseInt(tokens[1], 16)), new Uint8(parseInt(tokens[2], 16))],
            'DRW': [new Uint8(parseInt(tokens[1], 16)), new Uint8(parseInt(tokens[2], 16)), new Uint8(parseInt(tokens[3], 16))],
            'SKP': [new Uint8(parseInt(tokens[1], 16))],
            'SKNP': [new Uint8(parseInt(tokens[1], 16))],
            'LD_I': [new Uint8(parseInt(tokens[1], 16))],
            'LD_DT': [new Uint8(parseInt(tokens[1], 16))],
            'LD_K': [new Uint8(parseInt(tokens[1], 16))],
            'LD_ST': [new Uint8(parseInt(tokens[1], 16))],
            'ADD_I': [new Uint8(parseInt(tokens[1], 16))],
            'LD_F': [new Uint8(parseInt(tokens[1], 16))],
            'LD_B': [new Uint8(parseInt(tokens[1], 16))],
            'LD_Ix': [new Uint8(parseInt(tokens[1], 16))],
            'LD_xI': [new Uint8(parseInt(tokens[1], 16))],
        };

        const params = paramLookup[tokens[0]] || [];

        if(params.length === 1){
            opcode = opcode.or(params[0]);
        }
        else if(params.length === 2){
            opcode = opcode.or(params[0].or(params[1]));
        }
        else if(params.length === 3){
            opcode = opcode.or(params[0].or(params[1].or(params[2])));
        }

        return opcode;
    }

    tokenize(command: string): string[] {
        let tokens = command.split(' ');
        return tokens;
    }

    parseOpcode(command: string): Uint8 {
        let tokens = this.tokenize(command);
        let opcode = this.opcode(tokens);
        let compiledOpcode = this.params(opcode, tokens);

        return compiledOpcode;
    }

    parseProgram(program: string): Uint8[] {
        let commands = program.split('\n');
        let parsedProgram = new Array<Uint8>();
        commands.forEach(command => {
            parsedProgram.push(this.parseOpcode(command));
        });
        return parsedProgram;
    }
}