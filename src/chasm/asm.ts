export default class Chip8Assembler {
    opcode(tokens: string[]): number {
        const opcodeString = tokens[0];
        let opcode = 0x0000;

        const parseTrees: { [key: string]: { [key: number]: string[] } } = {
            'SE': { 0x5000: ['register', 'register'], 0x3000: ['register', 'nn'] },
            'SNE': { 0x4000: ['register', 'nn'], 0x9000: ['register', 'register'] },
            // 'LD': {0x6000 :['register', 'nn'], ['register', 'register'], ['I', 'register'], ['DT', 'register'], ['ST', 'register'], ['F', 'register'], ['B', 'register'], ['I', 'register'], ['xI', 'register'], ['Ix', 'register'], ['I', 'nnn'], ['I', 'register']},
            'ADD': { 0x7004: ['register', 'nn'], 0x8004: ['register', 'nn'], 0xF01E: ['I', 'register'] },
            'JMP': { 0x1000: ['nnn'], 0xB000: ['V0', 'nnn'] },
            'CLS': { 0x00E0: [] },
            'RET': { 0x00EE: [] },
            'CALL': { 0x2000: ['nnn'] },
            'OR': { 0x8001: ['register', 'register'] },
            'AND': { 0x8002: ['register', 'register'] },
            'XOR': { 0x8003: ['register', 'register'] },
            'SUB': { 0x8005: ['register', 'register'] },
            'SUBN': { 0x8007: ['register', 'register'] },
            'SHL': { 0x800E: ['register', 'register'] },
            'SHR': { 0x8006: ['register', 'register'] },
            'RND': { 0xC000: ['register', 'nn'] },
            'SKP': { 0xE09E: ['register'] },
            'SKNP': { 0xE0A1: ['register'] },
            'DRW': { 0xD000: ['register', 'register', 'n'] },
        };


        for (const opcodeKey in parseTrees[opcodeString]) {
            let params: number[] = [];
            const parseTree = parseTrees[opcodeString][opcodeKey];

            if (parseTree === null) {
                throw new Error('Unknown command: ' + opcodeString);
            }

            if (parseTree.length === (tokens.length - 1)) {
                let i = 1;
                for (const tokenType of parseTree) {
                    if (tokenType === 'register') {
                        // Validate a well formed token as a register V0-VF
                        const registerToken = tokens[i];
                        if (registerToken.length === 2 && registerToken[0] === 'V') {
                            let register = parseInt(registerToken[1], 16);
                            if (register > 16 || register < 0) {
                                throw new Error('Invalid register: ' + register);
                            }
                            // Success determine register position and skip onto the next token
                            if (i === 1) {
                                register = register << 8;
                            }
                            else if (i === 2) {
                                register = register << 4;
                            }

                            params.push(register);

                            i++;
                            continue;
                        }
                        else {
                            // No match, skip to next parseTree
                            break;
                        }
                    } else if (tokenType === 'nn') {
                        let nn = parseInt(tokens[i], 16);
                        if (nn > 0xFF || nn < 0 || isNaN(nn)) {
                            break;
                        }
                        nn = nn & 0x00FF;
                        params.push(nn);
                        i++;
                        continue;
                    } else if (tokenType === 'nnn') {
                        let nnn = parseInt(tokens[i], 16);
                        if (nnn > 0xFFF || nnn < 0 || isNaN(nnn)) {
                            break;
                        }

                        nnn = nnn & 0x0FFF;
                        params.push(nnn);
                        i++;
                        continue;
                    }
                    else {
                        // Token type is a literal
                        if (tokens[i] !== tokenType) {
                            break;
                        }
                        // Success skip to next token
                        i++;
                        continue;
                    }
                }

                // We hit a match on this parseTree, set the opcode continue on building the opcode
                if (i > parseTree.length) {
                    opcode = parseInt(opcodeKey);

                    // Apply any params to the opcode
                    for (let n = 0; n < params.length; n++) {
                        opcode = opcode | params[n];
                    }

                    break;
                }
            }
            else if (parseTree.length === 0) {
                opcode = parseInt(opcodeKey);
                break;
            }
        }

        if (opcode === 0x0000) {
            throw new Error('Could not determine opcode for : ' + tokens.join(' '));
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

        return opcode;
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