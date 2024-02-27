export default class Chip8Assembler {
    opcodeLookup: { [key: string]: number } = {
        'CLS': 0x00E0,
        'RET': 0x00EE,
        'CALL': 0x2000,
        'SNE': 0x4000,
        'LD': 0x6000,
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
    };

    opcode(tokens: string[]): number {
        const opcodeString = tokens[0];
        let opcode = 0x0000;

        if (!this.opcodeLookup[opcodeString]) {
            const parseTrees: { [key: string]: { [key: number]: string[] } } = {
                'SE': { 0x5000: ['register', 'register'], 0x3000: ['register', 'nn'] },
                'SNE': { 0x4000: ['register', 'nn'], 0x9000: ['register', 'register'] },
                // 'LD': [['register', 'nn'], ['register', 'register'], ['I', 'register'], ['DT', 'register'], ['ST', 'register'], ['F', 'register'], ['B', 'register'], ['I', 'register'], ['xI', 'register'], ['Ix', 'register'], ['I', 'nnn'], ['I', 'register']],
                'ADD': { 0x7004: ['register', 'nn'], 0x8004: ['register', 'nn'], 0xF01E: ['I', 'register'] },
                'JMP': { 0x1000: ['nnn'], 0xB000: ['V0', 'nnn'] },
            };


            for (const opcodeKey in parseTrees[opcodeString]) {
                const parseTree = parseTrees[opcodeString][opcodeKey];

                if (parseTree.length === (tokens.length - 1)) {
                    let i = 1;
                    for (const tokenType of parseTree) {
                        if (tokenType === 'register') {
                            // Validate a well formed token as a register V0-VF
                            const registerToken = tokens[i];
                            if (registerToken.length === 2 && registerToken[0] === 'V') {
                                const register = parseInt(registerToken[1], 16);
                                if (register > 16 || register < 0) {
                                    throw new Error('Invalid register: ' + register);
                                }
                                // Success skip to next token
                                i++;
                                continue;
                            }
                            else {
                                // No match, skip to next parseTree
                                break;
                            }
                        } else if (tokenType === 'nn') {
                            const nn = parseInt(tokens[i], 16);
                            if (nn > 0xFF || nn < 0 || isNaN(nn)) {
                                // No match, skip to next parseTree
                                break;
                            }
                            // Success skip to next token
                            i++;
                            continue;
                        } else if (tokenType === 'nnn') {
                            const nnn = parseInt(tokens[i], 16);
                            if (nnn > 0xFFF || nnn < 0 || isNaN(nnn)) {
                                // No match, skip to next parseTree
                                break;
                            }
                            // Success skip to next token
                            i++;
                            continue;
                        }
                        else {
                            // Token type is a literal
                            if (tokens[i] !== tokenType) {
                                // No match, skip to next parseTree
                                break;
                            }
                            // Success skip to next token
                            i++;
                            continue;
                        }
                    }

                    // We hit a match on this parseTree, set the opcode continue on building the opcode
                    if(i > parseTree.length){
                        opcode = parseInt(opcodeKey);
                        break;
                    }
                }
            }
        }
        else {
            // Naive lookup that works for most tokens
            opcode = this.opcodeLookup[tokens[0]] || 0x0000;
        }
        return opcode;
    }

    params(opcode: number, tokens: string[]): number {
        const paramLookup: { [key: number]: string[] } = {
            0x1000: ['nnn'],
            0xB000: ['ignore', 'nnn'],
            0x00E0: [],
            0x00EE: [],
            0x2000: ['nnn'],
            0x3000: ['register', 'nn'],
            0x5000: ['register', 'register']
        };

        const paramTypes = paramLookup[opcode] || [];

        let params: number[] = [];
        for (let i = 0; i < paramTypes.length; i++) {
            if (paramTypes[i] === 'ignore') {
                continue;
            }
            if (paramTypes[i] === 'nnn') {
                let nnn = parseInt(tokens[i + 1], 16);
                nnn = nnn & 0x0FFF;
                params.push(nnn);
            }
            if (paramTypes[i] === 'nn') {
                let nn = parseInt(tokens[i + 1], 16);
                nn = nn & 0x00FF;
                params.push(nn);
            }
            else if (paramTypes[i] === 'register') {
                let registerToken = tokens[i + 1];

                if (registerToken.length === 2 && registerToken[0] === 'V') {
                    let register = parseInt(registerToken[1], 16);
                    if (register > 16 || register < 0) {
                        throw new Error('Invalid register: ' + register);
                    }

                    switch (i) {
                        case 0:
                            register = register << 8;
                            break;
                        case 1:
                            register = register << 4;
                            break;
                    }

                    params.push(register);
                }
            }
        }

        if (paramTypes.length === 1) {
            opcode = opcode | params[0];
        }
        else if (paramTypes.length === 2) {
            opcode = opcode | params[0] | params[1];
        }
        else if(params.length === 3){
            opcode = opcode | params[0] | params[1] | params[2];
        }

        return opcode;
    }

    tokenize(command: string): string[] {
        let tokens = command.split(' ');
        return tokens;
    }

    parseOpcode(command: string): number {
        let tokens = this.tokenize(command);
        let opcode = this.opcode(tokens);
        let compiledOpcode = this.params(opcode, tokens);

        return compiledOpcode;
    }

    parseProgram(program: string): number[] {
        let commands = program.split('\n');
        let parsedProgram = new Array<number>();
        commands.forEach(command => {
            parsedProgram.push(this.parseOpcode(command));
        });
        return parsedProgram;
    }
}